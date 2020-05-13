import utils from '../utils'
import protocols from './protocols'
import { snake2camelJson, camel2snakeJson } from '../../shared/index'
export default class Payment {
  constructor (options = {}) {
    if (!options.appId) throw new Error('appId required')
    if (!options.mchId) throw new Error('mchId required')
    if (!options.key) throw new Error('key required')

    options.signType = options.signType || 'MD5'
    this.options = Object.assign({}, options)

    this._protocols = protocols
    this.baseUrl = 'https://api.mch.weixin.qq.com'
    this.paths = {
      unifiedOrder: '/pay/unifiedorder',
      orderQuery: '/pay/orderquery',
      closeOrder: '/pay/closeorder',
      refund: '/secapi/pay/refund',
      refundQuery: '/pay/refundquery',
      downloadBill: '/pay/downloadbill',
      downloadFundflow: '/pay/downloadfundflow',
      getsignkey: '/pay/getsignkey'
    }
  }

  _getSign (params, type) {
    const str = utils.getSignStr(params) + '&key=' + this.options.key
    switch (type) {
      case 'MD5':
        return utils.md5(str).toUpperCase()
      case 'HMAC-SHA256':
        return utils.sha256(str, this.options.key).toUpperCase()
      default:
        throw new Error('signType Error')
    }
  }

  _normalizeResult (obj, apiName) {
    obj.returnMsg =
      obj.returnMsg || (obj.returnCode === 'SUCCESS' ? 'ok' : 'fail')
    obj.errMsg = `payment.${apiName} ${obj.returnMsg.toLowerCase()}`
    return obj
  }

  _parse (xml, apiName, signType) {
    const json = utils.parseXML(xml)
    if (json.return_code === 'FAIL') throw new Error(`${json.return_msg}`)
    if (apiName !== 'getSandboxKey') {
      if (json.appid !== this.options.appId) throw new Error('appId不匹配')
      if (json.mch_id !== this.options.mchId) throw new Error('mchId不匹配')
      if (json.sign !== this._getSign(json, signType)) throw new Error('返回结果签名错误')
      // 特殊处理appId
      json.app_id = json.appid
      delete json.appid
    }

    if (json.result_code === 'FAIL') { throw new Error(`${json.err_code} ${json.err_code_des}`) }
    return this._normalizeResult(snake2camelJson(json), apiName)
  }

  _parseBill (data, apiName) {
    const result = {}
    if (utils.isXML(data)) {
      const json = utils.parseXML(data)
      if (json.return_code === 'FAIL') throw new Error(`${json.return_msg}`)
      if (json.result_code === 'FAIL') throw new Error(`${json.err_code} ${json.err_code_des}`)
    } else {
      result.returnCode = 'SUCCESS'
      result.content = data
    }
    return this._normalizeResult(result, apiName)
  }

  _getPublicParams () {
    return {
      appid: this.options.appId,
      mchId: this.options.mchId,
      nonceStr: utils.getNonceStr()
    }
  }

  async _requestWxpay (params, apiName, needPfx = false) {
    if (apiName !== 'getSandboxKey') {
      await this._initSandbox()
    }
    const signType = params.signType || this.options.signType
    params = camel2snakeJson(params)
    params.sign = this._getSign(params, signType)
    const requestOptions = {
      method: 'POST',
      dataType: 'text',
      data: utils.buildXML(params),
      timeout: this.options.timeout
    }

    if (needPfx) {
      requestOptions.pfx = this.options.pfx
      requestOptions.passphrase = this.options.mchId
    }

    const { status, data } = await uniCloud.httpclient.request(
      this.options.sandbox ? `${this.baseUrl}/sandboxnew${this.paths[apiName]}` : `${this.baseUrl}${this.paths[apiName]}`,
      requestOptions
    )
    if (status !== 200) throw new Error('request fail')

    if (['downloadBill', 'downloadFundflow'].indexOf(apiName) !== -1) {
      return this._parseBill(data, apiName)
    }
    return this._parse(data, apiName, signType)
  }

  // 暂不公开
  async getSandboxKey () {
    const requestOptions = {
      mchId: this.options.mchId,
      nonceStr: utils.getNonceStr()
    }
    const result = await this._requestWxpay(requestOptions, 'getSandboxKey')
    return result
  }

  async _initSandbox () {
    if (this.options.sandbox && !this.options.sandboxKey) {
      this.options.key = this.options.sandboxKey = await this.getSandboxKey()
        .sandbox_signkey
    }
  }

  async unifiedOrder (params) {
    let defaultTradeType
    switch (this.options.clientType) {
      case 'app-plus':
        defaultTradeType = 'APP'
        break
      case 'mp-weixin':
      default:
        defaultTradeType = 'JSAPI'
        break
    }
    const requestOptions = {
      ...params,
      ...this._getPublicParams(),
      spbillCreateIp: params.spbillCreateIp || '127.0.0.1',
      tradeType: params.tradeType || defaultTradeType
    }
    const result = await this._requestWxpay(requestOptions, 'unifiedOrder')
    return result
  }

  _getPayParamsByPrepayId (prepayId, signType) {
    let requestOptions
    // 请务必注意各个参数的大小写
    switch (this.options.clientType) {
      case 'app-plus':
        requestOptions = {
          appid: this.options.appId,
          noncestr: utils.getNonceStr(),
          package: 'Sign=WXPay',
          partnerid: this.options.mchId,
          prepayid: prepayId,
          timestamp: '' + ((Date.now() / 1000) | 0)
        }
        requestOptions.sign = this._getSign(requestOptions, signType)
        break
      case 'mp-weixin':
        requestOptions = {
          appId: this.options.appId,
          nonceStr: utils.getNonceStr(),
          package: 'prepay_id=' + prepayId,
          timeStamp: '' + ((Date.now() / 1000) | 0)
        }
        // signType也需要sign
        requestOptions.signType = signType
        requestOptions.paySign = this._getSign(requestOptions, signType)
        break
      default:
        throw new Error('不支持的客户端类型，微信支付下单仅支持App、微信小程序')
    }
    return requestOptions
  }

  async getOrderInfo (params) {
    const orderResult = await this.unifiedOrder(params)
    if (!orderResult.prepayId) {
      throw new Error(orderResult.errMsg || '获取prepayId失败')
    }
    return {
      orderInfo: this._getPayParamsByPrepayId(
        orderResult.prepayId,
        params.signType || this.options.signType
      )
    }
  }

  async orderQuery (params) {
    const requestOptions = {
      ...params,
      ...this._getPublicParams()
    }
    const result = await this._requestWxpay(requestOptions, 'orderQuery')
    return result
  }

  async closeOrder (params) {
    const requestOptions = {
      ...params,
      ...this._getPublicParams()
    }
    const result = await this._requestWxpay(requestOptions, 'closeOrder')
    return result
  }

  async refund (params) {
    const requestOptions = {
      ...params,
      ...this._getPublicParams()
    }
    const result = await this._requestWxpay(requestOptions, 'refund', true)
    return result
  }

  async refundQuery (params) {
    const requestOptions = {
      ...params,
      ...this._getPublicParams()
    }
    const result = await this._requestWxpay(requestOptions, 'refundQuery')
    return result
  }

  async downloadBill (params) {
    const requestOptions = {
      ...params,
      ...this._getPublicParams(),
      billType: params.billType || 'ALL'
    }
    const result = await this._requestWxpay(requestOptions, 'downloadBill')
    return result
  }

  async downloadFundflow (params) {
    const requestOptions = {
      ...params,
      ...this._getPublicParams(),
      // 目前仅支持HMAC-SHA256
      signType: params.signType || 'HMAC-SHA256',
      accountType: params.accountType || 'Basic'
    }
    const result = await this._requestWxpay(requestOptions, 'downloadFundflow', true)
    return result
  }

  _verifyNotify (postData, verifySign) {
    let xmlData = postData.body
    if (postData.isBase64Encoded) {
      xmlData = Buffer.from(xmlData, 'base64').toString('utf-8')
    }
    const json = utils.parseXML(xmlData)
    if (json.return_code === 'FAIL') throw new Error(`${json.return_code} ${json.return_msg}`)
    if (json.appid !== this.options.appId) throw new Error('appId不匹配')
    if (json.mch_id !== this.options.mchId) throw new Error('mchId不匹配')
    if (verifySign && json.sign !== this._getSign(json, this.options.signType)) throw new Error('通知验签未通过')
    const result = snake2camelJson(json)
    // 特别处理一下appid为appId
    result.appId = result.appid
    delete result.appid
    return result
  }

  verifyPaymentNotify (postData) {
    return this._verifyNotify(postData, true)
  }

  verifyRefundNotify (postData) {
    const json = this._verifyNotify(postData, false)
    const reqInfo = snake2camelJson(
      utils.parseXML(utils.decryptData(json.reqInfo, utils.md5(this.options.key)))
    )
    Object.assign(json, reqInfo)
    delete json.reqInfo
    return json
  }
}

import AlipayBase from '../alipayBase'
import protocols from './protocols'
export default class Payment extends AlipayBase {
  constructor (options) {
    if (!options.alipayPublicKey) throw new Error('调用支付时需传入支付宝公钥（alipayPublicKey）')
    super(options)
    this._protocols = protocols
  }

  async _request (method, params) {
    const data = {}
    if (params.notifyUrl) {
      data.notifyUrl = params.notifyUrl
      delete params.notifyUrl
    }
    data.bizContent = params
    const result = await this._exec(method, data, {
      validateSign: true
    })
    return result
  }

  // 小程序支付时seller_id、buyer_id都是必填项
  async unifiedOrder (params) {
    const result = await this._request(
      'alipay.trade.create',
      Object.assign({ sellerId: this.options.mchId }, params)
    )
    return result
  }

  async getOrderInfo (params) {
    switch (this.options.clientType) {
      case 'app-plus': {
        const data = {}
        if (params.notifyUrl) {
          data.notifyUrl = params.notifyUrl
          delete params.notifyUrl
        }
        data.bizContent = params
        const signData = this._getSign('alipay.trade.app.pay', data)
        const { url, execParams } = this._formatUrl('', signData)
        const orderInfo = (
          url +
          '&biz_content=' +
          encodeURIComponent(execParams.biz_content)
        ).substr(1)
        return orderInfo
      }
      case 'mp-alipay': {
        const orderResult = await this.unifiedOrder(params)
        if (!orderResult.tradeNo) {
          throw new Error('获取支付宝交易号失败')
        }
        return orderResult.tradeNo
      }
      default:
        throw new Error(
          '不支持的客户端类型，支付宝支付下单仅支持App、支付宝小程序'
        )
    }
  }

  async orderQuery (params) {
    const result = await this._request('alipay.trade.query', params)
    return result
  }

  async cancelOrder (params) {
    const result = await this._request('alipay.trade.cancel', params)
    return result
  }

  async closeOrder (params) {
    const result = await this._request('alipay.trade.close', params)
    return result
  }

  async refund (params) {
    const result = await this._request('alipay.trade.refund', params)
    return result
  }

  async refundQuery (params) {
    const result = await this._request(
      'alipay.trade.fastpay.refund.query',
      params
    )
    return result
  }

  // {"gmt_create":"2020-05-09 10:59:00","charset":"utf-8","seller_email":"payservice@dcloud.io","subject":"DCloud项目捐赠","sign":"fZyNcBGZHUerYrDApdsDaMosoNk/FxMLHDmtheHu9MVsMkLaAz+uJcLA8rSiSP7sT0ajevzNKAoqXnJUkf289NTpSGsEG9sb428k8gAeuQH+8c1XOoPIs4KYRTJkV67F+vQvhlV6r/aSzW2ygJHQ92osHTEPfsHNQKfegFTAJJFES8vgNOV1LkOJZtmFjNxoYS5Z0cwVgrpl/+5avrVNlNIfEbF6VZ8sHNRxycOY7OwJ7QcjTi6qRZqRahtj3wKeFGVmVgsUaixqm4ctw2dy1VjYBWZ6609vfVA9i2Nnkyhoy4pjlWnFKiwt9q3s8rwiiCY22uvqcqWbB30WIJDraw==","buyer_id":"2088702245300430","body":"DCloud致力于打造HTML5最好的移动开发工具，包括终端的Runtime、云端的服务和IDE，同时提供各项配套的开发者服务。","invoice_amount":"0.01","notify_id":"2020050900222110211000431413435818","fund_bill_list":"[{\"amount\":\"0.01\",\"fundChannel\":\"ALIPAYACCOUNT\"}]","notify_type":"trade_status_sync","trade_status":"TRADE_SUCCESS","receipt_amount":"0.01","buyer_pay_amount":"0.01","app_id":"2018121062525175","sign_type":"RSA2","seller_id":"2088801273866834","gmt_payment":"2020-05-09 11:02:11","notify_time":"2020-05-09 14:29:02","version":"1.0","out_trade_no":"1588993139851","total_amount":"0.01","trade_no":"2020050922001400431443283406","auth_app_id":"2018121062525175","buyer_logon_id":"188****5803","point_amount":"0.00"}
  verifyPaymentNotify (postData) {
    return super._verifyNotify(postData)
  }
}

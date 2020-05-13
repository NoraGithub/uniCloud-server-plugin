import { callWxOpenApi, buildUrl } from '../normalize'

export default class Wxacode {
  constructor (options) {
    this.options = Object.assign({}, options)
  }

  async _requestWxOpenapi ({ name, url, data, options }) {
    data.accessToken = data.accessToken || this.options.accessToken
    const defaultOptions = {
      method: 'POST',
      dataType: 'buffer',
      contentType: 'json',
      timeout: this.options.timeout
    }
    const result = await callWxOpenApi({
      name: `wxacode.${name}`,
      url: `${this.options.baseurl}${buildUrl(url, data)}`,
      data,
      options,
      defaultOptions
    })
    return result
  }

  async createQRCode (data) {
    const url = '/cgi-bin/wxaapp/createwxaqrcode'
    const result = await this._requestWxOpenapi({
      name: 'createQRCode',
      url,
      data
    })
    return result
  }

  async get (data) {
    const url = '/wxa/getwxacode'
    const result = await this._requestWxOpenapi({
      name: 'get',
      url,
      data
    })
    return result
  }

  async getUnlimited (data) {
    const url = '/wxa/getwxacodeunlimit'
    const result = await this._requestWxOpenapi({
      name: 'getUnlimited',
      url,
      data
    })
    return result
  }
}

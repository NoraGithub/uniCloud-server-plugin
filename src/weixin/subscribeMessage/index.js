import { callWxOpenApi, buildUrl } from '../normalize'

export default class SubscribeMessage {
  constructor (options) {
    this.options = Object.assign({}, options)
  }

  async _requestWxOpenapi ({ name, url, data, options }) {
    data.accessToken = data.accessToken || this.options.accessToken
    const defaultOptions = {
      method: 'POST',
      dataType: 'json',
      contentType: 'json',
      timeout: this.options.timeout
    }
    const result = await callWxOpenApi({
      name: `subscribeMessage.${name}`,
      url: `${this.options.baseurl}${buildUrl(url, data)}`,
      data,
      options,
      defaultOptions
    })
    return result
  }

  async addTemplate (data) {
    const url = '/wxaapi/newtmpl/addtemplate'
    const result = await this._requestWxOpenapi({
      name: 'addTemplate',
      url,
      data
    })
    return result
  }

  async deleteTemplate (data) {
    const url = '/wxaapi/newtmpl/deltemplate'
    const result = await this._requestWxOpenapi({
      name: 'deleteTemplate',
      url,
      data
    })
    return result
  }

  async getCategory (data) {
    const url = '/wxaapi/newtmpl/getcategory'
    const result = await this._requestWxOpenapi({
      name: 'getCategory',
      url,
      data
    })
    return result
  }

  async getPubTemplateKeyWordsById (data) {
    const url = '/wxaapi/newtmpl/getpubtemplatekeywords'
    const result = await this._requestWxOpenapi({
      name: 'getPubTemplateKeyWordsById',
      url,
      data
    })
    return result
  }

  async getPubTemplateTitleList (data) {
    const url = '/wxaapi/newtmpl/getpubtemplatetitles'
    const result = await this._requestWxOpenapi({
      name: 'getPubTemplateTitleList',
      url,
      data
    })
    return result
  }

  async getTemplateList (data) {
    const url = '/wxaapi/newtmpl/gettemplate'
    const result = await this._requestWxOpenapi({
      name: 'getTemplateList',
      url,
      data
    })
    return result
  }

  async send (data) {
    const url = '/cgi-bin/message/subscribe/send'
    const result = await this._requestWxOpenapi({
      name: 'send',
      url,
      data
    })
    return result
  }
}

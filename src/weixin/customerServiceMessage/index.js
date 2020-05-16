import { getExtension, FormData } from '../../shared/index'
import { callWxOpenApi, buildUrl } from '../normalize'

export default class CustomerServiceMessage {
  constructor (options) {
    this.options = Object.assign({
      baseUrl: 'https://api.weixin.qq.com',
      timeout: 5000
    }, options)
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
      name: `customerServiceMessage.${name}`,
      url: `${this.options.baseUrl}${buildUrl(url, data)}`,
      data,
      options,
      defaultOptions
    })
    return result
  }

  // 接收参数
  // {
  //   access_token: 'xxx',
  //   type: 'image',
  //   media: {
  //     contentType: 'image/png',
  //     value: Buffer
  //   }
  // }
  async uploadTempMedia (data) {
    const url = `/cgi-bin/media/upload?type=${data.type || 'image'}`
    const form = new FormData()
    const media = data.media
    form.append('media', media.value, {
      filename: `${Date.now()}.` + getExtension(media.contentType) || 'png',
      contentType: media.contentType
    })
    const result = await this._requestWxOpenapi({
      name: 'uploadTempMedia',
      url,
      data: {
        accessToken: data.accessToken
      },
      options: {
        content: form.getBuffer(),
        headers: form.getHeaders()
      }
    })
    return result
  }

  async getTempMedia (data) {
    const url = `/cgi-bin/media/get?media_id=${data.mediaId}`
    const result = await this._requestWxOpenapi({
      name: 'getTempMedia',
      url,
      data: {
        accessToken: data.accessToken
      },
      options: {
        method: 'GET',
        dataType: ''
      }
    })
    return result
  }

  async send (data) {
    const url = '/cgi-bin/message/custom/send'
    const result = await this._requestWxOpenapi({
      name: 'send',
      url,
      data
    })
    return result
  }
}

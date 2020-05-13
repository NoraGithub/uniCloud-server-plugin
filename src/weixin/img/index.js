import { getExtension, FormData } from '../../shared/index'
import { callWxOpenApi, buildUrl } from '../normalize'

function parseImageData (data, url) {
  let options = {}
  const { img, imgUrl, accessToken } = data
  if (img) {
    const form = new FormData()
    form.append('img', img.value, {
      filename: `${Date.now()}.` + getExtension(img.contentType) || 'png',
      contentType: img.contentType
    })
    options = {
      content: form.getBuffer(),
      headers: form.getHeaders()
    }
  }
  if (imgUrl) {
    const divider = url.indexOf('?') > -1 ? '&' : '?'
    url += `${divider}img_url=${encodeURIComponent(imgUrl)}`
  }
  return {
    url,
    data: {
      accessToken
    },
    options
  }
}

export default class Img {
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
      name: `img.${name}`,
      url: `${this.options.baseurl}${buildUrl(url, data)}`,
      data,
      options,
      defaultOptions
    })
    return result
  }

  // {
  //   access_token: 'xxx',
  //   img_url: 'image',
  //   img: {
  //     contentType: 'image/png',
  //     value: Buffer
  //   }
  // }
  async aiCrop (data) {
    const url = '/cv/img/aicrop'
    const result = await this._requestWxOpenapi({
      name: 'aiCrop',
      ...parseImageData(data, url)
    })
    return result
  }

  async scanQRCode (data) {
    const url = '/cv/img/qrcode'
    const result = await this._requestWxOpenapi({
      name: 'scanQRCode',
      ...parseImageData(data, url)
    })
    return result
  }

  async superresolution (data) {
    const url = '/cv/img/superresolution'
    const result = await this._requestWxOpenapi({
      name: 'superresolution',
      ...parseImageData(data, url)
    })
    return result
  }
}

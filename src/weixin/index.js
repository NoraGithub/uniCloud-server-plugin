import Auth from './auth/index'
import CustomerServiceMessage from './customerServiceMessage/index'
import Wxacode from './wxacode/index'
import Img from './img/index'

import { createApi } from '../shared/index'
export default class WxApi {
  constructor (options) {
    this.options = Object.assign({}, {
      baseUrl: 'https://api.weixin.qq.com',
      timeout: 5000
    }, options)
    this.auth = createApi(Auth, this.options)
    this.customerServiceMessage = createApi(CustomerServiceMessage, this.options)
    this.wxacode = createApi(Wxacode, this.options)
    this.img = createApi(Img, this.options)
  }
}

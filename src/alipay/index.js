import Auth from './auth/index'
import Payment from './payment/index'

import { createApi } from '../shared/index'

export default class AliApi {
  constructor (options) {
    this.options = Object.assign({}, options)
    this.auth = createApi(Auth, this.options)
    this.payment = createApi(Payment, this.options)
  }
}

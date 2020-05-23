import WxPayment from '../../weixin/payment/index'
import AliPayment from '../../alipay/payment/index'

import { createApi } from '../../shared/index'

export default {
  initWeixin: function (options = {}) {
    options.clientType = options.clientType || __ctx__.PLATFORM
    return createApi(WxPayment, options)
  },
  initAlipay: function (options = {}) {
    options.clientType = options.clientType || __ctx__.PLATFORM
    return createApi(AliPayment, options)
  }
}

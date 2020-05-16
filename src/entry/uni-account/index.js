import WxAuth from '../../weixin/auth/index'
import AliAuth from '../../alipay/auth/index'

import { createApi } from '../../shared/index'

export default {
  initWeixin: function (options = {}) {
    options.clientType = options.clientType || __ctx__.PLATFORM
    return createApi(WxAuth, options)
  },
  initAlipay: function (options = {}) {
    options.clientType = options.clientType || __ctx__.PLATFORM
    return createApi(AliAuth, options)
  }
}

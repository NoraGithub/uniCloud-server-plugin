import WxAccount from '../../weixin/account/index'
import AliAccount from '../../alipay/account/index'

import { createApi } from '../../shared/index'

export default {
  initWeixin: function (options = {}) {
    options.clientType = options.clientType || __ctx__.PLATFORM
    return createApi(WxAccount, options)
  },
  initAlipay: function (options = {}) {
    options.clientType = options.clientType || __ctx__.PLATFORM
    return createApi(AliAccount, options)
  }
}

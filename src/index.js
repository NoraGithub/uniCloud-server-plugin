import WxApi from './weixin/index'
import AliApi from './alipay/index'

export default {
  initWeixin: function (options = {}) {
    options.clientType = options.clientType || __ctx__.PLATFORM
    return new WxApi(options)
  },
  initAlipay: function (options = {}) {
    options.clientType = options.clientType || __ctx__.PLATFORM
    return new AliApi(options)
  }
}

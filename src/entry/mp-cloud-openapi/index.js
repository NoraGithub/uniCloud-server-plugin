import WxApi from '../../weixin/index'
export default {
  initWeixin: function (options = {}) {
    options.clientType = options.clientType || __ctx__.PLATFORM
    return new WxApi(options)
  }
}

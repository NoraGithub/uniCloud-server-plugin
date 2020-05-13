# 参数说明

接收驼峰形式参数，返回驼峰形式参数

## 需要注意的参数

| 参数标准形式 | 需要转化的写法 |                                                                            说明 |
| :----------: | :------------: | ------------------------------------------------------------------------------: |
|    appId     | appid、app_id  | 微信小程序`appId`、微信服务端`appid`、支付宝小程序`appId`、支付宝服务端`app_id` |
|  timestamp   |   timeStamp    |  多数情况下使用`timestamp`，微信小程序客户端`requestPayment`使用的是`timeStamp` |
|    mchId     |     mch_id     |                                            用法与 appId 一致，微信服务端`appid` |

# 平台拉齐

## 支付

### 公共配置

|     参数名      |        类型        |      必填      |                      默认值                       |                  说明                  |   支持平台   |
| :-------------: | :----------------: | :------------: | :-----------------------------------------------: | :------------------------------------: | :----------: |
|      appId      |       String       |       是       |                         -                         |     当前应用在对应支付平台的 appId     | 支付宝、微信 |
|      mchId      |       String       |  微信支付必填  |                         -                         |                 商户号                 |     微信     |
|       key       |       String       |  微信支付必填  |                         -                         |            支付商户 md5 key            |     微信     |
|       pfx       | String&#124;Buffer |  微信支付必填  |                         -                         |     微信支付商户证书，主要用于退款     |     微信     |
|   privateKey    |       String       | 支付宝支付必填 |                         -                         |             应用私钥字符串             |    支付宝    |
|     keyType     |       String       |       否       |                         -                         |           应用私钥字符串类型           |    支付宝    |
| alipayPublicKey |       String       | 支付宝支付必填 |                         -                         |               支付宝公钥               |    支付宝    |
|     timeout     |       Number       |       否       |                       5000                        |        请求超时时间，单位：毫秒        | 支付宝、微信 |
|    signType     |       String       |       否       |         微信支付默认 MD5，支付宝默认 RSA2         |                签名类型                | 支付宝、微信 |
|     sandbox     |      Boolean       |       否       |                       false                       |            是否启用沙箱环境            | 支付宝、微信 |
|   clientType    |       String       |       否       | 默认自动获取客户端类型，同 context 内的 PLATFORM | 客户端类型，主要用于返回客户端支付参数 | 支付宝、微信 |


# protocols规则

不进行递归转化

```js
// 整体转化
apiName: {
    args: function(fromArgs) {
        // 直接转换属性名称的会删除旧属性名
        fromArgs.a = fromArgs.a * 100
        return fromArgs
    }
}

// 参数转化
apiName: {
    args: {
        _pre (args){ // 应用其他转换规则之前处理
            return args
        },
        keyAfter:'keyBefore',
        keyAfter_100: function(fromArgs) {
            // 通过function转化的如需删除旧属性名，需要注意防止其他转换的时候找不到
            return fromArgs.keyBefore * 100 - fromArgs.discount * 100
        },
        // 其他转换执行完毕之后统一处理一次参数，在_post之前执行
        _purify:{
            shouldDelete: ['keyBefore'], // 需删除的字段
        }
        _post (args){ // 应用其他转换规则之后处理
            return args
        },
    }
}
```
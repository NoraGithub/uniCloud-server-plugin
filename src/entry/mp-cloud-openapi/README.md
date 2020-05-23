# openapi简介

`mp-cloud-openapi`是`uniCloud`提供的能简单调用第三方api的方式，开发者无需关心请求发送，加密等，只需要关注输入和输出即可。

调用`mp-cloud-openapi`之前需要先进行初始化，详细使用方式请看下面介绍

# 引入mp-cloud-openapi

<!-- 
// 由npm安装的引入方式
const openapi = require('@dcloudio/mp-cloud-openapi') -->

```js
// 插件市场导入的引入方式
const openapi = require('mp-cloud-openapi')
```

# 微信小程序平台

直接使用微信开放能力，参数名与[微信服务端api](https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html)相对应，只是转为了驼峰形式。返回值也转为了驼峰形式

## 初始化

**入参说明**

|参数名		|类型	|默认值	|必填	|说明																						|
|:-:		|:-:	|:-:	|:-:	|:-:																						|
|appId		|String	|-		|是		|小程序ID																					|
|secret		|String	|-		|-		|小程序密钥																					|
|accessToken|String	|-		|-		|接口调用凭证，`getAccessToken`接口不需要此字段，其他接口可以在初始化时传入，也可以在调用api时传入|

**返回值说明**

返回`openapi`实例用以调用微信开放能力

**示例代码**

```js
const openapiWeixin = openapi.initWeixin({
  appId: 'appId',
  secret: 'secret'
})
```


## 登录授权

### auth.code2Session(String code)

登录功能已移至[uni-account](https://ext.dcloud.net.cn/plugin?id=1834)

### auth.getAccessToken(Object object)

获取小程序全局唯一后台接口调用凭据（`accessToken`）。调用绝大多数后台接口时都需使用 `accessToken`，开发者需要进行妥善保存。

**入参说明**

无

**返回值说明**

|属性					|类型		|说明																						|
|:-:					|:-:		|:-:																						|
|errCode|Number	|错误码，错误码0为成功|
|errMsg	|String	|错误信息							|
|accessToken	|String	|获取到的凭证																		|
|expiresIn		|Number	|凭证有效时间，单位：秒。目前是7200秒之内的值。	|

**错误码说明**

|值		|说明																																						|
|:-:	|:-:																																						|
|-1		|系统繁忙，此时请开发者稍候再试																									|
|0		|请求成功																																				|
|40001|AppSecret 错误或者 AppSecret 不属于这个小程序，请开发者确认 AppSecret 的正确性	|
|40002|请确保 grant_type 字段值为 client_credential																		|
|40013|不合法的 AppID，请开发者检查 AppID 的正确性，避免异常字符，注意大小写					|

**示例代码**

```js
const {
  accessToken: 'xxxxx',
  expiresIn
} = await openapiWeixin.auth.getAccessToken()
```

**注意**

- `accessToken`的存储至少要保留`512`个字符空间；
- `accessToken`的有效期目前为`2`个小时，需定时刷新，重复获取将导致上次获取的`accessToken`失效；
- 建议开发者统一获取和刷新`accessToken`，不应该各自去刷新，否则容易造成冲突，导致`accessToken`覆盖而影响业务；
- `accessToken` 的有效期通过返回的`expireIn`来传达，目前是7200秒之内的值，需要根据这个有效时间提前去刷新。在刷新过程中，可对外继续输出旧的`accessToken`，此时公众平台后台会保证在5分钟内，新老`accessToken`都可用，这保证了第三方业务的平滑过渡；
- `accessToken`的有效时间可能会在未来有调整，所以中控服务器不仅需要内部定时主动刷新，还需要提供被动刷新`accessToken`的接口，这样便于业务服务器在API调用获知`accessToken`已超时的情况下，可以触发`accessToken`的刷新流程。

### auth.getPaidUnionId(Object object)

用户支付完成后，获取该用户的`UnionId`，无需用户授权。本接口支持第三方平台代理查询。

注意：调用前需要用户完成支付，且在支付后的五分钟内有效。

**入参说明**

|参数名					|类型		|默认值	|必填	|说明																				|
|:-:						|:-:		|:-:			|:-:		|:-:																				|
|accessToken		|String	|-				|是			|接口调用凭证																|
|openid					|String	|-				|是			|支付用户唯一标识														|
|transactionId	|String	|-				|-			|微信支付订单号															|
|mchId					|String	|-				|-			|微信支付分配的商户号，和商户订单号配合使用	|
|outTradeNo		|String	|-				|-			|微信支付商户订单号，和商户号配合使用				|

**返回值说明**

|属性		|类型		|说明									|
|:-:		|:-:		|:-:									|
|errCode|Number	|错误码，错误码0为成功|
|errMsg	|String	|错误信息							|
|unionid|String	|用户唯一标识					|

**错误码说明**

|值		|说明														|
|:-:	|:-:														|
|-1		|系统繁忙，此时请开发者稍候再试	|
|0		|请求成功												|
|40003|openid 错误										|
|89002|没有绑定开放平台帐号						|
|89300|订单无效												|

**示例代码**

```js
// 使用微信支付订单号
const {
  unionid
} = await openapiWeixin.auth.getPaidUnionId({
  accessToken: 'xxxxx',
  openid: 'xxxxx',
  transactionId: 'xxxxx'
})

// 使用商户订单号
const {
  unionid
} = await openapiWeixin.auth.getPaidUnionId({
  accessToken: 'xxxxx',
  openid: 'xxxxx',
  mchId: 'xxxxx',
  outTradeNo: 'xxxxx'
})
```


## 客服消息

### customerServiceMessage.getTempMedia

获取客服消息内的临时素材。即下载临时的多媒体文件。目前小程序仅支持下载图片文件。

**入参说明**

|属性				|类型		|默认值	|必填	|说明					|
|:-:				|:-:		|:-:		|:-:	|:-:					|
|accessToken|String	|				|是		|接口调用凭证	|
|mediaId		|String	|				|是		|媒体文件 ID	|

**返回值说明**

|属性				|类型		|说明									|
|:-:				|:-:		|:-:									|
|errCode		|Number	|错误码，错误码0为成功|
|errMsg			|String	|错误信息							|
|contentType|String	|数据类型 (MIME Type)	|
|buffer			|Buffer	|数据 Buffer					|

**错误码说明**

|值		|说明						|
|:-:	|:-:						|
|40007|无效媒体文件 ID|

**使用示例**

```js
openapiWeixin.customerServiceMessage.getTempMedia({
  accessToken: 'xxx',
  mediaId: ''
})
```

### customerServiceMessage.send

发送客服消息给用户。详细规则见 发送客服消息

**入参说明**

|属性						|类型		|默认值	|必填	|说明																					|
|:-:						|:-:		|:-:		|:-:	|:-:																					|
|accessToken		|String	|				|是		|接口调用凭证																	|
|touser					|String	|				|是		|用户的 OpenID																|
|msgtype				|String	|				|是		|消息类型																			|
|text						|Object	|				|是		|文本消息，msgtype="text" 时必填							|
|image					|Object	|				|是		|图片消息，msgtype="image" 时必填							|
|link						|Object	|				|是		|图文链接，msgtype="link" 时必填							|
|miniprogrampage|Object	|				|是		|小程序卡片，msgtype="miniprogrampage" 时必填	|

**msgtype 的合法值**

|值							|说明				|
|:-:						|:-:				|
|text						|文本消息		|
|image					|图片消息		|
|link						|图文链接		|
|miniprogrampage|小程序卡片	|

**text 的结构**

|属性		|类型		|默认值	|必填	|说明					|
|:-:		|:-:		|:-:		|:-:	|:-:					|
|content|string	|				|是		|文本消息内容	|

**image 的结构**

|属性		|类型		|默认值	|必填	|说明																											|
|:-:		|:-:		|:-:		|:-:	|:-:																											|
|mediaId|string	|				|是		|发送的图片的媒体ID，通过 新增素材接口 上传图片文件获得。	|

**link 的结构**

|属性				|类型		|默认值	|必填	|说明																																									|
|:-:				|:-:		|:-:		|:-:	|:-:																																									|
|title			|string	|				|是		|消息标题																																							|
|description|string	|				|是		|图文链接消息																																					|
|url				|string	|				|是		|图文链接消息被点击后跳转的链接																												|
|thumbUrl		|string	|				|是		|图文链接消息的图片链接，支持 JPG、PNG 格式，较好的效果为大图 640 X 320，小图 80 X 80	|

**miniprogrampage 的结构**

|属性					|类型		|默认值	|必填	|说明																																																	|
|:-:					|:-:		|:-:		|:-:	|:-:																																																	|
|title				|string	|				|是		|消息标题																																															|
|pagepath			|string	|				|是		|小程序的页面路径，跟app.json对齐，支持参数，比如pages/index/index?foo=bar														|
|thumbMediaId	|string	|				|是		|小程序消息卡片的封面， image 类型的 media_id，通过 新增素材接口 上传图片文件获得，建议大小为 520*416	|

**返回值说明**

|属性		|类型		|说明												|
|:-:		|:-:		|:-:												|
|errCode|number	|错误码，错误码0为成功|
|errMsg	|string	|错误信息										|

**错误码说明**

|值		|说明																																																																		|
|:-:	|:-:																																																																		|
|0		|请求成功																																																																|
|-1		|系统繁忙，此时请开发者稍候再试																																																					|
|40001|获取 access_token 时 AppSecret 错误，或者 access_token 无效。请开发者认真比对 AppSecret 的正确性，或查看是否正在为恰当的小程序调用接口	|
|40002|不合法的凭证类型																																																												|
|40003|不合法的 OpenID，请开发者确认 OpenID 是否是其他小程序的 OpenID|																																																																				|
|45015|回复时间超过限制																																																												|
|45047|客服接口下行条数超过上限																																																								|
|48001|API 功能未授权，请确认小程序已获得该接口																																																|

**使用示例**

```js
openapiWeixin.customerServiceMessage.getTempMedia({
  accessToken: 'xxx',
  mediaId: ''
})
```

### customerServiceMessage.setTyping

下发客服当前输入状态给用户。

**入参说明**

|属性					|类型		|默认值	|必填	|说明					|
|:-:					|:-:		|:-:		|:-:	|:-:					|
|accessToken	|String	|				|是		|接口调用凭证	|
|touser				|String	|				|是		|用户的 OpenID|
|command			|String	|				|是		|命令					|

**command 的合法值**

|值						|说明												|
|:-:					|:-:												|
|Typing				|对用户下发"正在输入"状态		|
|CancelTyping	|取消对用户的"正在输入"状态	|

**返回值说明**

|属性		|类型		|说明									|
|:-:		|:-:		|:-:									|
|errCode|Number	|错误码，错误码0为成功|
|errMsg	|String	|错误信息							|

**错误码说明**

|值		|说明																						|
|:-:	|:-:																						|
|45072|command字段取值不对														|
|45080|下发输入状态，需要之前30秒内跟用户有过消息交互	|
|45081|已经在输入状态，不可重复下发										|

### customerServiceMessage.uploadTempMedia

把媒体文件上传到微信服务器。目前仅支持图片。用于发送客服消息或被动回复用户消息。

|属性				|类型			|默认值	|必填	|说明					|
|:-:				|:-:			|:-:		|:-:	|:-:					|
|accessToken|string		|				|是		|接口调用凭证	|
|type				|string		|				|是		|文件类型			|
|media			|FormData	|				|是		|媒体文件数据	|

**type 的合法值**

|值		|说明	|
|:-:	|:-:	|
|image|图片	|

**media 结构说明**

|属性				|类型		|默认值	|必填	|说明											|
|:-:				|:-:		|:-:		|:-:	|:-:											|
|contentType|string	|				|是		|数据类型，传入 MIME Type	|
|value			|Buffer	|				|是		|文件 Buffer							|

**返回值说明**

|属性			|类型		|说明																	|
|:-:			|:-:		|:-:																	|
|errCode	|Number	|错误码，错误码0为成功								|
|errMsg		|String	|错误信息															|
|type			|String	|文件类型															|
|mediaId	|String	|媒体文件上传后，获取标识，3天内有效。|
|createdAt|Number	|媒体文件上传时间戳										|

**错误码说明**

|值		|说明							|
|:-:	|:-:							|
|40004|无效媒体文件类型	|

**使用示例**

```js
openapiWeixin.customerServiceMessage.uploadTempMedia({
  accessToken: 'xxx',
  type: 'image',
  media: {
    contentType: 'image/png',
    value: Buffer
  }
})
```

## 小程序码

### wxacode.createQRCode

获取小程序二维码，适用于需要的码数量较少的业务场景。通过该接口生成的小程序码，永久有效，有数量限制.

```
openapiWeixin.wxacode.createQRCode
```

**入参说明**

| 属性	| 类型	| 默认值| 必填| 说明																										|
| ---		| ---		| ---		| ---	| ---																											|
| path	| string|				| 是	| 扫码进入的小程序页面路径，最大长度 128 字节，不能为空。	|
| width	| number| 430		| 否	| 二维码的宽度，单位 px。最小 280px，最大 1280px					|

**返回值说明**

包含二进制数据及其数据类型的对象

| 属性				| 类型																				| 说明								|
| ---					| ---																					| ---									|
| contentType	| String																			| 数据类型 (MIME Type)|
| buffer			| [Buffer](https://nodejs.org/api/buffer.html)| 数据 Buffer					|
| errCode			| number																			| 错误码							|
| errMsg			| string																			| 错误信息						|

**使用示例**

```js
exports.main = async (event, context) => {
  try {
    const result = await openapiWeixin.wxacode.createQRCode({
        path: 'page/index/index',
        width: 430
      })
    return result
  } catch (err) {
    return err
  }
}
```

### wxacode.get

获取小程序码，适用于需要的码数量较少的业务场景。**通过该接口生成的应用码，永久有效，有数量限制**.

**入参说明**

| 属性			| 类型		| 默认值							| 必填| 说明																																														|
| ---				| ---			| ---									| ---	| ---																																															|
| path			| String	|											| 是	| 扫码进入的应用页面路径，最大长度 128 字节，不能为空																							|
| width			| Number	| 430									| 否	| 二维码的宽度，单位 px。最小 280px，最大 1280px																									|
| autoColor	| Boolean	| false								| 否	| 自动配置线条颜色，如果颜色依然是黑色，则说明不建议配置主色调																		|
| lineColor	| Object	| {"r":0,"g":0,"b":0}	| 否	| auto_color 为 false 时生效，使用 rgb 设置颜色 例如 `{"r":"xxx","g":"xxx","b":"xxx"}` 十进制表示	|
| isHyaline	| Boolean	| false								| 否	| 是否需要透明底色，为 true 时，生成透明底色的应用码																							|

**返回值说明**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| contentType | String | 数据类型 (MIME Type) |
| buffer | [Buffer](https://nodejs.org/api/buffer.html) | 数据 Buffer |
| errCode | Number | 错误码 |
| errMsg | String | 错误信息 |

**使用示例**

```js
exports.main = async (event, context) => {
  try {
    const result = await openapiWeixin.wxacode.get({
        path: 'page/index/index',
        width: 430
      })
    return result
  } catch (err) {
    return err
  }
}
```

### wxacode.getUnlimited

获取小程序码，适用于需要的码数量极多的业务场景。**通过该接口生成的应用码，永久有效，数量暂无限制。** 

**入参说明**

| 属性 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| scene | String |  | 是 | 最大32个可见字符，只支持数字，大小写英文以及部分特殊字符：`!#><'()*+,/:;=?@-._~`，其它字符请自行编码为合法字符（因不支持`%`，中文无法使用 `urlencode` 处理，请使用其他编码方式） |
| page | String | 主页 | 否 | 必须是已经发布的应用存在的页面（否则报错），例如 `pages/index/index`, 根路径前不要填加 `/`,不能携带参数（参数请放在scene字段里），如果不填写这个字段，默认跳主页面 |
| width | Number | 430 | 否 | 二维码的宽度，单位 px，最小 280px，最大 1280px |
| autoColor | Boolean | false | 否 | 自动配置线条颜色，如果颜色依然是黑色，则说明不建议配置主色调，默认 false |
| lineColor | Object | {"r":0,"g":0,"b":0} | 否 | auto_color 为 false 时生效，使用 rgb 设置颜色 例如 `{"r":"xxx","g":"xxx","b":"xxx"}` 十进制表示 |
| isHyaline | Boolean | false | 否 | 是否需要透明底色，为 true 时，生成透明底色的应用 |

**返回值说明**

包含二进制数据及其数据类型的对象

| 属性			| 类型											| 说明					|
| ---			| ---											| ---					|
| contentType	| String										| 数据类型 (MIME Type)	|
| buffer		| [Buffer](https://nodejs.org/api/buffer.html)	| 数据 Buffer			|
| errCode		| Number										| 错误码				|
| errMsg		| String										| 错误信息				|

**使用示例**

```js
exports.main = async (event, context) => {
  try {
    const result = await openapiWeixin.wxacode.getUnlimited({
        path: 'page/index/index',
        width: 430
      })
    return result
  } catch (err) {
    return err
  }
}
```

## 图像处理

### img.aiCrop

**入参说明**

| 属性	| 类型		| 默认值| 必填	| 说明																							|
| ---	| ---		| ---	| ---	| ---																							|
| imgUrl| String	|		| -	| 要检测的图片 url，传这个则不用传 img 参数。													|
| img	| FormData	|		| -	| form-data 中媒体文件标识，有filename、filelength、content-type等信息，传这个则不用传 imgUrl。|

**img 的结构**

| 属性			| 类型	| 默认值| 必填	| 说明						|
| ---			| ---	| ---	| ---	| ---						|
| contentType	| String|		| 是	| 数据类型，传入 MIME Type	|
| value			| Buffer|		| 是	| 文件 Buffer				|

**返回值说明**

| 属性		| 类型	| 说明		|
| ---		| ---	| ---		|
| errCode	| String| 错误码	|
| errMsg	| String| 错误信息	|
|result		|Array	|裁剪结果	|
|imgSize	|Object	|图像尺寸	|

**使用示例**

```js
openapiWeixin.img.aiCrop({
	img: {
	  contentType: 'image/png',
	  value: Buffer
	}
})
```

**返回数据示例**

```
{
   "errcode": 0,
   "errmsg": "ok",
   "results": [ //智能裁剪结果
   {
       "cropLeft": 112,
       "cropTop": 0,
       "cropRight": 839,
       "cropBottom": 727
   },
   {
       "cropLeft": 0,
       "cropTop": 205,
       "cropRight": 965,
       "cropBottom": 615
   }
   ],
   "imgSize": { //图片大小
       "w": 966,
       "h": 728
   }
}
```

### img.scanQRCode

**入参说明**

| 属性	| 类型		| 默认值| 必填	| 说明																							|
| ---	| ---		| ---	| ---	| ---																							|
| imgUrl| String	|		| 是	| 要检测的图片 url，传这个则不用传 img 参数。													|
| img	| FormData	|		| 是	| form-data 中媒体文件标识，有filename、filelength、content-type等信息，传这个则不用传 img_url。|

**img 的结构**

| 属性 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| contentType | String |  | 是 | 数据类型，传入 MIME Type |
| value | Buffer |  | 是 | 文件 Buffer |

**返回值说明**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| errCode | String | 错误码 |
| errMsg | String | 错误信息 |


**注意事项**

- 文件大小限制：小于2M
- 支持条码、二维码、DataMatrix和PDF417的识别。 二维码、DataMatrix会返回位置坐标，条码和PDF417暂不返回位置坐标。


**使用示例**

```js
exports.main = async (event, context) => {
    const result = await openapiWeixin.img.scanQRCode({
		img: {
			contentType: 'image/png',
			value: Buffer
		}
	})
}
```

**返回数据示例**

```
{
    "errCode": 0,
    "errMsg": "ok",
    "codeResults": [
        {
            "typeName": "QR_CODE",
            "data": "http://www.qq.com",
            "pos": {
                "leftTop": {
                    "x": 585,
                    "y": 378
                },
                "rightTop": {
                    "x": 828,
                    "y": 378
                },
                "rightBottom": {
                    "x": 828,
                    "y": 618
                },
                "leftBottom": {
                    "x": 585,
                    "y": 618
                }
            }
        },
        {
            "typeName": "QR_CODE",
            "data": "https://mp.weixin.qq.com",
            "pos": {
                "leftTop": {
                    "x": 185,
                    "y": 142
                },
                "rightTop": {
                    "x": 396,
                    "y": 142
                },
                "rightBottom": {
                    "x": 396,
                    "y": 353
                },
                "leftBottom": {
                    "x": 185,
                    "y": 353
                }
            }
        },
        {
            "typeName": "EAN_13",
            "data": "5906789678957"
        },
        {
            "typeName": "CODE_128",
            "data": "50090500019191"
        }
    ],
    "imgSize": {
        "w": 1000,
        "h": 900
    }
}
```

### img.superresolution

**入参说明**

| 属性 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| imgUrl | String |  | 是 | 要检测的图片 url，传这个则不用传 img 参数。 |
| img | FormData |  | 是 | form-data 中媒体文件标识，有filename、filelength、content-type等信息，传这个则不用传 img_url。 |

**img 的结构**

| 属性 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| contentType | String |  | 是 | 数据类型，传入 MIME Type |
| value | Buffer |  | 是 | 文件 Buffer |

**返回值说明**

| 属性		| 类型	| 说明		|
| ---		| ---	| ---		|
| errCode	| String| 错误码	|
| errMsg	| String| 错误信息	|
|mediaId	|String	|媒体文件Id	|

**注意事项**

- 文件大小限制：小于2M 图片支持使用img参数实时上传，也支持使用imgUrl参数传送图片地址，由微信后台下载图片进行识别。 目前支持将图片超分辨率高清化2倍，即生成图片分辨率为原图2倍大小

**使用示例**

```js
exports.main = async (event, context) => {
    const result = await openapiWeixin.img.superresolution({
		img: {
			contentType: 'image/png',
			value: Buffer
		}
	})
}
```

**返回数据示例**

```
{
    "errcode": 0,
    "errmsg": "ok",
    "mediaId": "6WXsIXkG7lXuDLspD9xfm5dsvHzb0EFl0li6ySxi92ap8Vl3zZoD9DpOyNudeJGB"
}
```


# 统一支付

支付功能已移至[unipay](https://ext.dcloud.net.cn/plugin?id=1835)
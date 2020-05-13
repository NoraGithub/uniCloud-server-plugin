# openapi简介

`openapi`是`uniCloud`提供的能简单调用第三方api的方式，开发者无需关心请求发送，加密等，只需要关注输入和输出即可。

调用`openapi`之前需要先进行初始化，详细使用方式请看下面介绍

# 微信小程序平台

直接使用微信开放能力，参数名与[微信服务端api](https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html)相对应，只是转为了驼峰形式。返回值也转为了驼峰形式

## 初始化

**入参说明**

|参数名		|类型	|默认值	|必填	|说明																						|
|:-:		|:-:	|:-:	|:-:	|:-:																						|
|appId		|String	|-		|是		|小程序ID																					|
|secret		|String	|-		|-		|小程序密钥																					|
|accessToken|String	|-		|-		|接口调用凭证，登录授权内的接口不需要此字段，其他接口可以在初始化时传入，也可以在调用api时传入|

**返回值说明**

返回`openapi`实例用以调用微信开放能力

**示例代码**

```js
const uniCloudOpenapi = require('@dcloudio/unicloud-openapi')
const openapi = uniCloudOpenapi.initWeixin({
  appId: 'appId',
  secret: 'secret'
})
```


## 登录授权

### auth.getOpenid(String code)

使用微信小程序`login`返回的`code`获取`openid`，`unionid`等信息

**入参说明**

|参数名	|类型		|默认值	|必填	|说明										|
|:-:		|:-:		|:-:		|:-:	|:-:										|
|code		|String	|-			|是		|uni.login获取的用户code|

**返回值说明**

|属性				|类型		|说明																																																																																								|
|:-:				|:-:		|:-:																																																																																								|
|errCode		|Number	|错误码，错误码0为成功																																																																															|
|errMsg			|String	|错误信息																																																																																						|
|openid			|String	|用户唯一标识																																																																																				|
|sessionKey	|String	|会话密钥																																																																																						|
|unionid		|String	|用户在开放平台的唯一标识符，在满足 UnionID 下发条件的情况下会返回，详见 [UnionID 机制说明](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/union-id.html)。|
|

**错误码说明**

|值		|说明														|
|:-:	|:-:														|
|-1		|系统繁忙，此时请开发者稍候再试	|
|0		|请求成功												|
|40029|code 无效											|
|45011|频率限制，每个用户每分钟100次	|

**示例代码**

```js
const {
  openid,
  sessionKey,
  unionid
} = await openapi.auth.code2Session(code)
```

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
} = await openapi.auth.getAccessToken()
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
} = await openapi.auth.code2Session({
  accessToken: 'xxxxx',
  openid: 'xxxxx',
  transactionId: 'xxxxx'
})

// 使用商户订单号
const {
  unionid
} = await openapi.auth.code2Session({
  accessToken: 'xxxxx',
  openid: 'xxxxx',
  mchId: 'xxxxx',
  outTradeNo: 'xxxxx'
})
```


## 数据分析

### analysis.getDailyRetain(Object object)

获取用户访问小程序日留存

**入参说明**

|属性				|类型		|默认值	|必填	|说明											|
|:-:				|:-:		|:-:		|:-:	|:-:											|
|accessToken|String	|				|是		|接口调用凭证							|
|beginDate	|String	|				|是		|开始日期。格式为 yyyymmdd|
|endDate		|String	|				|是		|结束日期，格式为 yyyymmdd|

`endDate`最大为昨日，`beginDate`必须为`endDate`的前一天

**返回值说明**

|属性				|类型		|说明									|
|:-:				|:-:		|:-:									|
|errCode		|Number	|错误码，错误码0为成功|
|errMsg			|String	|错误信息							|
|refDate		|String	|日期									|
|visitUvNew	|Object	|新增用户留存					|
|visitUv		|Object	|活跃用户留存					|

**visitUvNew结构**

|属性	|类型		|说明																																							|
|:-:	|:-:		|:-:																																							|
|key	|Number	|标识，0开始，表示当天，1表示1天后。依此类推，key取值分别是：0,1,2,3,4,5,6,7,14,30|
|value|Number	|key对应日期的新增用户数/活跃用户数（key=0时）或留存用户数（k&gt;0时）								|

**visitUv结构**

|属性	|类型		|说明																																							|
|:-:	|:-:		|:-:																																							|
|key	|Number	|标识，0开始，表示当天，1表示1天后。依此类推，key取值分别是：0,1,2,3,4,5,6,7,14,30|
|value|Number	|key对应日期的新增用户数/活跃用户数（key=0时）或留存用户数（k&gt;0时）								|

**示例代码**

```js
const res = await openapi.analysis.getDailyRetain({
  accessToken: 'xxxxx',
  beginDate: 'yyyymmdd',
  endDate: 'yyyymmdd'
})
```

### analysis.getMonthlyRetain(Object object)

获取用户访问小程序月留存

**入参说明**

|属性				|类型		|默认值	|必填	|说明											|
|:-:				|:-:		|:-:		|:-:	|:-:											|
|accessToken|string	|				|是		|接口调用凭证							|
|beginDate	|string	|				|是		|开始日期，格式为 yyyymmdd|
|endDate		|string	|				|是		|结束日期，格式为 yyyymmdd|

`beginDate`必须为月初，`endDate`必须为月末，限定查询一个月的数据。

**返回值说明**

|属性				|类型		|说明									|
|:-:				|:-:		|:-:									|
|errCode		|Number	|错误码，错误码0为成功|
|errMsg			|String	|错误信息							|
|refDate		|string	|时间，如："201702"		|
|visitUvNew	|Object	|新增用户留存					|
|visitUv		|Object	|活跃用户留存					|

**visitUvNew的结构**

|属性	|类型		|说明																																|
|:-:	|:-:		|:-:																																|
|key	|number	|标识，0开始，表示当月，1表示1月后。key取值分别是：0,1							|
|value|number	|key对应日期的新增用户数/活跃用户数（key=0时）或留存用户数（k&gt;0时）	|

**visitUv的结构**

|属性	|类型		|说明																																|
|:-:	|:-:		|:-:																																|
|key	|number	|标识，0开始，表示当月，1表示1月后。key取值分别是：0,1							|
|value|number	|key对应日期的新增用户数/活跃用户数（key=0时）或留存用户数（k&gt;0时）	|

**使用示例**

```js
const res = await cloud.openapi.analysis.getMonthlyRetain({
  accessToken: 'xxxxx',
  beginDate: 'yyyymmdd',
  endDate: 'yyyymmdd'
})
```

### analysis.getWeeklyRetain(Object object)

获取用户访问小程序周留存

**入参说明**

|属性				|类型		|默认值	|必填	|说明											|
|:-:				|:-:		|:-:		|:-:	|:-:											|
|accessToken|string	|				|是		|接口调用凭证							|
|beginDate	|string	|				|是		|开始日期，格式为 yyyymmdd|
|endDate		|string	|				|是		|结束日期，格式为 yyyymmdd|

`beginDate`必须为周一，`endDate`必须为周日

**返回值说明**

|属性				|类型		|说明													|
|:-:				|:-:		|:-:													|
|errCode		|Number	|错误码，错误码0为成功				|
|errMsg			|String	|错误信息											|
|refDate		|string	|时间，如："20170306-20170312"|
|visitUvNew	|Object	|新增用户留存									|
|visitUv		|Object	|活跃用户留存									|

**visitUvNew 的结构**

|属性	|类型		|说明																																|
|:-:	|:-:		|:-:																																|
|key	|number	|标识，0开始，表示当周，1表示1周后。依此类推，取值分别是：0,1,2,3,4	|
|value|number	|key对应日期的新增用户数/活跃用户数（key=0时）或留存用户数（k&gt;0时）	|

**visitUv 的结构**

|属性	|类型		|说明																																|
|:-:	|:-:		|:-:																																|
|key	|number	|标识，0开始，表示当周，1表示1周后。依此类推，取值分别是：0,1,2,3,4	|
|value|number	|key对应日期的新增用户数/活跃用户数（key=0时）或留存用户数（k&gt;0时）	|

**使用示例**

```js
const res = await openapi.analysis.getWeeklyRetain({
  accessToken: 'xxxxx',
  beginDate: 'yyyymmdd',
  endDate: 'yyyymmdd'
})
```

### analysis.getDailySummary(Object object)

获取用户访问小程序数据概况

**入参说明**

|属性				|类型		|默认值	|必填	|说明											|
|:-:				|:-:		|:-:		|:-:	|:-:											|
|accessToken|string	|				|是		|接口调用凭证							|
|beginDate	|string	|				|是		|开始日期。格式为 yyyymmdd|
|endDate		|string	|				|是		|结束日期。格式为 yyyymmdd|

`endDate`最大为昨日，`beginDate`必须为`endDate`的前一天

**返回值说明**

|属性		|类型									|说明									|
|:-:		|:-:									|:-:									|
|errCode|Number								|错误码，错误码0为成功|
|errMsg	|String								|错误信息							|
|list		|Array.&lt;Object&gt;	|数据列表							|

**list 的结构**

|属性				|类型		|说明									|
|:-:				|:-:		|:-:									|
|refDate		|string	|日期，格式为 yyyymmdd|
|visitTotal	|number	|累计用户数						|
|sharePv		|number	|转发次数							|
|shareUv		|number	|转发人数							|

**使用示例**

```js
const result = await cloud.openapi.analysis.getDailySummary({
  accessToken: 'xxxxx',
  beginDate: 'yyyymmdd',
  endDate: 'yyyymmdd'
})
```

### analysis.getDailyVisitTrend(Object object)

获取用户访问小程序数据日趋势

**入参说明**

|属性				|类型		|默认值	|必填	|说明											|
|:-:				|:-:		|:-:		|:-:	|:-:											|
|accessToken|string	|				|是		|接口调用凭证							|
|beginDate	|string	|				|是		|开始日期。格式为 yyyymmdd|
|endDate		|string	|				|是		|结束日期。格式为 yyyymmdd|

`endDate`最大为昨日，`beginDate`必须为`endDate`的前一天

**返回值说明**

|属性		|类型									|说明									|
|:-:		|:-:									|:-:									|
|errCode|Number								|错误码，错误码0为成功|
|errMsg	|String								|错误信息							|
|list		|Array.&lt;Object&gt;	|数据列表							|

**list 的结构**

|属性						|类型		|说明														|
|:-:						|:-:		|:-:														|
|refDate				|string	|日期，格式为 yyyymmdd					|
|sessionCnt			|number	|打开次数												|
|visitPv				|number	|访问次数												|
|visitUv				|number	|访问人数												|
|visitUvNew			|number	|新用户数												|
|stayTimeUv			|number	|人均停留时长 (浮点型，单位：秒)|
|stayTimeSession|number	|次均停留时长 (浮点型，单位：秒)|
|visitDepth			|number	|平均访问深度 (浮点型)					|

**使用示例**

```js
const result = await cloud.openapi.analysis.getDailyVisitTrend({
  accessToken: 'xxxxx',
  beginDate: 'yyyymmdd',
  endDate: 'yyyymmdd'
})
```

### analysis.getMonthlyVisitTrend(Object object)

获取用户访问小程序数据月趋势

**入参说明**

|属性				|类型		|默认值	|必填	|说明											|
|:-:				|:-:		|:-:		|:-:	|:-:											|
|accessToken|string	|				|是		|接口调用凭证							|
|beginDate	|string	|				|是		|开始日期。格式为 yyyymmdd|
|endDate		|string	|				|是		|结束日期。格式为 yyyymmdd|

`beginDate`必须为月初，`endDate`必须为月末，限定查询一个月的数据。

**返回值说明**

|属性		|类型									|说明									|
|:-:		|:-:									|:-:									|
|errCode|Number								|错误码，错误码0为成功|
|errMsg	|String								|错误信息							|
|list		|Array.&lt;Object&gt;	|数据列表							|

**list 的结构**

|属性						|类型		|说明															|
|:-:						|:-:		|:-:															|
|refDate				|string	|时间，格式为 yyyymm，如："201702"|
|sessionCnt			|number	|打开次数（自然月内汇总）					|
|visitPv				|number	|访问次数（自然月内汇总）					|
|visitUv				|number	|访问人数（自然月内去重）					|
|visitUvNew			|number	|新用户数（自然月内去重）					|
|stayTimeUv			|number	|人均停留时长 (浮点型，单位：秒)	|
|stayTimeSession|number	|次均停留时长 (浮点型，单位：秒)	|
|visitDepth			|number	|平均访问深度 (浮点型)						|

**使用示例**

```js
const result = await cloud.openapi.analysis.getMonthlyVisitTrend({
  accessToken: 'xxxxx',
  beginDate: '20170301',
  endDate: '20170331'
})
```

### analysis.getWeeklyVisitTrend

获取用户访问小程序数据周趋势

**入参说明**

|属性				|类型		|默认值	|必填	|说明											|
|:-:				|:-:		|:-:		|:-:	|:-:											|
|accessToken|string	|				|是		|接口调用凭证							|
|beginDate	|string	|				|是		|开始日期。格式为 yyyymmdd|
|endDate		|string	|				|是		|结束日期。格式为 yyyymmdd|

`beginDate`必须为周一，`endDate`必须为周日，限定查询一周的数据。

**返回值说明**

|属性		|类型									|说明									|
|:-:		|:-:									|:-:									|
|errCode|Number								|错误码，错误码0为成功|
|errMsg	|String								|错误信息							|
|list		|Array.&lt;Object&gt;	|数据列表							|

**list 的结构**

|属性						|类型		|说明															|
|:-:						|:-:		|:-:															|
|refDate				|string	|时间，格式为 yyyymm，如："20170306-20170312"|
|sessionCnt			|number	|打开次数（自然周内汇总）					|
|visitPv				|number	|访问次数（自然周内汇总）					|
|visitUv				|number	|访问人数（自然周内去重）					|
|visitUvNew			|number	|新用户数（自然周内去重）					|
|stayTimeUv			|number	|人均停留时长 (浮点型，单位：秒)	|
|stayTimeSession|number	|次均停留时长 (浮点型，单位：秒)	|
|visitDepth			|number	|平均访问深度 (浮点型)						|

**使用示例**

```js
const result = await openapi.analysis.getWeeklyVisitTrend({
  accessToken: 'xxxxx',
  beginDate: '20170306',
  endDate: '20170312'
})
```

### analysis.getUserPortrait

获取小程序新增或活跃用户的画像分布数据。时间范围支持昨天、最近7天、最近30天。其中，新增用户数为时间范围内首次访问小程序的去重用户数，活跃用户数为时间范围内访问过小程序的去重用户数。

**入参说明**

|属性				|类型		|默认值	|必填	|说明											|
|:-:				|:-:		|:-:		|:-:	|:-:											|
|accessToken|string	|				|是		|接口调用凭证							|
|beginDate	|string	|				|是		|开始日期。格式为 yyyymmdd|
|endDate		|string	|				|是		|结束日期。格式为 yyyymmdd|

`endDate`与`beginDate`必须相差0/6/29天，分别代表查询最近1/7/30天数据，`endDate`允许设置的最大值为昨日。

**返回值说明**

|属性				|类型		|说明															|
|:-:				|:-:		|:-:															|
|errCode		|Number	|错误码，错误码0为成功						|
|errMsg			|String	|错误信息													|
|refDate		|string	|时间范围，如："20170611-20170617"|
|visitUvNew	|Object	|新用户画像												|
|visitUv		|Object	|活跃用户画像											|

**visitUvNew 的结构**

|属性			|类型		|说明																	|
|:-:			|:-:		|:-:																	|
|index		|number	|分布类型															|
|province	|Object	|省份，如北京、广东等									|
|city			|Object	|城市，如北京、广州等									|
|genders	|Object	|性别，包括男、女、未知								|
|platforms|Object	|终端类型，包括 iPhone，android，其他	|
|devices	|Object	|机型，如苹果 iPhone 6，OPPO R9 等		|
|ages			|Object	|年龄，包括17岁以下、18-24岁等区间		|

**province 的结构**

|属性								|类型		|说明																																					|
|:-:								|:-:		|:-:																																					|
|id									|number	|属性值id																																			|
|name								|string	|属性值名称，与id对应。如属性为 province 时，返回的属性值名称包括「广东」等。	|
|accessSourceVisitUv|number	|该场景访问uv																																	|

**city 的结构**

|属性								|类型		|说明																																					|
|:-:								|:-:		|:-:																																					|
|id									|number	|属性值id																																			|
|name								|string	|属性值名称，与id对应。如属性为 province 时，返回的属性值名称包括「广东」等。	|
|accessSourceVisitUv|number	|该场景访问uv																																	|

**genders 的结构**

|属性								|类型		|说明																																					|
|:-:								|:-:		|:-:																																					|
|id									|number	|属性值id																																			|
|name								|string	|属性值名称，与id对应。如属性为 province 时，返回的属性值名称包括「广东」等。	|
|accessSourceVisitUv|number	|该场景访问uv																																	|

**platforms 的结构**

|属性								|类型		|说明																																					|
|:-:								|:-:		|:-:																																					|
|id									|number	|属性值id																																			|
|name								|string	|属性值名称，与id对应。如属性为 province 时，返回的属性值名称包括「广东」等。	|
|accessSourceVisitUv|number	|该场景访问uv																																	|

**devices 的结构**

|属性								|类型		|说明																																					|
|:-:								|:-:		|:-:																																					|
|id									|number	|属性值id																																			|
|name								|string	|属性值名称，与id对应。如属性为 province 时，返回的属性值名称包括「广东」等。	|
|accessSourceVisitUv|number	|该场景访问uv																																	|

**ages 的结构**

|属性								|类型		|说明																																					|
|:-:								|:-:		|:-:																																					|
|id									|number	|属性值id																																			|
|name								|string	|属性值名称，与id对应。如属性为 province 时，返回的属性值名称包括「广东」等。	|
|accessSourceVisitUv|number	|该场景访问uv																																	|

**visitUv 的结构**

|属性			|类型		|说明																	|
|:-:			|:-:		|:-:																	|
|index		|number	|分布类型															|
|province	|Object	|省份，如北京、广东等									|
|city			|Object	|城市，如北京、广州等									|
|genders	|Object	|性别，包括男、女、未知								|
|platforms|Object	|终端类型，包括 iPhone，android，其他	|
|devices	|Object	|机型，如苹果 iPhone 6，OPPO R9 等		|
|ages			|Object	|年龄，包括17岁以下、18-24岁等区间		|

**使用示例**

```js
const result = await openapi.analysis.getUserPortrait({
  accessToken: 'xxxxx',
  beginDate: '20170306',
  endDate: '20170312'
})
```

### analysis.getVisitDistribution

获取用户小程序访问分布数据

**入参说明**

|属性				|类型		|默认值	|必填	|说明											|
|:-:				|:-:		|:-:		|:-:	|:-:											|
|accessToken|string	|				|是		|接口调用凭证							|
|beginDate	|string	|				|是		|开始日期。格式为 yyyymmdd|
|endDate		|string	|				|是		|结束日期。格式为 yyyymmdd|

`endDate`必须等于`beginDate`，`endDate`最大可选择昨天，限定查询一天的数据。

**返回值说明**

|属性		|类型									|说明									|
|:-:		|:-:									|:-:									|
|errCode|Number								|错误码，错误码0为成功|
|errMsg	|String								|错误信息							|
|refDate|string								|日期，格式为 yyyymmdd|
|list		|Array.&lt;Object&gt;	|数据列表							|

**list 的结构**

|属性			|类型						|说明					|
|:-:			|:-:						|:-:					|
|index		|String					|分布类型			|
|itemList	|Array.&lt;Object&gt;	|分布数据列表	|

**index 属性说明**

|值												|说明						|
|:-:											|:-:						|
|access_source_session_cnt|访问来源分布		|
|access_staytime_info			|访问时长分布		|
|access_depth_info				|访问深度的分布	|

**item_list 的结构**

|属性										|类型		|说明																								|
|:-:										|:-:		|:-:																								|
|key										|number	|场景 id，定义在各个 index 下不同，具体参见下方表格	|
|value									|number	|该场景 id 访问 pv																	|
|access_source_visit_uv	|number	|该场景 id 访问 uv																	|

访问来源 key 对应关系（index="access_source_session_cnt")

|key|访问来源																																		|对应场景值								|
|:-:|:-:																																				|:-:											|
|1	|小程序历史列表																															|1001											|
|2	|搜索																																				|1005 1006 1027 1042 1053	|
|3	|会话																																				|1007 1008 1044 1096			|
|4	|扫一扫二维码																																|1011 1047								|
|5	|公众号主页																																	|1020											|
|6	|聊天顶部																																		|1022											|
|7	|系统桌面																																		|1023											|
|8	|小程序主页																																	|1024											|
|9	|附近的小程序																																|1026 1068								|
|11	|模板消息																																		|1014 1043								|
|13	|公众号菜单																																	|1035											|
|14	|APP分享																																		|1036											|
|15	|支付完成页																																	|1034											|
|16	|长按识别二维码																															|1012 1048								|
|17	|相册选取二维码																															|1013 1049								|
|18	|公众号文章																																	|1058											|
|19	|钱包																																				|1019											|
|20	|卡包																																				|1028											|
|21	|小程序内卡券																																|1029											|
|22	|其他小程序																																	|1037											|
|23	|其他小程序返回																															|1038											|
|24	|卡券适用门店列表																														|1052											|
|25	|搜索框快捷入口																															|1054											|
|26	|小程序客服消息																															|1073 1081								|
|27	|公众号下发																																	|1074 1082								|
|29	|任务栏-最近使用																														|1089											|
|30	|长按小程序菜单圆点																													|1090											|
|31	|连wifi成功页																																|1078											|
|32	|城市服务																																		|1092											|
|33	|微信广告																																		|1045 1046 1067 1084			|
|34	|其他移动应用																																|1069											|
|35	|发现入口-我的小程序（基础库2.2.4版本起1103场景值废弃，不影响此处统计结果）	|1103											|
|36	|任务栏-我的小程序（基础库2.2.4版本起1104场景值废弃，不影响此处统计结果）		|1104											|
|10	|其他																																				|除上述外其余场景值				|

访问时长 key 对应关系（index="access_staytime_info"）

|key|访问时长	|
|:-:|:-:			|
|1	|0-2s			|
|2	|3-5s			|
|3	|6-10s		|
|4	|11-20s		|
|5	|20-30s		|
|6	|30-50s		|
|7	|50-100s	|
|8	|>100s		|

平均访问深度 key 对应关系（index="access_depth_info"）

|key|访问深度	|
|:-:|:-:			|
|1	|1 页			|
|2	|2 页			|
|3	|3 页			|
|4	|4 页			|
|5	|5 页			|
|6	|6-10 页	|
|7	|>10 页		|

**使用示例**

```js
const result = await openapi.analysis.getVisitDistribution({
  accessToken: 'xxxxx',
  beginDate: '20170306',
  endDate: '20170306'
})
```

### analysis.getVisitPage

访问页面。目前只提供按 `page_visit_pv` 排序的 `top200`

**入参说明**

|属性				|类型		|默认值	|必填	|说明											|
|:-:				|:-:		|:-:		|:-:	|:-:											|
|accessToken|string	|				|是		|接口调用凭证							|
|beginDate	|string	|				|是		|开始日期。格式为 yyyymmdd|
|endDate		|string	|				|是		|结束日期。格式为 yyyymmdd|

`endDate`必须等于`beginDate`，`endDate`最大可选择昨天，限定查询一天的数据。

**返回值说明**

|属性						|类型		|说明									|
|:-:						|:-:		|:-:									|
|errCode				|Number	|错误码，错误码0为成功|
|errMsg					|String	|错误信息							|
|pagePath				|String	|页面路径							|
|pageVisitPv		|Number	|访问次数							|
|pageVisitUv		|Number	|访问人数							|
|pageStaytimePv	|Number	|次均停留时长					|
|entrypagePv		|Number	|进入页次数						|
|exitpagePv			|Number	|退出页次数						|
|pageSharePv		|Number	|转发次数							|
|pageShareUv		|Number	|转发人数							|

**使用示例**

```js
const result = await openapi.analysis.getVisitPage({
  accessToken: 'xxxxx',
  beginDate: '20170306',
  endDate: '20170306'
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
openapi.customerServiceMessage.getTempMedia({
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
openapi.customerServiceMessage.getTempMedia({
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
openapi.customerServiceMessage.uploadTempMedia({
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
openapi.wxacode.createQRCode
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
    const result = await openapi.wxacode.createQRCode({
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
    const result = await openapi.wxacode.get({
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
    const result = await openapi.wxacode.getUnlimited({
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
openapi.img.aiCrop({
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
    const result = await openapi.img.scanQRCode({
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
    const result = await openapi.img.superresolution({
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


# 支付宝小程序平台

## 初始化

**入参说明**

|参数名		|类型	|必填	|默认值	|说明				|
|:-:		|:-:	|:-:	|:-:	|:-:				|
|appId		|String	|是		|-		|小程序ID			|
|privateKey	|String	|是		|-		|应用私钥字符串		|
|keyType	|String	|-		|PKCS8	|应用私钥字符串类型	|

**注意**

- 请务必注意在支付宝填写应用公钥时要与私钥匹配，建议直接使用支付宝开放平台提供的[支付宝开放平台开发助手](https://opendocs.alipay.com/open/291/105971/)

**返回值说明**

返回`openapi`实例用以调用支付宝开放能力

**示例代码**

```js
const uniCloudOpenapi = require('@dcloudio/unicloud-openapi')
const openapi = uniCloudOpenapi.initAlipay({
  appId: 'appId',
  secret: 'secret'
})
```

## 登录授权

### auth.code2Session(String code)

使用`uni.login`返回的`code`获取`openid`信息

**入参说明**

|参数名	|类型		|默认值	|必填	|说明										|
|:-:		|:-:		|:-:		|:-:	|:-:										|
|code		|String	|-			|是		|uni.login获取的用户code|

**返回值说明**

|属性	|类型	|说明			|
|:-:	|:-:	|:-:			|
|openid	|String	|用户唯一标识	|

**示例代码**

```js
const {
  openid
} = await openapi.auth.code2Session(code)
```

# 统一支付

支持支付宝和微信的支付api，

**须知**

- openapi对入参和返回值均做了驼峰转化，开发者在对照微信支付或者支付宝支付对应的文档时需要注意。
- 特殊参数`appId`、`mchId`需注意大小写
- 所有金额被统一为以分为单位
- 为避免无关参数干扰此文档仅列举必填参数，其余参数请参照[微信支付-小程序](https://pay.weixin.qq.com/wiki/doc/api/wxa/wxa_api.php?chapter=9_1)、[微信支付-App](https://pay.weixin.qq.com/wiki/doc/api/app/app.php?chapter=9_1)、[支付宝支付-小程序](https://opendocs.alipay.com/apis/api_1/alipay.trade.create)、[支付宝支付-App](https://opendocs.alipay.com/apis/api_1/alipay.trade.app.pay)
- 微信支付沙箱环境不支持小程序支付，另外此沙箱环境只可以跑微信提供的测试用例不可以随意测试
- 无论是微信还是支付宝，沙箱环境都不确保稳定，如果使用沙箱的过程中遇到疑难问题建议切换成正式环境测试

### 公共配置

|     参数名		|        类型		|      必填		|                      默认值							|                  说明					|   支持平台	|
| :-------------:	| :----------------:| :------------:| :-----------------------------------------------:		| :------------------------------------:| :----------:	|
|      appId		|       String		|       是		|                         -								|     当前应用在对应支付平台的 appId	| 支付宝、微信	|
|      mchId		|       String		|  微信支付必填	|                         -								|                 商户号				|     微信		|
|       key			|       String		|  微信支付必填	|                         -								|            支付商户 md5 key			|     微信		|
|       pfx			| String&#124;Buffer|  微信支付必填	|                         -								|     微信支付商户API证书，主要用于退款，	|     微信		|
|   privateKey		|       String		| 支付宝支付必填|                         -								|             应用私钥字符串			|    支付宝		|
|     keyType		|       String		|       否		|                         -								|           应用私钥字符串类型			|    支付宝		|
| alipayPublicKey	|       String		| 支付宝支付必填|                         -								|			支付宝公钥，验签使用		|    支付宝		|
|     timeout		|       Number		|       否		|                       5000							|        请求超时时间，单位：毫秒		| 支付宝、微信	|
|    signType		|       String		|       否		|         微信支付默认 MD5，支付宝默认 RSA2				|                签名类型				| 支付宝、微信	|
|     sandbox		|      Boolean		|       否		|                       false							|            是否启用沙箱环境			| 支付宝、微信	|
|   clientType		|       String		|       否		| 默认自动获取客户端类型，同 `context` 内的 `PLATFORM`	| 客户端类型，主要用于返回客户端支付参数| 支付宝、微信	|

```js
// 初始化微信支付
const fs = require('fs') // 引入fs模块以处理微信支付商户API证书
const uniCloudOpenapi = require('@dcloudio/unicloud-opanapi')
const openapi = uniCloudOpenapi.initWeixin({
	appId:'your appId',
	mchId:'your mchId',
	key: 'you parterner key',
	pfx: fs.readFileSync('/path/to/your/pfxfile') // p12文件路径，使用微信退款时需要，需要注意的是阿里云目前不支持以相对路径读取文件，请使用绝对路径的形式
})

// 初始化支付宝支付
const uniCloudOpenapi = require('@dcloudio/unicloud-opanapi')
const openapi = uniCloudOpenapi.initAlipay({
	appId:'your appId', 
	privateKey:'your privateKey',
	alipayPublicKey: 'you alipayPublicKey' // 使用支付时需传递此值做返回结果验签
})
```

### 获取支付参数

`openapi.payment.getOrderInfo`，此接口仅支持微信小程序、支付宝小程序、App平台

**入参说明**

|参数名		|类型	|必填							|默认值	|说明																		|支持平台					|
|:-:		|:-:	|:-:							|:-:	|:-:																		|:-:						|
|openid		|String	|支付宝小程序、微信小程序必填	|-		|通过对应平台的getOpenid获取												|支付宝小程序、微信小程序	|
|subject	|String	|支付宝支付必填					|-		|订单标题																	|支付宝支付					|
|body		|String	|微信支付必填					|-		|商品描述																	|微信支付					|
|outTradeNo	|String	|必填							|-		|商户订单号,64个字符以内、只能包含字母、数字、下划线；需保证在商户端不重复	|							|
|totalFee	|Number	|必填							|-		|订单金额，单位：分															|支付宝小程序、微信小程序	|
|notifyUrl	|String	|必填							|-		|支付结果通知地址															|							|

**返回值说明**

|参数名		|类型				|说明																	|支持平台	|
|:-:		|:-:				|:-:																	|:-:		|
|orderInfo	|Object&#124;String	|客户端支付所需参数，直接返回给客户端即可，下面会介绍如何搭配客户端使用	|			|

**使用示例**

```js
// 云函数 - getOrderInfo
exports.main = async function (event,context) {
	let {
		orderInfo,
		orderResult // 可能还有其他对
	} = await openapi.payment.getOrderInfo({
		openid: 'user openid',
		subject: '订单标题',
		body: '商品描述',
		outTradeNo: '商户订单号',
		totalFee: 1, // 金额，单位分
		notifyUrl: 'https://xxx.xx' // 支付结果通知地址
	})
	return {
		orderInfo
	}
}

// 客户端 - 微信小程序
uniCloud.callFunction({
	name: 'getOrderInfo',
	success(res) {
		uni.requestPayment({
			...res.result.orderInfo
			success(){},
			fail(){}
		})
	}
})

// 客户端 - App - 微信支付
uniCloud.callFunction({
	name: 'getOrderInfo',
	success(res) {
		uni.requestPayment({
			provider: 'wxpay',
			orderInfo: res.result.orderInfo
			success(){},
			fail(){}
		})
	}
})

// 客户端 - 支付宝小程序 
uniCloud.callFunction({
	name: 'getOrderInfo',
	success(res) {
		uni.requestPayment({
			orderInfo: res.result.orderInfo
			success(){},
			fail(){}
		})
	}
})

// 客户端 - App - 支付宝支付
uniCloud.callFunction({
	name: 'getOrderInfo',
	success(res) {
		uni.requestPayment({
			provider: 'alipay',
			orderInfo: res.result.orderInfo
			success(){},
			fail(){}
		})
	}
})

```

### 查询订单

`openapi.payment.orderQuery`, 根据商户订单号或者平台订单号查询订单信息，主要用于未接收到支付通知时可以使用此接口进行支付结果验证

**入参说明**

|参数名			|类型	|必填					|默认值	|说明		|支持平台	|
|:-:			|:-:	|:-:					|:-:	|:-:		|:-:		|
|outTradeNo		|String	|和transactionId二选一	|-		|商户订单号	|			|
|transactionId	|String	|和outTradeNo二选一		|-		|平台订单号	|			|

**返回值说明**

|参数名				|类型	|说明				|支持平台	|
|:-:				|:-:	|:-:				|:-:		|
|appId				|String	|平台分配的应用ID	|微信支付	|
|mchId				|String	|商户号				|微信支付	|
|outTradeNo			|String	|商户订单号			|			|
|transactionId		|String	|平台订单号			|			|
|tradeState			|String	|订单状态	，微信支付： SUCCESS—支付成功，REFUND—转入退款，NOTPAY—未支付，CLOSED—已关闭，REVOKED—已撤销（刷卡支付），USERPAYING--用户支付中，PAYERROR--支付失败(其他原因，如银行返回失败)。支付宝支付：USERPAYING（交易创建，等待买家付款）、CLOSED（未付款交易超时关闭，或支付完成后全额退款）、SUCCESS（交易支付成功）、FINISHED（交易结束，不可退款）		|				|
|totalFee			|Number	|标价金额	，单位：分	|			|
|settlementTotalFee	|Number	|应结订单金额，单位：分		|			|
|cashFee			|Number	|现金支付金额，单位：分		|			|

**使用示例**

```js
exports.main = async function(event) {
  let res = await openapi.payment.orderQuery({
    outTradeNo: 'outTradeNo'
  })
  return res
}
```

### 关闭订单

`openapi.payment.closeOrder`，用于交易创建后，用户在一定时间内未进行支付，可调用该接口直接将未付款的交易进行关闭，避免重复支付。

**注意**

- 微信支付：订单生成后不能马上调用关单接口，最短调用时间间隔为5分钟。

**入参说明**

|参数名			|类型	|必填								|默认值	|说明		|支持平台	|
|:-:			|:-:	|:-:								|:-:	|:-:		|:-:		|
|outTradeNo		|String	|使用微信时必填，使用支付宝时和transactionId二选一	|-		|商户订单号	|			|
|transactionId	|String	|使用支付宝时和outTradeNo二选一		|-		|平台订单号	|支付宝支付	|

**返回值说明**

|参数名			|类型	|说明				|支持平台	|
|:-:			|:-:	|:-:				|:-:		|
|appId			|String	|平台分配的应用ID	|微信支付	|
|mchId			|String	|商户号				|微信支付	|
|outTradeNo		|String	|商户订单号			|支付宝支付	|
|transactionId	|String	|平台订单号			|支付宝支付	|

**使用示例**

```js
exports.main = async function(event) {
  let res = await openapi.payment.closeOrder({
    outTradeNo: 'outTradeNo'
  })
  return res
}
```

### 撤销订单

`openapi.payment.cancelOrder`，**此接口仅支付宝支持**，支付交易返回失败或支付系统超时，调用该接口撤销交易。如果此订单用户支付失败，支付宝系统会将此订单关闭；如果用户支付成功，支付宝系统会将此订单资金退还给用户。 注意：只有发生支付系统超时或者支付结果未知时可调用撤销，其他正常支付的单如需实现相同功能请调用申请退款API。提交支付交易后调用【查询订单API】，没有明确的支付结果再调用【撤销订单API】。

**入参说明**

|参数名			|类型	|必填					|默认值	|说明		|支持平台	|
|:-:			|:-:	|:-:					|:-:	|:-:		|:-:		|
|outTradeNo		|String	|和transactionId二选一	|-		|商户订单号	|支付宝支付	|
|transactionId	|String	|和outTradeNo二选一		|-		|平台订单号	|支付宝支付	|

**返回值说明**

|参数名			|类型	|说明				|支持平台	|
|:-:			|:-:	|:-:				|:-:		|
|outTradeNo		|String	|商户订单号			|支付宝支付	|
|transactionId	|String	|平台订单号			|支付宝支付	|


**使用示例**

```js
exports.main = async function(event) {
  let res = await openapi.payment.cancelOrder({
    outTradeNo: 'outTradeNo'
  })
  return res
}
```

### 申请退款

`openapi.payment.refund`,当交易发生之后一段时间内，由于买家或者卖家的原因需要退款时，卖家可以通过退款接口将支付款退还给买家。

**微信支付注意事项**

1. 交易时间超过一年的订单无法提交退款
2. 微信支付退款支持单笔交易分多次退款，多次退款需要提交原支付订单的商户订单号和设置不同的退款单号。申请退款总金额不能超过订单金额。 一笔退款失败后重新提交，请不要更换退款单号，请使用原商户退款单号
3. 请求频率限制：150qps，即每秒钟正常的申请退款请求次数不超过150次，错误或无效请求频率限制：6qps，即每秒钟异常或错误的退款申请请求不超过6次
4. 每个支付订单的部分退款次数不能超过50次
5. 如果同一个用户有多笔退款，建议分不同批次进行退款，避免并发退款导致退款失败

**入参说明**

|参数名			|类型	|必填						|默认值	|说明			|支持平台	|
|:-:			|:-:	|:-:						|:-:	|:-:			|:-:		|
|outTradeNo		|String	|和transactionId二选一		|-		|商户订单号		|			|
|transactionId	|String	|和outTradeNo二选一			|-		|平台订单号		|			|
|outRefundNo	|String	|微信支付必填，支付宝支付选填		|-		|商户退款单号	|			|
|totalFee		|Number	|微信支付必填				|-		|订单总金额		|微信支付	|
|refundFee		|Number	|必填				|-		|退款总金额		|微信支付	|
|refundFeeType	|String	|选填						|-		|货币种类		|			|
|refundDesc		|String	|选填						|-		|退款原因		|			|
|notifyUrl		|String	|微信支付选填，支付宝不支持	|-		|退款通知url	|微信支付	|

**返回值说明**

|参数名			|类型	|说明			|支持平台	|
|:-:			|:-:	|:-:			|:-:		|
|outTradeNo		|String	|商户订单号		|			|
|transactionId	|String	|平台订单号		|			|
|outRefundNo	|String	|商户退款单号	|微信支付	|
|refundId		|String	|平台退款单号	|			|
|refundFee		|Number	|退款总金额		|			|
|cashRefundFee	|Number	|现金退款金额	|			|

**使用示例**

```js
exports.main = async function(event) {
  let res = await openapi.payment.refund({
    outTradeNo: '商户订单号',
    outRefundNo: '商户退款单号', // 支付宝可不填此项
    totalFee: 1, // 订单总金额，支付宝可不填此项
    refundFee: 1 // 退款总金额
  })
  return res
}
```

### 查询退款

`openapi.payment.refundQuery`，提交退款申请后，通过调用该接口查询退款状态。

**入参说明**

|参数名			|类型	|必填										|默认值	|说明																				|支持平台	|
|:-:			|:-:	|:-:										|:-:	|:-:																				|:-:		|
|outTradeNo		|String	|微信支付四选一，支付宝和transactionId二选一|-		|商户订单号																			|			|
|transactionId	|String	|微信支付四选一，支付宝和outTradeNo二选一	|-		|平台订单号																			|			|
|outRefundNo	|String	|微信支付四选一，支付宝必填					|-		|商户退款单号																		|			|
|refundId		|String	|微信支付四选一								|-		|平台退款单号																		|微信支付	|
|offset			|Number	|微信支付选填								|-		|偏移量，当部分退款次数超过10次时可使用，表示返回的查询结果从这个偏移量开始取记录	|			|

**注意**

- `outRefundNo`为使用支付宝请求退款接口时，传入的商户退款单号。如果在退款请求时未传入，则该值为创建交易时的商户订单号即`outTradeNo`

**返回值说明**

|参数名			|类型					|说明							|支持平台	|
|:-:			|:-:					|:-:							|:-:		|
|outTradeNo		|String					|商户订单号						|			|
|transactionId	|String					|平台订单号						|			|
|totalFee		|Number					|订单金额						|			|
|refundId		|String					|平台退款单号，仅支付宝返回		|			|
|refundFee		|Number					|退款总金额						|			|
|refundDesc		|String					|退款理由						|			|
|refundList		|Array&lt;refundItem&gt;|分笔退款信息，仅微信支付返回	|微信支付	|
|refundRoyaltys	|Array&lt;refundRoyaltysItem&gt;|退分账明细信息，仅支付宝返回	|支付宝支付	|

**refundItem说明**

|参数名				|类型					|说明																																																							|支持平台	|
|:-:				|:-:					|:-:																																																							|:-:		|
|outRefundNo		|String					|商户退款单号																																																					|			|
|refundId			|String					|平台退款单号																																																					|			|
|refundChannel		|String					|退款渠道，ORIGINAL—原路退款，BALANCE—退回到余额，OTHER_BALANCE—原账户异常退到其他余额账户，OTHER_BANKCARD—原银行卡异常退到其他银行卡																						|			|
|refundFee			|Number					|申请退款金额																																																					|			|
|settlementRefundFee|Number					|退款金额,退款金额=申请退款金额-非充值代金券退款金额，退款金额<=申请退款金额																																					|			|
|refundStatus		|String					|退款状态，SUCCESS—退款成功，REFUNDCLOSE—退款关闭，PROCESSING—退款处理中，CHANGE—退款异常，退款到银行发现用户的卡作废或者冻结了，导致原路退款银行卡失败，可前往商户平台（pay.weixin.qq.com）-交易中心，手动处理此笔退款。	|			|
|couponRefundFee	|Number					|总代金券退款金额																																																				|			|
|couponRefundCount	|Number|退款代金券使用数量																																																				|	|
|refundAccount		|String|退款资金来源																																																					|	|
|refundRecvAccout	|String|退款入账账户																																																						|	|
|refundSuccessTime	|String|退款成功时间																																																						|	|
|couponList			|Array&lt;couponItem&gt;|分笔退款信息																																																					|	|

**couponItem说明**

|参数名			|类型	|说明				|支持平台	|
|:-:			|:-:	|:-:				|:-:		|
|couponType		|String	|代金券类型			|			|
|couponRefundId	|String	|退款代金券ID		|			|
|couponRefundFee|String	|单个代金券退款金额	|			|

**refundRoyaltysItem说明**

|参数名		|类型	|说明																																						|支持平台	|
|:-:		|:-:	|:-:																																						|:-:		|
|fundChannel|String	|交易使用的资金渠道																																			|			|
|bankCode	|String	|银行卡支付时的银行代码																																		|			|
|amount		|Number	|该支付工具类型所使用的金额																																	|			|
|realAmount	|Number	|渠道实际付款金额																																			|			|
|fundType	|String	|渠道所使用的资金类型,目前只在资金渠道(fund_channel)是银行卡渠道(BANKCARD)的情况下才返回该信息(DEBIT_CARD:借记卡,CREDIT_CARD:信用卡,MIXED_CARD:借贷合一卡)	|			|

**使用示例**

```js
exports.main = async function(event) {
  let res = await openapi.payment.refundQuery({
    outTradeNo: '商户订单号',
	outRefundNo: '商户退款单号' // 支付宝必填
  })
  return res
}
```

### 下载交易账单

`openapi.payment.downloadBill`，商户可以通过该接口下载历史交易清单。**仅微信支付支持**

**注意：**

1. 微信侧未成功下单的交易不会出现在对账单中。支付成功后撤销的交易会出现在对账单中，跟原支付单订单号一致；
2. 微信在次日9点启动生成前一天的对账单，建议商户10点后再获取；
3. 对账单中涉及金额的字段单位为“元”。
4. 对账单接口只能下载三个月以内的账单。
5. 对账单是以商户号纬度来生成的，如一个商户号与多个appid有绑定关系，则使用其中任何一个appid都可以请求下载对账单。对账单中的appid取自交易时候提交的appid，与请求下载对账单时使用的appid无关。

**入参说明**

|参数名		|类型	|必填	|默认值	|说明								|支持平台	|
|:-:		|:-:	|:-:	|:-:	|:-:								|:-:		|
|billDate	|String	|必填	|-		|下载对账单的日期，格式：20140603	|			|
|billType	|String |选填	|ALL	|ALL（默认值），返回当日所有订单信息（不含充值退款订单）,SUCCESS，返回当日成功支付的订单（不含充值退款订单）,REFUND，返回当日退款订单（不含充值退款订单）,RECHARGE_REFUND，返回当日充值退款订单||

**返回值说明**


|参数名	|类型	|说明						|支持平台	|
|:-:	|:-:	|:-:						|:-:		|
|content|String	|文本表格的方式返回的数据	|			|

`content`示例如下

**当日所有订单**
交易时间,公众账号ID,商户号,子商户号,设备号,微信订单号,商户订单号,用户标识,交易类型,交易状态,付款银行,货币种类,总金额,代金券或立减优惠金额,微信退款单号,商户退款单号,退款金额, 代金券或立减优惠退款金额，退款类型，退款状态,商品名称,商户数据包,手续费,费率

**当日成功支付的订单**
交易时间,公众账号ID,商户号,子商户号,设备号,微信订单号,商户订单号,用户标识,交易类型,交易状态,付款银行,货币种类,总金额, 代金券或立减优惠金额,商品名称,商户数据包,手续费,费率

**当日退款的订单**
交易时间,公众账号ID,商户号,子商户号,设备号,微信订单号,商户订单号,用户标识,交易类型,交易状态,付款银行,货币种类,总金额, 代金券或立减优惠金额,退款申请时间,退款成功时间,微信退款单号,商户退款单号,退款金额, 代金券或立减优惠退款金额,退款类型,退款状态,商品名称,商户数据包,手续费,费率

从第二行起，为数据记录，各参数以逗号分隔，参数前增加`符号，为标准键盘1左边键的字符，字段顺序与表头一致。

倒数第二行为订单统计标题，最后一行为统计数据

总交易单数，总交易额，总退款金额，总代金券或立减优惠退款金额，手续费总金额

举例如下：

```
交易时间,公众账号ID,商户号,子商户号,设备号,微信订单号,商户订单号,用户标识,交易类型,交易状态,付款银行,货币种类,总金额,代金券或立减优惠金额,微信退款单号,商户退款单号,退款金额,代金券或立减优惠退款金额,退款类型,退款状态,商品名称,商户数据包,手续费,费率
`2014-11-10 16：33：45,`wx2421b1c4370ec43b,`10000100,`0,`1000,`1001690740201411100005734289,`1415640626,`085e9858e3ba5186aafcbaed1,`MICROPAY,`SUCCESS,`OTHERS,`CNY,`0.01,`0.0,`0,`0,`0,`0,`,`,`被扫支付测试,`订单额外描述,`0,`0.60%
`2014-11-10 16：46：14,`wx2421b1c4370ec43b,`10000100,`0,`1000,`1002780740201411100005729794,`1415635270,`085e9858e90ca40c0b5aee463,`MICROPAY,`SUCCESS,`OTHERS,`CNY,`0.01,`0.0,`0,`0,`0,`0,`,`,`被扫支付测试,`订单额外描述,`0,`0.60%
总交易单数,总交易额,总退款金额,总代金券或立减优惠退款金额,手续费总金额
`2,`0.02,`0.0,`0.0,`0
```

**使用示例**

```js
exports.main = async function(event) {
  let res = await openapi.payment.downloadBill({
    billDate: '20200202',
  })
  return res
}
```

### 下载资金账单

`openapi.payment.downloadFundflow`,商户可以通过该接口下载自2017年6月1日起的历史资金流水账单。**仅微信支持**

**说明：**

1. 资金账单中的数据反映的是商户微信账户资金变动情况；
2. 当日账单在次日上午9点开始生成，建议商户在上午10点以后获取；
3. 资金账单中涉及金额的字段单位为“元”。

**入参说明**

|参数名		|类型	|必填	|默认值	|说明																		|支持平台	|
|:-:		|:-:	|:-:	|:-:	|:-:																		|:-:		|
|billDate	|String	|必填	|-		|下载对账单的日期，格式：20140603											|			|
|accountType|String	|选填	|Basic	|账单的资金来源账户：Basic  基本账户，Operation 运营账户，Fees 手续费账户	|			|

**返回值说明**

|参数名	|类型	|说明						|支持平台	|
|:-:	|:-:	|:-:						|:-:		|
|content|String	|文本表格的方式返回的数据	|			|

`content`示例如下

- 第一行为表头

记账时间,微信支付业务单号,资金流水单号,业务名称,业务类型,收支类型,收支金额（元）,账户结余（元）,资金变更提交申请人,备注,业务凭证号

- 从第二行起，为资金流水数据，各参数以逗号分隔，参数前增加`符号，为标准键盘1左边键的字符，字段顺序与表头一致

- 倒数第二行为资金账单统计标题

资金流水总笔数,收入笔数,收入金额,支出笔数,支出金额

- 最后一行为统计数据

账单示例如下：

```
记账时间,微信支付业务单号,资金流水单号,业务名称,业务类型,收支类型,收支金额（元）,账户结余（元）,资金变更提交申请人,备注,业务凭证号

`2018-02-01 04:21:23,`50000305742018020103387128253,`1900009231201802015884652186,`退款,`退款,`支出,`0.02,`0.17,`system,`缺货,`REF4200000068201801293084726067

资金流水总笔数,收入笔数,收入金额,支出笔数,支出金额

`20.0,`17.0,`0.35,`3.0,`0.18
```

**使用示例**

```js
exports.main = async function(event) {
  let res = await openapi.payment.downloadFundflow({
    billDate: '20200202',
  })
  return res
}
```

### 支付结果通知处理

`openapi.payment.verifyPaymentNotify`，用于在使用云函数Url化的云函数内检验并处理支付结果。

**入参说明**

只接收对应云函数的`event`作为参数

**返回值说明**

|参数名			|类型	|说明								|支持平台	|
|:-:			|:-:	|:-:								|:-:		|
|totalFee		|Number	|订单总金额							|			|
|cashFee		|Number	|现金支付金额						|			|
|feeType		|String	|货币类别							|			|
|outTradeNo		|String	|商户订单号							|			|
|transactionId	|String	|平台订单号							|			|
|timeEnd		|String	|支付完成时间，格式为yyyyMMddHHmmss	|			|
|openid			|String	|用户id								|			|

**使用示例**

```js
exports.main = async function(event) {
  let res = await openapi.payment.verifyPaymentNotify(event)
  return res
}
```

### 退款结果通知

`openapi.payment.verifyRefundNotify`，用于在使用云函数Url化的云函数内检验并处理支付结果。

**入参说明**

只接收对应云函数的`event`作为参数

**返回值说明**

|参数名				|类型	|说明													|支持平台	|
|:-:				|:-:	|:-:													|:-:		|
|totalFee			|Number	|订单总金额												|			|
|refundFee			|Number	|申请退款金额											|			|
|settlementTotalFee	|Number	|应结订单金额											|			|
|settlementRefundFee|Number	|退款金额												|			|
|outTradeNo			|String	|商户订单号												|			|
|transactionId		|String	|平台订单号												|			|
|refundId			|String	|平台退款单号											|			|
|outRefundNo		|String	|商户退款单号											|			|
|refundStatus		|String	|SUCCESS-退款成功,CHANGE-退款异常,REFUNDCLOSE—退款关闭	|			|
|refundAccount		|String	|退款资金来源	|	|
|refundRecvAccout	|String	|退款入账账户	|	|

**使用示例**

```js
exports.main = async function(event) {
  let res = await openapi.payment.verifyRefundNotify(event)
  return res
}
```

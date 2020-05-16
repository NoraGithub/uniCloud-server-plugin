function parseFeeValue (returnValue, shouldParse) {
  shouldParse.forEach((item) => {
    returnValue[item] = Number(returnValue[item])
  })
}

export default {
  unifiedOrder: {
    args: {
      _purify: {
        // suject在使用支付宝时必传，在微信支付这里特殊处理一下，直接删除
        shouldDelete: ['subject']
      }
    }
  },
  getOrderInfo: {
    args: {
      _purify: {
        // suject在使用支付宝时必传，在微信支付这里特殊处理一下，直接删除
        shouldDelete: ['subject']
      }
    }
  },
  orderQuery: {
    returnValue: function (returnValue) {
      parseFeeValue(returnValue, ['cashFee', 'totalFee', 'couponCount'])
      returnValue.couponList = []
      const couponCount = returnValue.couponCount || 0
      for (let n = 0; n < couponCount; n++) {
        returnValue.couponList.push({
          couponId: returnValue[`couponId${n}`],
          couponType: returnValue[`couponType${n}`],
          couponFee: Number(returnValue[`couponFee${n}`])
        })
        delete returnValue[`couponId${n}`]
        delete returnValue[`couponType${n}`]
        delete returnValue[`couponFee${n}`]
      }
      return returnValue
    }
  },
  refund: {
    returnValue: function (returnValue) {
      parseFeeValue(returnValue, ['refundFee', 'settlementRefundFee', 'totalFee', 'settlementTotalFee', 'cashFee', 'cashRefundFee', 'couponRefundFee', 'couponRefundCount'])
      returnValue.couponList = []
      const couponRefundCount = returnValue.couponRefundCount || 0
      for (let n = 0; n < couponRefundCount; n++) {
        returnValue.couponList.push({
          couponRefundId: returnValue[`couponRefundId${n}`],
          couponType: returnValue[`couponType${n}`],
          couponRefundFee: Number(returnValue[`couponRefundFee${n}`])
        })
        delete returnValue[`couponRefundId${n}`]
        delete returnValue[`couponType${n}`]
        delete returnValue[`couponRefundFee${n}`]
      }
      return returnValue
    }
  },
  refundQuery: {
    returnValue: function (returnValue) {
      parseFeeValue(returnValue, ['totalFee', 'refundFee', 'settlementTotalFee', 'cashFee', 'refundCount'])
      // 此接口微信做了分页，单次查询部分退款不会超过10笔，即n在[0,9]之间
      returnValue.refundList = []
      for (let n = 0; n < returnValue.refundCount; n++) {
        returnValue[`refundFee${n}`] = Number(returnValue[`refundFee${n}`])
        returnValue[`couponRefundFee${n}`] = Number(
          returnValue[`couponRefundFee${n}`]
        )
        returnValue[`settlementRefundFee${n}`] = Number(
          returnValue[`settlementRefundFee${n}`]
        )
        const couponRefundCount = Number(returnValue[`couponRefundCount${n}`]) || 0
        const tempRefundItem = {
          outRefundNo: returnValue[`outRefundNo${n}`],
          refundId: returnValue[`refundId${n}`],
          refundChannel: returnValue[`refundChannel${n}`],
          refundFee: Number(returnValue[`refundFee${n}`]),
          settlementRefundFee: Number(returnValue[`settlementRefundFee${n}`]),
          couponRefundFee: Number(returnValue[`couponRefundFee${n}`]),
          couponRefundCount: couponRefundCount,
          refundStatus: returnValue[`refundStatus${n}`],
          refundAccount: returnValue[`refundAccount${n}`],
          refundRecvAccout: returnValue[`refundRecvAccout${n}`],
          refundSuccessTime: returnValue[`refundSuccessTime${n}`],
          couponList: []
        }
        delete returnValue[`outRefundNo${n}`]
        delete returnValue[`refundId${n}`]
        delete returnValue[`refundChannel${n}`]
        delete returnValue[`refundFee${n}`]
        delete returnValue[`settlementRefundFee${n}`]
        delete returnValue[`couponRefundFee${n}`]
        delete returnValue[`couponRefundCount${n}`]
        delete returnValue[`refundStatus${n}`]
        delete returnValue[`refundAccount${n}`]
        delete returnValue[`refundRecvAccout${n}`]
        delete returnValue[`refundSuccessTime${n}`]
        for (let m = 0; m < couponRefundCount; m++) {
          tempRefundItem.couponList.push({
            couponRefundId: returnValue[`couponRefundId${n}${m}`],
            couponType: returnValue[`couponType${n}${m}`],
            couponRefundFee: Number(returnValue[`couponRefundId${n}${m}`])
          })
          delete returnValue[`couponRefundId${n}${m}`]
          delete returnValue[`couponType${n}${m}`]
          delete returnValue[`couponRefundFee${n}${m}`]
        }
        returnValue.refundList.push(tempRefundItem)
      }
      return returnValue
    }
  },
  verifyPaymentNotify: {
    returnValue: function (returnValue) {
      parseFeeValue(returnValue, ['cashFee', 'totalFee', 'couponCount'])
      const couponCount = returnValue.couponCount || 0
      returnValue.couponList = []
      for (let n = 0; n < couponCount; n++) {
        returnValue.couponList.push({
          couponId: returnValue[`couponId${n}`],
          couponType: returnValue[`couponType${n}`],
          couponFee: Number(returnValue[`couponFee${n}`])
        })
        delete returnValue[`couponId${n}`]
        delete returnValue[`couponType${n}`]
        delete returnValue[`couponFee${n}`]
      }
      return returnValue
    }
  },
  verifyRefundNotify: {
    returnValue: function (returnValue) {
      parseFeeValue(returnValue, ['refundFee', 'settlementRefundFee', 'settlementTotalFee', 'totalFee'])
      return returnValue
    }
  }
}

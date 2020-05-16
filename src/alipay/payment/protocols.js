function parseFeeValue (returnValue, shouldParse, rate) {
  shouldParse.forEach((item) => {
    returnValue[item] = Number(returnValue[item]) * rate
  })
}

export default {
  unifiedOrder: {
    args: {
      _pre (args) {
        parseFeeValue(args, ['totalFee'], 0.01)
        return args
      },
      totalAmount: 'totalFee',
      buyerId: 'openid'
    },
    returnValue: {
      transactionId: 'tradeNo'
    }
  },
  getOrderInfo: {
    args: {
      _pre (args) {
        parseFeeValue(args, ['totalFee'], 0.01)
        return args
      },
      buyerId: 'openid',
      totalAmount: 'totalFee'
    }
  },
  orderQuery: {
    args: {
      tradeNo: 'transactionId'
    },
    returnValue: {
      _pre (returnValue) {
        parseFeeValue(returnValue, ['totalAmount', 'settleAmount', 'buyerPayAmount', 'payAmount', 'pointAmount', 'invoiceAmount', 'receiptAmount', 'chargeAmount', 'mdiscountAmount', 'discountAmount'], 100)
        return returnValue
      },
      transactionId: 'tradeNo',
      openid: 'buyerUserId',
      tradeState: function (returnValue) {
        // 微信
        // SUCCESS—支付成功
        // REFUND—转入退款
        // NOTPAY—未支付
        // CLOSED—已关闭
        // REVOKED—已撤销（刷卡支付）
        // USERPAYING--用户支付中
        // PAYERROR--支付失败(其他原因，如银行返回失败)

        // 支付宝
        // WAIT_BUYER_PAY（交易创建，等待买家付款）
        // TRADE_CLOSED（未付款交易超时关闭，或支付完成后全额退款）
        // TRADE_SUCCESS（交易支付成功）
        // TRADE_FINISHED（交易结束，不可退款）
        switch (returnValue.tradeStatus) {
          case 'WAIT_BUYER_PAY':
            return 'USERPAYING'
          case 'TRADE_CLOSED':
            return 'CLOSED'
          case 'TRADE_SUCCESS':
            return 'SUCCESS'
          case 'TRADE_FINISHED':
            return 'FINISHED'
          default:
            return returnValue.tradeStatus
        }
      },
      totalFee: 'totalAmount',
      settlementTotalFee: 'settleAmount',
      feeType: 'transCurrency',
      cashFeeType: 'payCurrency',
      cashFee: 'buyerPayAmount',
      fundBillList: function (returnValue) {
        if (!returnValue.fundBillList) {
          return []
        }
        return returnValue.fundBillList.map((item) => {
          item.amount = Number(item.amount) * 100
          item.realAmount = Number(item.realAmount) * 100
          return item
        })
      },
      tradeSettleDetailList: function (returnValue) {
        if (!returnValue.tradeSettleDetailList) {
          return []
        }
        return returnValue.tradeSettleDetailList.map((item) => {
          item.amount = Number(item.amount) * 100
          return item
        })
      },
      _purify: {
        shouldDelete: ['tradeStatus']
      }
    }
  },
  cancelOrder: {
    args: {
      tradeNo: 'transactionId'
    },
    returnValue: {
      transactionId: 'tradeNo'
    }
  },
  closeOrder: {
    args: {
      tradeNo: 'transactionId'
    },
    returnValue: {
      transactionId: 'tradeNo'
    }
  },
  refund: {
    args: {
      _pre (returnValue) {
        parseFeeValue(returnValue, ['refundFee', 'sendBackFee'], 0.01)
        return returnValue
      },
      tradeNo: 'transactionId',
      refundAmount: 'refundFee',
      outRequestNo: 'outRefundNo',
      refundCurrency: 'refundFeeType',
      refundReason: 'refundDesc',
      goodsDetail: function (args) {
        if (!args.goodsDetail) {
          return []
        }
        return args.goodsDetail.map((item) => {
          item.price = Number(item.price) / 100
          return item
        })
      },
      refundRoyaltyParameters: function (args) {
        if (!args.refundRoyaltyParameters) {
          return []
        }
        return args.refundRoyaltyParameters.map((item) => {
          item.amount = Number(item.amount) / 100
          return item
        })
      }
    },
    returnValue: {
      _pre (returnValue) {
        parseFeeValue(returnValue, ['refundFee', 'presentRefundBuyerAmount', 'presentRefundDiscountAmount', 'presentRefundMdiscountAmount'], 100)
        return returnValue
      },
      transactionId: 'tradeNo',
      openid: 'buyerUserId',
      cashRefundFee: 'presentRefundBuyerAmount',
      refundId: 'refundSettlementId',
      cashFeeType: 'refundCurrency',
      refundDetailItemList: function (returnValue) {
        if (!returnValue.refundDetailItemList) {
          return []
        }
        return returnValue.refundDetailItemList.map((item) => {
          item.amount = Number(item.amount) * 100
          item.realAmount = Number(item.realAmount) * 100
          return item
        })
      },
      refundPresetPaytoolList: function (returnValue) {
        if (!returnValue.refundPresetPaytoolList) {
          return []
        }
        return returnValue.refundPresetPaytoolList.map((item) => {
          item.amount = Number(item.amount) * 100
          return item
        })
      }
    }
  },
  refundQuery: {
    args: {
      tradeNo: 'transactionId',
      outRequestNo: 'outRefundNo'
    },
    returnValue: {
      _pre (returnValue) {
        parseFeeValue(returnValue, ['totalAmount', 'refundAmount', 'sendBackFee', 'presentRefundBuyerAmount', 'presentRefundBuyerAmount', 'presentRefundMdiscountAmount'], 100)
        return returnValue
      },
      transactionId: 'tradeNo',
      outRefundNo: 'outRequestNo',
      totalFee: 'totalAmount',
      refundFee: 'refundAmount',
      refundDesc: 'refundReason',
      refundId: 'refundSettlementId',
      refundRoyaltys: function (returnValue) {
        if (!returnValue.refundRoyaltys) {
          return []
        }
        return returnValue.refundRoyaltys.map((item) => {
          item.refundAmount = Number(item.refundAmount) * 100
          return item
        })
      },
      refundDetailItemList: function (returnValue) {
        if (!returnValue.refundDetailItemList) {
          return []
        }
        return returnValue.refundDetailItemList.map((item) => {
          item.amount = Number(item.amount) * 100
          item.realAmount = Number(item.realAmount) * 100
          return item
        })
      }
    }
  },
  verifyPaymentNotify: {
    returnValue: {
      _pre (returnValue) {
        parseFeeValue(returnValue, ['invoiceAmount', 'receiptAmount', 'buyerPayAmount', 'totalAmount', 'pointAmount'], 100)
        return returnValue
      },
      openid: 'buyerId',
      transactionId: 'tradeNo',
      totalFee: 'totalAmount',
      cashFee: 'buyerPayAmount',
      resultCode: function (returnValue) {
        return returnValue.tradeStatus.replace('TRADE_', '')
      },
      fundBillList: function (returnValue) {
        if (!returnValue.fundBillList) {
          return []
        }
        return JSON.parse(returnValue.fundBillList).map((item) => {
          item.amount = Number(item.amount) * 100
          return item
        })
      }
    }
  }
}

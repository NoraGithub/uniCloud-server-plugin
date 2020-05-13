import { callWxOpenApi } from '../normalize'

export default class Analysis {
  constructor (options) {
    this.options = Object.assign({}, options)
  }

  async _requestWxOpenapi ({ name, url, data, options }) {
    data.accessToken = data.accessToken || this.options.accessToken
    const defaultOptions = {
      method: 'POST',
      dataType: 'json',
      contentType: 'json',
      timeout: this.options.timeout
    }
    const result = await callWxOpenApi({
      name: `analysis.${name}`,
      url: `${this.options.baseurl}${url}?access_token=${data.accessToken}`,
      data,
      options,
      defaultOptions
    })
    return result
  }

  async getDailyRetain (data) {
    // 目前此接口仅支持查询一天的数据，如果填写了end_date，则必须要求end_date = start_date
    const url = '/datacube/getweanalysisappiddailyretaininfo'
    const result = await this._requestWxOpenapi({
      name: 'getDailyRetain',
      url,
      data
    })
    return result
  }

  async getMonthlyRetain (data) {
    // 目前此接口仅支持查询一个月的数据，start_date必须是月初，end_date必须是月末
    const url = '/datacube/getweanalysisappidmonthlyretaininfo'
    const result = await this._requestWxOpenapi({
      name: 'getMonthlyRetain',
      url,
      data
    })
    return result
  }

  async getWeeklyRetain (data) {
    // 目前此接口仅支持查询一周的数据，start_date必须是周一，end_date必须是周日
    const url = '/datacube/getweanalysisappidweeklyretaininfo'
    const result = await this._requestWxOpenapi({
      name: 'getWeeklyRetain',
      url,
      data
    })
    return result
  }

  async getDailySummary (data) {
    // 目前此接口仅支持查询一天的数据，如果填写了end_date，则必须要求end_date = start_date
    const url = '/datacube/getweanalysisappiddailyretaininfo'
    const result = await this._requestWxOpenapi({
      name: 'getDailySummary',
      url,
      data
    })
    return result
  }

  async getDailyVisitTrend (data) {
    // 目前此接口仅支持查询一天的数据，如果填写了end_date，则必须要求end_date = start_date
    const url = '/datacube/getweanalysisappiddailyvisittrend'
    const result = await this._requestWxOpenapi({
      name: 'getDailyVisitTrend',
      url,
      data
    })
    return result
  }

  async getMonthlyVisitTrend (data) {
    // 目前此接口仅支持查询一个月的数据，start_date必须是月初，end_date必须是月末
    const url = '/datacube/getweanalysisappidmonthlyvisittrend'
    const result = await this._requestWxOpenapi({
      name: 'getMonthlyVisitTrend',
      url,
      data
    })
    return result
  }

  async getWeeklyVisitTrend (data) {
    // 目前此接口仅支持查询一周的数据，start_date必须是周一，end_date必须是周日
    const url = '/datacube/getweanalysisappidweeklyvisittrend'
    const result = await this._requestWxOpenapi({
      name: 'getWeeklyVisitTrend',
      url,
      data
    })
    return result
  }

  async getUserPortrait (data) {
    // 目前此接口仅支持查询最近的数据，即end_date = 昨天，且必须end_date - start_date = 0|6|29
    const url = '/datacube/getweanalysisappiduserportrait'
    const result = await this._requestWxOpenapi({
      name: 'getUserPortrait',
      url,
      data
    })
    return result
  }

  async getVisitDistribution (data) {
    // 目前此接口仅支持查询一天的数据，如果填写了end_date，则必须要求end_date = start_date
    const url = '/datacube/getweanalysisappidvisitdistribution'
    const result = await this._requestWxOpenapi({
      name: 'getVisitDistribution',
      url,
      data
    })
    return result
  }

  async getVisitPage (data) {
    // 目前此接口仅支持查询一天的数据，如果填写了end_date，则必须要求end_date = start_date
    const url = '/datacube/getweanalysisappidvisitpage'
    const result = await this._requestWxOpenapi({
      name: 'getVisitPage',
      url,
      data
    })
    return result
  }
}

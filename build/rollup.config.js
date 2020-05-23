const getRollupConfig = require('./get-rollup-config')
const modulesToBuild = ['unipay', 'uni-account', 'mp-cloud-openapi']
module.exports = modulesToBuild.map(getRollupConfig)

const fs = require('./fs')
const load = require('./load')
const download = require('./download')
const sleep = require('./sleep')

module.exports = {
  ...fs,
  load,
  download,
  sleep
}

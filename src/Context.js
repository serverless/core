const path = require('path')
const os = require('os')
const { readFile, writeFile, fileExists } = require('./fs')

class Context {
  constructor(config = {}) {
    this.stateRoot = config.stateRoot
      ? path.resolve(config.stateRoot)
      : path.join(os.homedir(), '.serverless', 'components', 'state')
    this.stage = config.stage || 'dev'
    this.credentials = config.credentials || {}
    this.outputs = {}
  }

  async readState(id) {
    const stateFilePath = path.join(this.stateRoot, `${id}.json`)
    if (await fileExists(stateFilePath)) {
      return readFile(stateFilePath)
    }
    return {}
  }

  async writeState(id, state) {
    const stateFilePath = path.join(this.stateRoot, `${id}.json`)
    await writeFile(stateFilePath, state)
    return state
  }

  log() {
    return
  }

  status() {
    return
  }

  output(key, value) {
    this.outputs[key] = value
    return
  }
}

module.exports = new Context()

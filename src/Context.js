const path = require('path')
const os = require('os')
const { readFile, writeFile, fileExists } = require('./utils')

class Context {
  constructor(config = {}) {
    this.stateRoot = config.stateRoot
      ? path.resolve(config.stateRoot)
      : path.join(os.homedir(), '.serverless', 'components', 'state')
    this.credentials = config.credentials || {}
    this.resourceGroupId = Math.random()
      .toString(36)
      .substring(6)
    this.outputs = {}
  }

  async readState(id) {
    const stateFilePath = path.join(this.stateRoot, `${id}.json`)
    let state = {
      resourceGroupId: this.resourceGroupId
    }
    if (await fileExists(stateFilePath)) {
      state = await readFile(stateFilePath)
      this.resourceGroupId = state.resourceGroupId
    } else {
      await this.writeState(id, state)
    }

    return state
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

module.exports = Context

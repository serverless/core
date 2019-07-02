const path = require('path')
const os = require('os')
const { readFile, writeFile, fileExists } = require('./utils')

class Context {
  constructor(config = {}) {
    this.stateRoot = config.stateRoot
      ? path.resolve(config.stateRoot)
      : path.join(os.homedir(), '.serverless', 'components', 'state')
    this.credentials = config.credentials || {}
    this.debugMode = config.debug || false

    // auto generate a resourceGroupId that would
    // be shared for all components using this context instance
    // could be overwritten below if exists in state
    this.resourceGroupId = Math.random()
      .toString(36)
      .substring(6)
  }

  async readState(id) {
    const stateFilePath = path.join(this.stateRoot, `${id}.json`)
    let state = {
      resourceGroupId: this.resourceGroupId
    }
    if ((await fileExists(stateFilePath)) && (await readFile(stateFilePath)).resourceGroupId) {
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

  // debug is useful and available even in programatic mode
  debug(msg) {
    if (!this.debugMode || !msg || msg == '') {
      return
    }

    console.log(`  DEBUG: ${msg}`) // eslint-disable-line
  }

  status() {
    return
  }
}

module.exports = Context

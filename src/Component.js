const path = require('path')
const Context = require('./Context')
const { fileExists } = require('./utils')

/**
 * Component core class
 * @param {Object} config - Configuration
 * @param {Object} config.context - The Component context.
 * @param {String} config.root - The root path of the parent Component.
 * @param {String} config.stage - The stage you wish to set in the context.
 * @param {Object} config.credentials - The credentials you wish to set in the context.
 * @param {String} config.verbose - If you wish to see all outputs of child components.
 * @param {String} config.debug - If you wish to turn on debug mode.
 */

class Component {
  constructor(id, context) {
    const name = id || this.constructor.name
    const stage = context.stage || 'dev' // todo removed this.stage. any components using it?
    this.id = id || `${stage}.${name}`

    if (!context || typeof context === 'object') {
      context = new Context(context)
    }

    // we need to keep the entire instance in memory to pass it to child components
    this.context = {
      instance: context,
      outputs: context.outputs,
      status: (msg) => context.status(false, msg, name),
      log: (msg) => context.log(msg),
      output: (key, value) => context.output(key, value)
    }

    // Set state
    this.state = {}

    // Define default function
    // Adds the instance context to it
    const that = this

    // make sure author defined at least a default function
    if (typeof that.default !== 'function') {
      throw Error(`default function is missing for component "${name}"`)
    }

    const defaultFunction = function(inputs) {
      return that.default.call(that, inputs)
    }

    // Add Component class properties like ui and state
    Object.keys(this).forEach((prop) => {
      defaultFunction[prop] = this[prop]
    })

    // Add Component class methods like the save() method
    const classMethods = Object.getOwnPropertyNames(Component.prototype)
    classMethods.forEach((classMethod) => {
      defaultFunction[classMethod] = (classMethodInputs) =>
        this[classMethod].call(that, classMethodInputs) // apply instance context
    })

    // Add instance methods
    // those are the methods of the class that extends Component
    // if user added his own save() method for example,
    // this would overwrite the Component class save() method
    const instanceMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
    instanceMethods.forEach((instanceMethod) => {
      defaultFunction[instanceMethod] = (instanceMethodInputs) =>
        this[instanceMethod].call(that, instanceMethodInputs) // apply instance context
    })

    return defaultFunction
  }

  // populating state is an async operation in most contexts
  // and we can't run async operations in the constructor
  // so we can't auto populate state on instance construction
  async init() {
    this.state = await this.context.instance.readState(this.id)
  }

  async save() {
    await this.context.instance.writeState(this.id, this.state)
  }

  async load(nameOrPath, componentAlias) {
    let externalComponentPath
    let childComponent

    if (this.context.instance.root) {
      externalComponentPath = path.resolve(this.context.instance.root, nameOrPath, 'serverless.js')
    } else {
      externalComponentPath = path.resolve(nameOrPath, 'serverless.js')
    }

    if (await fileExists(externalComponentPath)) {
      childComponent = require(externalComponentPath)
    } else {
      childComponent = require(nameOrPath)
    }

    const childComponentId = `${this.id}.${componentAlias || childComponent.name}`

    const childComponentInstance = new childComponent(childComponentId, this.context.instance)

    // populate state based on the component id
    await childComponentInstance.init()

    // If not verbose, replace outputs w/ empty function to silence child Components
    if (!this.context.instance.verbose) {
      childComponentInstance.context.log = () => {
        return
      }
      childComponentInstance.context.status = () => {
        return
      }
    }

    return childComponentInstance
  }
}

module.exports = Component

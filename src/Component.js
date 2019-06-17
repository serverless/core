const path = require('path')
const Context = require('./Context')
const { fileExists } = require('./utils')

class Component {
  constructor(id, context) {
    const name = id || this.constructor.name

    if (!context || !context.readState) {
      context = new Context(context)
    }

    this.id = id || name

    // we need to keep the entire instance in memory to pass it to child components
    this.context = {
      instance: context
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

    this.context.resourceGroupId = this.context.instance.resourceGroupId
    this.context.credentials = this.context.instance.credentials
    this.context.outputs = this.context.instance.outputs
    this.context.status = (msg) => this.context.instance.status(false, msg, this.id)
    this.context.log = (msg) => this.context.instance.log(msg)
    this.context.output = (key, value) => this.context.instance.output(key, value)
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

      childComponentInstance.context.output = (key, value) => {
        childComponentInstance.context.outputs[key] = value
        return
      }
    }

    return childComponentInstance
  }
}

module.exports = Component

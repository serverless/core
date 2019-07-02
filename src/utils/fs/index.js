const isJsonPath = require('./isJsonPath')
const isYamlPath = require('./isYamlPath')
const isArchivePath = require('./isArchivePath')
const fileExistsSync = require('./fileExistsSync')
const fileExists = require('./fileExists')
const dirExists = require('./dirExists')
const parseFile = require('./parseFile')
const readFile = require('./readFile')
const readFileSync = require('./readFileSync')
const readFileIfExists = require('./readFileIfExists')
const writeFile = require('./writeFile')
const hashFile = require('./hashFile')
const walkDirSync = require('./walkDirSync')
const copyDir = require('./copyDir')

module.exports = {
  isJsonPath,
  isYamlPath,
  isArchivePath,
  parseFile,
  fileExistsSync,
  fileExists,
  dirExists,
  writeFile,
  readFile,
  readFileSync,
  readFileIfExists,
  hashFile,
  walkDirSync,
  copyDir
}

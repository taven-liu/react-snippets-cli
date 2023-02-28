const path = require('path')

const commander = require('commander')
const fs = require('fs-extra')
const chalk = require('chalk')
const handlebars = require('handlebars')
const { lowerCaseFirst, pascalCase, paramCase } = require('change-case')

const packageJson = require('./package.json')

const program = new commander.Command(packageJson.name)

const GEN_TYPES = {
  page: 'page',
  fc: 'fc',
}

const TEMPLATES_DIRS = {
  fcCssInJs: 'templates/fc/cssInJs',
  fcCssModule: 'templates/fc/cssModule',
}

const FORMAT_TYPES = {
  kebabCase: 'kebabCase', // 'this-is-a-case',
  upperCamelCase: 'upperCamelCase', // ThisIsACase
  lowerCamelCase: 'lowerCamelCase', // thisIsACase
}

const FC_TYPE = {
  cssInJs: 'css-in-js',
  cssModule: 'css-module',
}

function init() {
  program
    .version(packageJson.version)
    .name('rsc')
    .argument('<genType>')
    .argument('<displayName>')
    .option('--type <dir>', `${FC_TYPE.cssInJs} | ${FC_TYPE.cssModule}. default is css-module`)
    .option('--out <dir>', 'Files generation directory')
    .allowUnknownOption()
    .usage('<genType> <displayName> [options]')
    .action((genType, displayName, options) => {
      switch (genType) {
        case GEN_TYPES.page:
          generatePage(displayName, options.out)
          break
        case GEN_TYPES.fc:
          generateFc(displayName, options)
          break
        default:
          console.log(chalk.redBright('Only support fc types'))
      }
    })
    .on('--help', () => {
      console.log(`    Only ${chalk.green('<displayName>')} is required.`)
    })
    .parse(process.argv)
}

function format(displayName, type) {
  switch (type) {
    case FORMAT_TYPES.kebabCase:
      return paramCase(displayName)
    case FORMAT_TYPES.lowerCamelCase:
      return lowerCaseFirst(displayName)
    default:
      return pascalCase(displayName)
  }
}

function getOutputPath(copyOutDir, compileOpts) {
  const outputPath = copyOutDir
    .replace(/{{pageName}}/g, compileOpts.pageName)
    .replace(/{{componentName}}/g, compileOpts.componentName)
    .replace(/\.hbs$/, '')

  return outputPath
}

function readFilesList(dir) {
  const filesList = []
  function inner(innerDir) {
    const files = fs.readdirSync(innerDir)
    files.forEach((item) => {
      const fullPath = path.join(innerDir, item)
      const stat = fs.statSync(fullPath)
      filesList.push(fullPath)
      if (stat.isDirectory()) {
        inner(path.join(innerDir, item), filesList)
      }
    })
  }
  inner(dir)
  return filesList
}

function createFiles(templateDir, outRootDir, { compileOptions, relativePathCreator }) {
  try {
    const fileList = readFilesList(templateDir)
    fileList.forEach((item) => {
      const stat = fs.statSync(item)
      const relativePath = relativePathCreator(item)
      const outputPath = getOutputPath(path.resolve(outRootDir, relativePath), compileOptions)

      if (stat.isFile()) {
        const content = fs.readFileSync(item).toString()
        const result = handlebars.compile(content)(compileOptions)
        fs.writeFileSync(outputPath, result)
      } else {
        fs.mkdirSync(outputPath)
      }
    })
  } catch (error) {
    console.log(`create files error: ${chalk.redBright(error)}`)
  }
}

function generatePage(displayName, optionOut) {
  const pageName = format(displayName, FORMAT_TYPES.kebabCase)
  const componentName = format(displayName, FORMAT_TYPES.upperCamelCase)

  const outRootDir = path.resolve(process.cwd(), optionOut || '')

  const templateDir = path.resolve(__dirname, TEMPLATES_DIRS.page)
  createFiles(templateDir, outRootDir, {
    compileOptions: { pageName, componentName },
    relativePathCreator: (item) => item.substring(item.indexOf('{{pageName}}')),
  })
}

function generateFc(displayName, options) {
  const { out, type = FC_TYPE.cssModule } = options
  const componentName = format(displayName, FORMAT_TYPES.upperCamelCase)
  const outRootDir = path.resolve(process.cwd(), out || '')

  const templateDir = path.resolve(
    __dirname,
    type === FC_TYPE.cssInJs ? TEMPLATES_DIRS.fcCssInJs : TEMPLATES_DIRS.fcCssModule
  )

  createFiles(templateDir, outRootDir, {
    compileOptions: { componentName },
    relativePathCreator: (item) => item.substring(item.indexOf('{{componentName}}')),
  })
}

module.exports = {
  init,
}

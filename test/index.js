const { resolve } = require('path')
const { transform: _transform } = require('babel-core')
const test = require('ava')

function transform(code) {
  return _transform(code, {
    babelrc: false,
    filename: __filename,
    sourceRoot: __dirname,
    plugins: [resolve(__dirname, '..')]
  }).code
}

function expection(expected) {
  const prefix = `${__filename}: `
  return {
    instanceOf: SyntaxError,
    message: (actual) => expected === actual.slice(prefix.length)
  }
}

test('skips non-glob import statements', (t) => {
  t.is(
    transform("import foo from 'fixtures/multiple/foo.txt'"),
    `import foo from 'fixtures/multiple/foo.txt';`
  )
})

test('rewrites glob import statements', (t) => {
  t.is(
    transform("import { foo, bar } from './fixtures/multiple/*.txt'"),
    `import foo from './fixtures/multiple/foo.txt';
import bar from './fixtures/multiple/bar.txt';`
  )
})

test('throws if imports cannot be mapped', async (t) => {
  t.throws(
    () => transform("import { bill } from './fixtures/multiple/*.txt'"),
    expection("The import 'bill' does not exist.")
  )
})

test('normalizes import paths', (t) => {
  t.is(
    transform("import { foo } from '../test/fixtures/multiple/*.txt'"),
    "import foo from './fixtures/multiple/foo.txt';"
  )
})

test('supports importing directories', (t) => {
  t.is(
    transform("import { multiple } from './fixtures/*'"),
    "import multiple from './fixtures/multiple';"
  )
})

test('supports aliasing members', (t) => {
  t.is(
    transform("import { foo as baz } from './fixtures/multiple/*.txt'"),
    "import baz from './fixtures/multiple/foo.txt';"
  )
})

test('supports aliasing namespace', (t) => {
  t.regex(
    transform("import * as members from './fixtures/multiple/*.txt'"),
    new RegExp(
      [
        "import _[a-z0-9]* from './fixtures/multiple/bar.txt';",
        "import _[a-z0-9]* from './fixtures/multiple/foo.txt';",
        'const members = {',
        "  'bar': _[a-z0-9]*,",
        "  'foo': _[a-z0-9]*",
        '};',
        'Object.freeze\\(members\\);'
      ].join('\n')
    )
  )
})

test('supports default import', (t) => {
  t.regex(
    transform("import members from './fixtures/multiple/*.txt'"),
    new RegExp(
      [
        "import _[a-z0-9]* from './fixtures/multiple/bar.txt';",
        "import _[a-z0-9]* from './fixtures/multiple/foo.txt';",
        'const members = {',
        "  'bar': _[a-z0-9]*,",
        "  'foo': _[a-z0-9]*",
        '};',
        'Object.freeze\\(members\\);'
      ].join('\n')
    )
  )
})

test('supports side-effect only imports', (t) => {
  t.is(
    transform("import './fixtures/multiple/*.txt'"),
    `import './fixtures/multiple/bar.txt';
import './fixtures/multiple/foo.txt';`
  )
})

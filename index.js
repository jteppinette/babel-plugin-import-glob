'use strict'

const crypto = require('crypto')
const path = require('path')
const glob = require('glob')
const capture = require('minimatch-capture')

function find(cwd, pattern) {
  const files = glob.sync(pattern, { cwd })
  return capture.match(files, pattern).map(([filepath, name]) => {
    return {
      filepath: './' + path.relative(cwd, path.resolve(cwd, filepath)),
      name,
      id: '_' + crypto.randomBytes(16).toString('hex')
    }
  })
}

function makeImport(t, localName, src) {
  return t.importDeclaration(
    [t.importDefaultSpecifier(t.identifier(localName))],
    t.stringLiteral(src)
  )
}

function freezeNamespaceObject(t, localName) {
  return t.expressionStatement(
    t.callExpression(
      t.memberExpression(t.identifier('Object'), t.identifier('freeze')),
      [t.identifier(localName)]
    )
  )
}

function makeNamespaceObject(t, localName, members) {
  const properties = members.map((member) =>
    t.objectProperty(t.stringLiteral(member.name), t.identifier(member.id))
  )
  return t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier(localName),
      t.objectExpression(properties)
    )
  ])
}

module.exports = (core) => {
  const t = core.types
  return {
    visitor: {
      ImportDeclaration(ast, state) {
        const specifiers = ast.node.specifiers
        const source = ast.node.source
        const error = (message) => ast.buildCodeFrameError(message)
        const pattern = source.value

        if (!glob.hasMagic(pattern)) {
          return
        }

        const cwd = path.dirname(state.file.opts.filename)
        const members = find(cwd, pattern)

        if (!specifiers.length) {
          ast.replaceWithMultiple(
            members.map((member) => {
              return t.importDeclaration([], t.stringLiteral(member.filepath))
            })
          )

          return
        }

        const replacement = []

        for (const specifier of specifiers) {
          const type = specifier.type
          const localName = specifier.local.name

          if (type === 'ImportSpecifier') {
            const importedName = specifier.imported.name
            const member = members.find((m) => m.name === importedName)
            if (!member) {
              throw error(`The import '${importedName}' does not exist.`)
            }

            replacement.push(makeImport(t, localName, member.filepath))
          } else if (
            type === 'ImportNamespaceSpecifier' ||
            type === 'ImportDefaultSpecifier'
          ) {
            for (const member of members) {
              replacement.push(makeImport(t, member.id, member.filepath))
            }
            replacement.push(
              makeNamespaceObject(t, localName, members),
              freezeNamespaceObject(t, localName)
            )
          }
        }

        ast.replaceWithMultiple(replacement)
      }
    }
  }
}

# Babel Plugin Import Glob

Babel plugin to enable importing modules using glob patterns.

## Usage

Given the following file structure:

```txt
├── images
│   ├── cat.webp
│   └── dog.webp
└── videos
    ├── example-1.mp4
    └── example-2.mp4
```

_Simple_

```js
import { cat, dog } from './images/*.webp'
```

_Alias_

```js
import { cat as c, dog as d } from './images/*.webp'
```

_Default_

```js
import videos from './videos/*.mp4'

console.log(videos['example-1'])
```

_Namespace_

```js
import * as videos from './videos/*.mp4'

console.log(videos['example-1'])
```

## Install

```sh
$ npm install @jteppinette/babel-plugin-import-glob
```

**Configuration**

This plugin simply needs to be added to the Babel plugins array.

Here is a simple bare-bones babel configuration file which only supports
this singular plugin.

_.babelrc_

```json
{
  "plugins": ["@jteppinette/babel-plugin-import-glob"]
}
```

## History

This repo was originally forked from and inspired by [novemberborn/babel-plugin-import-glob](https://github.com/novemberborn/babel-plugin-import-glob). All license and git commits have been kept intact.

The origin repo mentioned above had stagnated for many years and was missing a features that I needed:

- You could not import the default export.
- Namespace import keys were transformed into valid identifiers instead of simply using their wildcard path names.

While I do not think we would ever merge the two, I would be open to the idea.

## Development

### Required Software

- [direnv](https://direnv.net)
- [git](https://git-scm.com/)
- [nvm](https://formulae.brew.sh/formula/nvm#default)
- [pre-commit](https://pre-commit.com/#install)

### Getting Started

**Setup**

```sh
$ nvm install 16
$ direnv allow
$ pre-commit install
$ npm install
```

**Test**

```sh
$ npm test
```

### Publishing

The publish process is automated by GitHub Actions. Once a release is
created (at the end of these steps), the package will be published to
the private GitHub NPM Registry.

1. Bump version, commit, and tag:

   ```sh
   $ npm run version:<major|minor|patch>
   ```

2. Commit the changes, tag the commit, and push the tags:

   ```sh
   $ git push origin main --tags
   ```

3. Convert the tag to a release in GitHub.

   ```sh
   $ open "https://github.com/jteppinette/babel-plugin-import-glob/releases/new?tag=<tag>"
   ```

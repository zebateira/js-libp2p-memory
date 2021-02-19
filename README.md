# js-libp2p-memory

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Discourse posts](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg)](https://discuss.libp2p.io)
[![Build Status](https://travis-ci.org/libp2p/js-libp2p-memory.svg?style=flat-square)](https://travis-ci.org/libp2p/js-libp2p-memory)
[![Coverage Status](https://coveralls.io/repos/github/libp2p/js-libp2p-memory/badge.svg?branch=master)](https://coveralls.io/github/libp2p/js-libp2p-memory?branch=master)
[![Dependency Status](https://david-dm.org/libp2p/js-libp2p-memory.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-memory)
[![Bundle Size](https://flat.badgen.net/bundlephobia/minzip/libp2p-memory)](https://bundlephobia.com/result?p=libp2p-memory)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
![](https://img.shields.io/badge/npm-%3E%3D6.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D12.0.0-orange.svg?style=flat-square)

> JavaScript implementation of a memory transport for libp2p. For testing and prototyping purposes and other closed environment scenarios.

## Lead Maintainer

<!-- TBD -->

## Table of Contents

- [Install](#install)
  - [npm](#npm)
  - [Use in Node.js](#use-in-nodejs)
- [API](#api)
- [Contribute](#contribute)
- [License](#license)

## Install

### npm

```sh
> npm i libp2p-memory
```

### Use in Node.js

```js
const Memory = require('libp2p-memory')
```

## Libp2p Usage Example

```js
const Libp2p = require('libp2p')
const Memory = require('libp2p-memory')
const MPLEX = require('libp2p-mplex')
const { NOISE } = require('libp2p-noise')

const node = await Libp2p.create({
  modules: {
    transport: [Memory],
    streamMuxer: [MPLEX],
    connEncryption: [NOISE]
  }
})
```

For more information see [libp2p/js-libp2p/doc/CONFIGURATION.md#customizing-transports](https://github.com/libp2p/js-libp2p/blob/master/doc/CONFIGURATION.md#customizing-transports).

## API

### Transport

[![](https://raw.githubusercontent.com/libp2p/interface-transport/master/img/badge.png)](https://github.com/libp2p/interface-transport)

### Connection

[![](https://raw.githubusercontent.com/libp2p/interface-connection/master/img/badge.png)](https://github.com/libp2p/interface-connection)

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/libp2p/js-libp2p-ipfs/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

MIT - Protocol Labs 2021

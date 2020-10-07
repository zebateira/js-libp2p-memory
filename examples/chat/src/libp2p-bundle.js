'use strict'

const DuplexPair = require('it-pair/duplex')
const mplex = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const { NOISE } = require('libp2p-noise')
const defaultsDeep = require('@nodeutils/defaults-deep')
const libp2p = require('libp2p')

const Memory = require('../../../src')

class Node extends libp2p {
  constructor (_options) {
    const d = DuplexPair()

    const defaults = {
      modules: {
        transport: [Memory],
        streamMuxer: [ mplex ],
        connEncryption: [ NOISE, SECIO ]
      },
      config: {
        transport: {
          'Memory': { address: _options.addresses.listen[0], input: d[0], output: d[1] }
        }
      }
    }

    super(defaultsDeep(_options, defaults))
  }
}

module.exports = Node

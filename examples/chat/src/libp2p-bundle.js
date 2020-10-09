'use strict'

const EventEmitter = require('events')

const mplex = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const { NOISE } = require('libp2p-noise')
const defaultsDeep = require('@nodeutils/defaults-deep')
const libp2p = require('libp2p')

const Memory = require('../../../src')

const memory = new EventEmitter()

class Node extends libp2p {
  constructor (_options) {
    const defaults = {
      modules: {
        transport: [Memory],
        streamMuxer: [ mplex ],
        connEncryption: [ NOISE, SECIO ]
      },
      config: {
        transport: {
          'Memory': { memory }
        }
      }
    }

    super(defaultsDeep(_options, defaults))
  }
}

module.exports = Node

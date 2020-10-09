'use strict'
/* eslint-disable no-console */

const multiaddr = require('multiaddr')
const PeerId = require('peer-id')
const DuplexPair = require('it-pair/duplex')
const Node = require('./libp2p-bundle.js')
const { writeToStream, readFromStream } = require('./stream')

async function run() {
  const [idDialer, idListener] = await Promise.all([
    PeerId.createFromJSON(require('./peer-id-dialer')),
    PeerId.createFromJSON(require('./peer-id-listener'))
  ])

  const duplex = DuplexPair()
  
  // Create a new libp2p node with the given multi-address
  const nodeListener = new Node({
    peerId: idListener,
    addresses: {
      listen: ['/memory/test1'],
    },
    config: {
      transport: {
        'Memory': { duplex: [duplex[0]] }
      }
    }
  })

  // Log a message when a remote peer connects to us
  nodeListener.connectionManager.on('peer:connect', (connection) => {
    console.log('connected to: ', connection.remotePeer.toB58String())
  })

  // Handle messages for the protocol
  await nodeListener.handle('/chat/1.0.0', async ({ stream }) => {
    // Send stdin to the stream
    writeToStream(stream, 'pong')
    // Read the stream and output to console
    readFromStream(stream, () => console.log('> listener: ' + msg.toString().replace('\n', '')))
  })

  // Start listening
  await nodeListener.start()

  // Output listen addresses to the console
  console.log('Listener ready, listening on:')
  nodeListener.multiaddrs.forEach((ma) => {
    console.log(ma.toString() + '/p2p/' + idListener.toB58String())
  })

  // Dialer
  // Create a new libp2p node on localhost with a randomly chosen port
  const nodeDialer = new Node({
    peerId: idDialer,
    addresses: {
      // listen: ['/memory/test1']
    },
    config: {
      transport: {
        'Memory': { duplex: [duplex[1]] }
      }
    }
  })

  // Start the libp2p host
  await nodeDialer.start()

  // Output this node's address
  console.log('Dialer ready, listening on:')
  nodeDialer.multiaddrs.forEach((ma) => {
    console.log(ma.toString() + '/p2p/' + idDialer.toB58String())
  })

  // Dial to the remote peer (the "listener")
  const listenerMa = multiaddr(`/memory/test1/p2p/${idListener.toB58String()}`)
  const { stream } = await nodeDialer.dialProtocol(listenerMa, '/chat/1.0.0')

  console.log('Dialer dialed to listener on protocol: /chat/1.0.0')

  // Send stdin to the stream
  writeToStream(stream, 'ping')
  // Read the stream and output to console
  readFromStream(stream, () => console.log('> dialer: ' + msg.toString().replace('\n', '')))
}

run()

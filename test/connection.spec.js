'use strict'
/* eslint-env mocha */

const { expect } = require('aegir/utils/chai')
const EventEmitter = require('events')
const pipe = require('it-pipe')
const DuplexPair = require('it-pair/duplex')
const { collect } = require('streaming-iterables')
const multiaddr = require('multiaddr')

const MemoryTransport = require('../src')

describe('connection: valid localAddr and remoteAddr', () => {
  let duplex, t1, t2

  const mockUpgrader = {
    upgradeInbound: maConn => maConn,
    upgradeOutbound: maConn => maConn
  }

  beforeEach(() => {
    const memory = new EventEmitter()
    duplex = DuplexPair()

    t1 = new MemoryTransport({ upgrader: mockUpgrader, duplex: [duplex[0]], memory })
    t2 = new MemoryTransport({ upgrader: mockUpgrader, duplex: [duplex[1]], memory })
  })

  const ma = multiaddr('/memory/test1')

  it('should resolve memory test1', async () => {
    // Create a Promise that resolves when a connection is handled
    let handled
    const handlerPromise = new Promise(resolve => { handled = resolve })

    const handler = conn => handled(conn)

    // Create a listener with the handler
    const listener = t1.createListener(handler)

    // Listen on the multiaddr
    await listener.listen(ma)

    const localAddrs = listener.getAddrs()
    expect(localAddrs.length).to.equal(1)

    // Dial to that address
    const dialerConn = await t2.dial(multiaddr(`${localAddrs[0]}/p2p/QmcrQZ6RJdpYuGvZqD5QEHAv6qX4BrQLJLQPQUrTrzdcgm`))

    // Wait for the incoming dial to be handled
    const listenerConn = await handlerPromise

    // Close the listener
    await listener.close()

    expect(dialerConn.localAddr.toString())
      .to.equal(listenerConn.remoteAddr.toString())

    expect(dialerConn.remoteAddr.toString())
      .to.equal(listenerConn.localAddr.toString())
  })

  it('dial and move data around', async () => {
    // Create a listener with the echo handler
    const listener = t1.createListener(async (conn) => {
      return await pipe(conn, conn)
    })

    // Listen on the multiaddr
    await listener.listen(ma)

    const connection = await t2.dial(multiaddr(`${ma}/p2p/QmcrQZ6RJdpYuGvZqD5QEHAv6qX4BrQLJLQPQUrTrzdcgm`))

    const values = await pipe(
      ['hey'],
      connection,
      collect
    )

    expect(values).to.be.eql(['hey'])

    await listener.close()
  })
})

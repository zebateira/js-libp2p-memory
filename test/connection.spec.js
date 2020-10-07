const { expect } = require('aegir/utils/chai')
const MemoryTransport = require('../src')

const EventEmitter = require('events')
const pipe = require('it-pipe')
const DuplexPair = require('it-pair/duplex')
const { collect } = require('streaming-iterables')
const multiaddr = require('multiaddr')


describe('connection: valid localAddr and remoteAddr', () => {
    let d, t1, t2

    const mockUpgrader = {
        upgradeInbound: maConn => maConn,
        upgradeOutbound: maConn => maConn
    }

    beforeEach(() => {
        const memory = new EventEmitter()
        d = DuplexPair()
        
        t1 = new MemoryTransport({ upgrader: mockUpgrader, input: d[0], output: d[1], memory, address: '/memory/test1' })
        t2 = new MemoryTransport({ upgrader: mockUpgrader, input: d[1], output: d[0], memory, address: '/memory/test1' })
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
        const dialerConn = await t2.dial(localAddrs[0])

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
        // Create a listener with the handler
        const listener = t1.createListener(async (conn) => {
            return pipe(conn, conn)
        })

        // Listen on the multiaddr
        await listener.listen(ma)

        const connection = await t2.dial(ma)

        const values = await pipe(
            ['hey'],
            connection,
            collect
        )

        expect(values).to.be.eql(['hey'])
        // expect(values).to.be.eql([Buffer.from('hey')])
        await listener.close()
    })

})
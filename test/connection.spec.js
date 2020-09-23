const { expect } = require('aegir/utils/chai')
const MemoryTransport = require('../src')

const pipe = require('it-pipe')
const multiaddr = require('multiaddr')
const DuplexPair = require('it-pair/duplex')

describe.only('connection: valid localAddr and remoteAddr', () => {
    let d, t1, t2

    const mockUpgrader = {
        upgradeInbound: maConn => maConn,
        upgradeOutbound: maConn => maConn
    }

    beforeEach(() => {
        const d = DuplexPair()
        
        t1 = new MemoryTransport({ upgrader: mockUpgrader, inPair: d[0], outPair: d[1] })
        t2 = new MemoryTransport({ upgrader: mockUpgrader, inPair: d[1], outPair: d[0] })
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

        // TODO: needs localAddr
        // expect(dialerConn.localAddr.toString())
        //     .to.equal(listenerConn.remoteAddr.toString())

        // expect(dialerConn.remoteAddr.toString())
        //     .to.equal(listenerConn.localAddr.toString())
    })

    it('dial and move data around', async () => {
        // Create a listener with the handler
        const listener = t1.createListener((conn) => {
            pipe(conn, conn)
        })

        // Listen on the multiaddr
        await listener.listen(ma)

        const connection = await t2.dial(ma)

        const values = await pipe(
            ['hey'],
            connection,
            collect
        )

        expect(values).to.be.eql([Buffer.from('hey')])
        await listener.close()
    })

})
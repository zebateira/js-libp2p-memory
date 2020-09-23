const EventEmitter = require('events')
const withIs = require('class-is')
const pair = require('it-pair')

const constants = {
    CODE_P2P: 421
}

class MemoryTransport {
    peers = []

    constructor({ upgrader, inPair, outPair }) {
        console.log('[MemoryTransport.construct]', upgrader)

        if (!upgrader) {
            throw new Error('An upgrader must be provided. See https://github.com/libp2p/interface-transport#upgrader.')
        }

        this._upgrader = upgrader
        this._in = inPair
        this._out = outPair
    }

    async dial(ma, options = {}) {
        console.log('[MemoryTransport.dial]', ma, ma.toString(), ma.protos())

        const maConn = {
            conn: this._out,
            remoteAddr: ma,
            signal: options.signal,
            close: (error) => {
                console.log('maCoon - close', error)
            },
            sink: this._out.sink,
            source: this._out.source,
            timeline: {
                open: Date.now()
            }
        }

        this._maConn = maConn

        console.log('new outbound connection %s', maConn.remoteAddr)

        const conn = await this._upgrader.upgradeOutbound(maConn)

        console.log('outbound connection %s upgraded', maConn.remoteAddr)

        return conn
    }

    createListener(options = {}, handler) {
        const listener = new EventEmitter()

        // console.log('[MemoryTransport.createListener]', options, handler)

        if (!handler && typeof options === 'function') {
            handler = options
            options = {}
        }


        // setTimeout(() => listener.emit('listening'), 2000)
        // setTimeout(() => listener.emit('connection', {}), 3000)

        let peerId, listeningAddr

        listener.listen = ma => {
            listeningAddr = ma
            peerId = ma.getPeerId()

            if (peerId) {
                listeningAddr = ma.decapsulateCode(constants.CODE_P2P)
                // console.log('listen', peerId)
            }

            const maConn = {
                conn: this._in,
                remoteAddr: ma,
                signal: options.signal,
                close: (error) => {
                    console.log('maCoon - close', error)
                },
                sink: this._in.source,
                source: this._in.sink,
                timeline: {
                    open: Date.now()
                }
            }

            const upgradedConnection = this._upgrader.upgradeInbound(maConn)
            handler && handler(upgradedConnection)

            return upgradedConnection
        }

        listener.getAddrs = () => {
            return peerId ? [listeningAddr.encapsulate(`/p2p/${peerId}`)] : [listeningAddr]
        }

        listener.close = () => console.log('[MemoryTransport.listener]', 'event: close')

        return listener
    }

    /**
    * Takes a list of `Multiaddr`s and returns only valid memory addresses
    * @param {Multiaddr[]} multiaddrs
    * @returns {Multiaddr[]} Valid Memory multiaddrs
    */
    filter(multiaddrs) {
        multiaddrs = Array.isArray(multiaddrs) ? multiaddrs : [multiaddrs]

        return multiaddrs.filter(ma => ma.protoNames().includes('memory'))
    }
}

const EnhancedMemoryTransport = withIs(MemoryTransport, { className: 'Memory', symbolName: '@libp2p/js-libp2p-memory/Memory' })

module.exports = EnhancedMemoryTransport

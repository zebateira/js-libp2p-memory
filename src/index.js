const EventEmitter = require('events')
const withIs = require('class-is')

const toConnection = require('./to-connection')

const constants = {
    CODE_P2P: 421
}

class MemoryTransport {
    peers = []

    // TODO: libp2p provides itself to the transport: https://github.com/libp2p/js-libp2p/blob/master/src/transport-manager.js#L45
    // change this to receive libp2p and use peer id to listen on memory event as:
    // /memory/test1/p2p/QmcrQZ6RJdpYuGvZqD5QEHAv6qX4BrQLJLQPQUrTrzdcgm
    // current: /memory/test1
    constructor({ upgrader, duplex, memory }) {
        // console.log('[MemoryTransport.construct]', address, input, output)

        if (!upgrader) {
            throw new Error('An upgrader must be provided. See https://github.com/libp2p/interface-transport#upgrader.')
        }

        this._upgrader = upgrader
        this._duplex = duplex[0]
        this._memory = memory
    }

    async dial(ma, options = {}) {
        // console.log('[MemoryTransport.dial]', ma, ma.toString(), ma.protos())
        this._memory.emit(ma.decapsulate('/p2p').toString()) // TODO: remove this once libp2p peer id is provided

        this._dialConnection = toConnection({
            localAddr: this.listeningAddress,
            remoteAddr: ma,
            duplex: this._duplex
        })
        
        // console.log('new outbound connection %s', this._dialConnection)

        const conn = await this._upgrader.upgradeOutbound(this._dialConnection)

        // console.log('outbound connection %s upgraded', this._dialConnection.remoteAddr)

        return conn
    }

    createListener(options = {}, handler) {
        const listener = new EventEmitter()

        // console.log('[MemoryTransport.createListener]', options, handler)

        if (!handler && typeof options === 'function') {
            handler = options
            options = {}
        }

        let peerId

        console.log('create listener', handler)
        
        listener.listen = ma => {
            this.listeningAddress = ma

            console.log('listen ma', ma)

            this._memory.on(this.listeningAddress.toString(), async () => {
                const upgradedConnection = await this._upgrader.upgradeInbound(toConnection({
                    localAddr: this.listeningAddress,
                    duplex: this._duplex
                }))

                handler(upgradedConnection)
                listener.emit('connection', upgradedConnection)
            })

            peerId = ma.getPeerId()
            
            if (peerId) {
                this.listeningAddress = ma.decapsulateCode(constants.CODE_P2P)
            }

            return new Promise(resolve => {
                listener.emit('listening', this.listeningAddress.toString())
                resolve()
            })
        }

        listener.getAddrs = () => {
            return peerId ? [this.listeningAddress.encapsulate(`/p2p/${peerId}`)] : [this.listeningAddress]
        }

        listener.close = () => {} // console.log('[MemoryTransport.listener]', 'event: close')

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

const EventEmitter = require('events')
const withIs = require('class-is')

const toConnection = require('./to-connection')

const constants = {
    CODE_P2P: 421
}

class MemoryTransport {
    peers = []

    constructor({ upgrader, duplex, memory }) {
        // console.log('[MemoryTransport.construct]', address, input, output)

        if (!upgrader) {
            throw new Error('An upgrader must be provided. See https://github.com/libp2p/interface-transport#upgrader.')
        }

        this._upgrader = upgrader
        this._input = duplex[0]
        this._output = duplex[1]
        this._memory = memory
    }

    async dial(ma, options = {}) {
        // console.log('[MemoryTransport.dial]', ma, ma.toString(), ma.protos())
        this._memory.emit(ma)

        this._dialConnection = toConnection({
            address: ma,
            input: this._input,
            output: this._output,
        })
        
        // console.log('new outbound connection %s', this._dialConnection.remoteAddr)

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

        let peerId, listeningAddress
        
        listener.listen = ma => {
            listeningAddress = ma

            this._memory.on(listeningAddress, async () => {
                const upgradedConnection = await this._upgrader.upgradeInbound(toConnection({
                    address: listeningAddress,
                    input: this._output,
                    output: this._input,
                }))

                handler(upgradedConnection)
                listener.emit('connection', upgradedConnection)
            })

            peerId = ma.getPeerId()
            
            if (peerId) {
                listeningAddress = ma.decapsulateCode(constants.CODE_P2P)
            }

            return new Promise(resolve => {
                listener.emit('listening', listeningAddress.toString())
                resolve()
            })
        }

        listener.getAddrs = () => {
            return peerId ? [listeningAddress.encapsulate(`/p2p/${peerId}`)] : [listeningAddress]
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

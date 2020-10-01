// Convert a multiaddr into a MultiaddrConnection
// https://github.com/libp2p/interface-transport#multiaddrconnection
module.exports = ({ address, input, output }, options = {}) => ({
    // async sink(source) {
    //     await output((async function* () {
    //         for await (const chunk of source) {
    //             // Convert BufferList to Buffer
    //             yield Buffer.isBuffer(chunk) ? chunk : chunk.slice()
    //         }
    //     })())
    // },

    sink: output.sink,

    source: input.source,

    conn: { input, output },

    localAddr: address,

    // If the remote address was passed, use it - it may have the peer ID encapsulated
    remoteAddr: address,

    timeline: { open: Date.now() },

    close() {
        console.log('to-connection - close()')
    }
})
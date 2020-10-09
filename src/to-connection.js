// Convert a multiaddr into a MultiaddrConnection
// https://github.com/libp2p/interface-transport#multiaddrconnection
module.exports = ({ localAddr, remoteAddr, duplex }, options = {}) => ({
    sink: duplex.sink,
    source: duplex.source,
    conn: duplex,
    localAddr,
    // If the remote address was passed, use it - it may have the peer ID encapsulated
    remoteAddr,
    timeline: { open: Date.now() },
    close() {
        console.log('to-connection - close()')
    }
})
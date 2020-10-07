/* eslint-env mocha */
'use strict'

const tests = require('libp2p-interfaces/src/transport/tests')
const multiaddr = require('multiaddr')
const YourTransport = require('../src')

// TODO: This needs to be skipped and evaluate if it makes sense in this case.
describe.skip('compliance', () => {
    tests({
        setup(options) {
            let transport = new YourTransport({ ...options, address: '/memory/test1' })

            const addrs = [
                multiaddr('/memory/test1')
            ]

            const connect = () => {}

            const connector = {
                on: () => {},
                delay(delayMs) {
                    // Add a delay in the connection mechanism for the transport
                    // (this is used by the dial tests)
                    network.connect = (...args) => setTimeout(() => connect(...args), delayMs)
                },
                restore() {
                    // Restore the connection mechanism to normal
                    network.connect = connect
                }
            }

            return { transport, addrs, connector }
        },
        teardown() {
            // Clean up any resources created by setup()
        }
    })
})
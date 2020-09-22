/* eslint-env mocha */
'use strict'

const tests = require('libp2p-interfaces/src/transport/tests')
const multiaddr = require('multiaddr')
const YourTransport = require('../src')

describe('compliance', () => {
    tests({
        setup(options) {
            let transport = new YourTransport(options)

            const addrs = [
                multiaddr('/memory/test1'),
                multiaddr('/memory/test2')
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
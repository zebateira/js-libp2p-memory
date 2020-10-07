'use strict'
/* eslint-disable no-console */

const pipe = require('it-pipe')
const lp = require('it-length-prefixed')


function writeToStream(stream, data) {
  pipe(
    data,
    lp.encode(),
    stream.sink
  )
}

function readFromStream(stream, handler) {
  pipe(
    stream.source,
    lp.encode(),
    async function (source) {
      // For each chunk of data
      for await (const msg of source) {
        handler(msg)
      }
    }
  )
}

module.exports = {
  writeToStream,
  readFromStream
}

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
      let message = ''
      // For each chunk of data
      for await (const chunk of source) {
        message += chunk
      }
      handler(message)
    }
  )
}

module.exports = {
  writeToStream,
  readFromStream
}

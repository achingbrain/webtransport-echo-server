const CHUNKS = 1024
const CHUNK_LENGTH = 1024

async function main () {
  // dial the echo server
  const transport = new WebTransport('https://127.0.0.1:8080', {
    serverCertificateHashes: [{
      algorithm: 'sha-256',
      value: Uint8Array.from([207, 238, 167, 126, 219, 130, 217, 61, 179, 131, 167, 107, 120, 212, 235, 124, 93, 34, 32, 109, 222, 130, 71, 205, 75, 173, 88, 198, 201, 103, 83, 111])
    },{
      algorithm: 'sha-256',
      value: Uint8Array.from([25, 72, 22, 187, 18, 49, 39, 92, 202, 83, 1, 93, 84, 80, 23, 212, 136, 114, 230, 88, 250, 82, 221, 248, 115, 202, 52, 189, 95, 238, 19, 71])
    }]
  })

  // wait for the connection to become established
  await transport.ready
  console.info('transport ready')

  // count how many chunks have been received
  let received = 0

  // create a bidirectional echo stream
  const stream = await transport.createBidirectionalStream()

  // write and read data simultaneously
  await Promise.all([
    async function writeData () {
      const writer = await stream.writable.getWriter()

      for (let i = 0; i < CHUNKS; i++) {
        await writer.ready

        const buf = Uint8Array.from(new Array(CHUNK_LENGTH).fill(0))
        writer.write(buf).catch(() => {})
      }

      console.info('closing writer')
      await writer.close()
    }(),
    async function readData () {
      const reader = await stream.readable.getReader()

      while (true) {
        const result = await reader.read()

        if (result.done) {
          console.info('finished reading')
          return
        }

        received += result.value.byteLength
      }
    }()
  ])

  console.info('done send and read', received, 'bytes of', CHUNKS * CHUNK_LENGTH)
}

main().catch(err => {
  console.error(err.stack)
})

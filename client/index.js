const CHUNKS = 1024
const CHUNK_LENGTH = 1024

async function main () {
  // dial the echo server
  const transport = new WebTransport('https://127.0.0.1:8080', {
    serverCertificateHashes: [{
      algorithm: 'sha-256',
      value: Uint8Array.from(atob('h4hbcdPdZ5HduF/F0e51SU59awRDAToXqVkpx2GlSZw='), (m) => m.codePointAt(0))
    },{
      algorithm: 'sha-256',
      value: Uint8Array.from(atob('b8RpavRa5qw3/Z09QxF9mw6go2GiQlzxLCJvJ4YuFZQ='), (m) => m.codePointAt(0))
    }]
  })

  // wait for the connection to become established
  await transport.ready

  // create a bidirectional echo stream
  const stream = await transport.createBidirectionalStream()

  // count how many bytes have been received
  let received = 0

  // write and read data simultaneously
  await Promise.all([
    // write data
    async function writeData () {
      const writer = await stream.writable.getWriter()

      for (let i = 0; i < CHUNKS; i++) {
        await writer.ready

        const buf = Uint8Array.from(new Array(CHUNK_LENGTH).fill(0))
        writer.write(buf).catch(() => {})
      }

      await writer.close()
    }(),

    // read data
    async function readData () {
      const reader = await stream.readable.getReader()

      while (true) {
        const result = await reader.read()

        if (result.done) {
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

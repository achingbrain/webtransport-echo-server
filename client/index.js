const CHUNKS = 1024
const CHUNK_LENGTH = 1024

async function main () {
   const transport = new WebTransport('https://127.0.0.1:8080', {
    serverCertificateHashes: [{
      algorithm: 'sha-256',
      value: Uint8Array.from([120, 65, 196, 146, 185, 143, 66, 45, 248, 228, 43, 158, 160, 214, 25, 93, 53, 191, 102, 225, 100, 46, 149, 15, 103, 45, 252, 17, 1, 128, 77, 181])
    },{
      algorithm: 'sha-256',
      value: Uint8Array.from([135, 235, 207, 31, 73, 31, 71, 226, 71, 57, 165, 51, 233, 210, 196, 237, 189, 96, 70, 25, 200, 51, 104, 112, 111, 104, 11, 109, 35, 69, 58, 231])
    }]
  })

  await transport.ready
  console.info('transport ready')

  let received = 0
  const stream = await transport.createBidirectionalStream()

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

        received++
      }
    }()
  ])

  console.info('done send and read', received, 'of', CHUNKS)
}

main().catch(err => {
  console.error(err.stack)
})

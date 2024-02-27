import { Http3Server } from '@fails-components/webtransport'
import { generateWebTransportCertificates } from './certificate.js'

const certificates = await generateWebTransportCertificates([
  { shortName: 'C', value: 'DE' },
  { shortName: 'ST', value: 'Berlin' },
  { shortName: 'L', value: 'Berlin' },
  { shortName: 'O', value: 'webtransport Test Server' },
  { shortName: 'CN', value: '127.0.0.1' }
], [{
  // can be max 14 days according to the spec
  days: 13
}])

const server = new Http3Server({
  port: 8080,
  host: '0.0.0.0',
  secret: certificates[0].secret,
  cert: certificates[0].pem,
  privKey: certificates[0].privateKey
})

await server.startServer()
await server.ready

console.info('server started')

const address = server.address()

console.info(`
  const transport = new WebTransport('https://127.0.0.1:${address?.port}', {
    serverCertificateHashes: [${certificates.map(cert => `{
      algorithm: 'sha-256',
      value: Uint8Array.from(atob('${btoa(String.fromCodePoint(...cert.hash.digest))}'), (m) => m.codePointAt(0))
    }`)}]
  })
`)

const sessionStream = server.sessionStream('/')
const sessionReader = sessionStream.getReader()

while (true) {
  const { done, value: session } = await sessionReader.read()

  if (done) {
    console.info('session reader finished')
    break
  }

  console.info('new incoming session')
  void Promise.resolve()
    .then(async () => {
      try {
        await session.ready
        console.info('session ready')

        const bidiStreamReader = session.incomingBidirectionalStreams.getReader()

        while (true) {
          const result = await bidiStreamReader.read()

          if (result.done) {
            break
          }

          result.value.readable
            .pipeTo(result.value.writable)
            .catch(err => {
              console.error('error piping stream back to itself', err)
            })
        }
      } catch (err) {
        console.error('error waiting for session to become ready', err)
      }
    })
}

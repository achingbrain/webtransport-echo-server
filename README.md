# WebTransport echo server

Uses the `@fails-components/webtransport` module to create a WebTransport server
that accepts incoming bidirectional streams and echos any data sent back to the
sender.

## What?

The `WebTransport` spec [Example #4](https://www.w3.org/TR/webtransport/#example-sending-stream)
shows how to open a stream, create a writer, send data then close the writer.

Before writing it awaits on the `.ready` promise of the writer to support
backpressure and not overload the transport.

Before closing the stream it does not ensure that the bytes have been sent,
which implies that they should be sent.

Depending on application load this does not appear to be the case, instead
unsent bytes can end up being discarded.

[This codepen](https://codepen.io/achingbrain/pen/eYXqyYP) connects to an echo
server, sends 1024 chunks of 1024 bytes before closing the writer.  At the same
time a reader is configured to counts the bytes that are sent back before the
reader closes.

## Usage

* Clone this repo then r
* Run `npm i`
* Run `npm start`
* Replace the `WebTransport` creation code in the [codepen](https://codepen.io/achingbrain/pen/eYXqyYP) example
* Let the example run, you should see something like:

```
"transport ready"
"closing writer"
"finished reading"
"done send and read" 196608 "bytes of" 1048576
```

If all queued writes are sent after the `.close` function is called, you would
expect to see:

```
"done send and read" 1048576 "bytes of" 1048576
```

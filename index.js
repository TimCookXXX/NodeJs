const express = require('express')
const app = express()

const LIMIT = 25
const DELAY = 500
const PORT = 3000
let date
let connections = []

app.get('/date', (req, res, next) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Transfer-Encoding', 'chunked')
  connections.push(res)
})

let tick = 0
setTimeout(function run() {
  date = new Date().toUTCString()
  console.log(`${tick}, at time ${date}`)
  if (++tick > LIMIT) {
    connections.map((res) => {
      res.write(`Server closed the connection at time: ${date}\n`)
      res.end()
    })
    connections = []
    tick = 0
  }
  connections.map((res, i) => {
    res.write(`Hello ${i} user! Tick: ${tick}, date: ${date}\n`)
  })
  setTimeout(run, DELAY)
}, DELAY)

app.listen(PORT, () => {
  console.log(`Server is running port on ${PORT}`)
})

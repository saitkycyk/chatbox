require('dotenv').config()

const express = require('express')
const app = express()
app.use(express.json())
const host = process.env.host
const port = process.env.port
const target = "http://" + host + ":" + port;

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

readline.on('line', (input) => {
    sendMessage(input);
});

app.post('/', (req, res) => {
    console.log(req.body.message, "#12AB00")
    res.sendStatus(200);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

function sendMessage(message) {
    var message = (new Date().toLocaleString("en-US", {timeZone: "Europe/Vienna", hour12: false})) + ": " + message
    fetch(target, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({message})})
}
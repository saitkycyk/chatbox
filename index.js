require('dotenv').config()
const express = require('express')
const app = express()
app.use(express.json())
const net = require('net');
const axios = require('axios');
const host = process.env.host
const port = process.env.port
const target = `http://${host}:${port}`;
var receiverStatus = null;

setInterval(function(){
    checkReceiver()
}, 1000);

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

readline.on('line', (input) => {
    sendMessage(input);
});

app.post('/', (req, res) => {
    console.log('\x1b[32m', "> "+req.body.message, '\x1b[0m');
    res.sendStatus(200);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

function sendMessage(message) {

    var message = `${getDate()}: ${message}`

    axios.post(target, {message}, {timeout: 3000})
      .then(function (response) {
      })
      .catch(function (error) {
        console.log('\x1b[31m', "> Message not sent!", '\x1b[0m');
      });
}

function getDate() {
    return new Date().toLocaleString("en-US", {timeZone: "Europe/Vienna", hour12: false});
}

function checkReceiver() {
    var sock = new net.Socket();
    sock.setTimeout(500);
    sock.on('connect', function() {
        if("online" !== receiverStatus) {
            console.log('\x1b[32m',`Receiver is online!`, '\x1b[0m')
        }
        receiverStatus = "online";
        sock.destroy();
    }).on('error', function(e) {
        if("offline" !== receiverStatus) {
            console.log('\x1b[31m' ,`Receiver is offline!`, '\x1b[0m')
        }
        receiverStatus = "offline";
    }).on('timeout', function(e) {
        if("offline" !== receiverStatus) {
            console.log('\x1b[31m', `Receiver is offline!`, '\x1b[0m')
        }
        receiverStatus = "offline";
    }).connect(port, host);
}
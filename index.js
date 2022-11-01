require('dotenv').config()
const express = require('express')
const app = express()
app.use(express.json())
const net = require('net');
const axios = require('axios');
var host = process.env.host ?? localhost
const port = process.env.port
var receiverStatus = null;

app.post('/', (req, res) => {
    console.log('\x1b[32m', "> "+req.body.message, '\x1b[0m');
    res.sendStatus(200);
})

app.listen(port, () => {
    console.log(`Chatbox started, listening to port: ${port}...`)
})

initializeClient();

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

readline.on('line', (input) => {
    sendMessage(input);
});

function sendMessage(message) {

    var message = `${getDate()}: ${message}`

    axios.post(`http://${host}:${port}`, {message}, {timeout: 3000})
        .then(function (response) {})
        .catch(function (error) {
            console.log('\x1b[31m', "> Message not sent!", '\x1b[0m');
        });
}

function getDate() {
    return new Date().toLocaleString("en-US", {timeZone: "Europe/Vienna", hour12: false});
}

async function initializeClient() {
    if(host) {
        await checkReceiver();
        await new Promise(r => setTimeout(r, 600));
    }

    if(receiverStatus != "online") {
        await findIp();
    }
    
    setInterval(function() {
        checkReceiver();
    }, 1000)
}

async function checkReceiver() {
    var sock = new net.Socket();
    sock.setTimeout(500);
    sock.on('connect', function() {
        if("online" !== receiverStatus) {
            console.log('\x1b[32m',`Receiver is online!`, '\x1b[0m')
            receiverStatus = "online";
        }
        sock.destroy();
    }).on('error', function(e) {
        if("offline" !== receiverStatus) {
            console.log('\x1b[31m' ,`Receiver is offline!`, '\x1b[0m')
            receiverStatus = "offline";
        }
    }).on('timeout', function(e) {
        if("offline" !== receiverStatus) {
            console.log('\x1b[31m', `Receiver is offline!`, '\x1b[0m')
            receiverStatus = "offline";
        }
    }).connect(port, host);
}


function findIp() {
    return new Promise((resolve) => {
        console.log("Trying to find the receiver dynamically...");
    
        findMyIp().then(async function(myip) {
            if(myip == "0.0.0.0") {
                console.log("Could not find the local IP! IP autodetect failed!")
                resolve(false);
                return;
            }

            const seperatedIp = myip.split('.');
            for(var i = 0; i < 255; i++) {
                if(i == seperatedIp[3]) {continue;}

                findReceiver(`${seperatedIp[0]}.${seperatedIp[1]}.${seperatedIp[2]}.${i}`);
            }
        });

        resolve(true);
    })
}

function findReceiver(possibleIp) {
    return new Promise((resolve) => {
        var sock = new net.Socket();
        sock.setTimeout(50);
        sock.on('connect', function() {
            host = possibleIp
            resolve(possibleIp);
            console.log("Receiver is found successfuly!");
        }).on('error', function(e) {
            resolve(false);
        }).on('timeout', function(e) {
            resolve(false);
        }).connect(port, possibleIp);
    });
}

function findMyIp() {
    return new Promise((resolve) => {
        var interfaces = require('os').networkInterfaces();
        for (var devName in interfaces) {
        var iface = interfaces[devName];
    
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
            resolve(alias.address);
        }
        }
        resolve('0.0.0.0');
    });
}
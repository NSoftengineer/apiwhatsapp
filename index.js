const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');
const fs = require('fs');

const app = express();
const port = 3000;

// Create a new client using local authentication (saves session so you don't need to scan every time)
const client = new Client({
    authStrategy: new LocalAuth()
});


// Event listener for QR code generation (for initial login)
client.on('authenticated', (session) => {
    console.log('QR code received, generating QR image...' + session);


});

// Event listener for QR code generation (for initial login)
client.on('qr', qr => {
    console.log('QR code received, generating QR image...');

    // Generate the QR code and save it to a file
    qrcode.toFile('img/whatsapp_qr.png', qr, {
        color: {
            dark: '#000000',  // Black color for the code
            light: '#FFFFFF'  // White background
        }
    }, (err) => {
        if (err) {
            console.error('Error saving QR code:', err);
        } else {
            console.log('QR code saved as whatsapp_qr.png');
        }
    });
});

// Event listener when client is ready
client.on('ready', () => {
    console.log('WhatsApp client is ready');

    // // Send a message
    // const number = 'YOUR_PHONE_NUMBER'; // The number you want to send the message to, including country code.
    // const message = 'Hello from Node.js using whatsapp-web.js!';

    // client.sendMessage(`${number}@c.us`, message)  // WhatsApp uses the @c.us suffix for numbers.
    //     .then(response => {
    //         console.log('Message sent:', response);
    //     })
    //     .catch(error => {
    //         console.error('Error sending message:', error);
    //     });
});
// app.use(express.static('public'));
app.use('/images', express.static('img'));

// API to send WhatsApp message
app.get('/', (req, res) => {
    // return res.status(200).send({ success: 'WhatsApp client is ready' });
    return res.status(200).json({
        'imageName': 'some image',
        'imageUrl': '/whatsapp_qr.png'
    });
});


// API to send WhatsApp message
app.get('/check-connect', express.json(), (req, res) => {
    // When the client is ready, run this code (only once)
    client.once('ready', () => {
        console.log('Client is ready!');
    });
});
// API to send WhatsApp message
app.get('/check-api', express.json(), (req, res) => {
    return res.status(200).send({ success: 'WhatsApp client is ready' });
});


// API to send WhatsApp message
app.post('/send-message', express.json(), (req, res) => {
    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).send({ error: 'Phone and message are required' });
    }

    client.sendMessage(`${phone}@c.us`, message)
        .then((response) => {
            res.status(200).send({ success: 'Message sent successfully', response });
        })
        .catch((error) => {
            res.status(500).send({ error: 'Failed to send message', details: error });
        });
});

app.listen(port, () => {
    console.log(`WhatsApp API listening at http://localhost:${port}`);
});

// Initialize the client
client.initialize();

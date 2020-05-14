let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let express = require('express');
const path = require("path");

// Load our custom classes
const CustomerStore = require('./customerStore.js');
const MessageRouter = require('./messageRouter.js');

// Grab the service account credentials path from an environment variable
const keyPath = "robo-sphere-whfyeg-5df665ddde86.json";
if(!keyPath) {
    console.log('You need to specify a path to a service account keypair in environment variable DF_SERVICE_ACCOUNT_PATH. See README.md for details.');
    process.exit(1);
}

// Load and instantiate the Dialogflow client library
const { SessionsClient } = require('dialogflow');
const dialogflowClient = new SessionsClient({
    keyFilename: keyPath
})

// Grab the Dialogflow project ID from an environment variable
const projectId = "robo-sphere-whfyeg";
if(!projectId) {
    console.log('You need to specify a project ID in the environment variable DF_PROJECT_ID. See README.md for details.');
    process.exit(1);
}

// Instantiate our app
const customerStore = new CustomerStore();
const messageRouter = new MessageRouter({
    customerStore: customerStore,
    dialogflowClient: dialogflowClient,
    projectId: projectId,
    customerRoom: io.of('/customer'),
    operatorRoom: io.of('/operator')
});


app.get('/operator', (req, res) => {
    res.sendFile(`${__dirname}/operator.html`);
});

app.get('/customer', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});
app.get('/test', (req, res) => {
    res.sendFile(__dirname + '/test.html')
});
app.use(express.static(path.join(__dirname, "static")));
messageRouter.handleConnections();
http.listen(3000, () => {
    console.log('Listening on port *: 3000');
});

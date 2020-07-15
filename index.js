let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let express = require('express');
const path = require("path");
const API_PORT = process.env.PORT || 3000
const bodyParser = require('body-parser')


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
    customerRoom: io.of('/'),
    operatorRoom: io.of('/operator')
});
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json());


app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});
app.get('/operator', (req, res) => {
    res.sendFile(`${__dirname}/operator.html`);
});

app.get('/customer', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});
app.post('/messagesFromWebim', function (req, res) {
    const body = req.body.text;
    const user_id = req.body.to.id;
    console.log(user_id, 'ID USERA');
    res.set('Content-Type', 'text/plain')
    res.send(`You sent: ${body} to Express`)
    messageRouter._sendMessageFromApiToUser(body, user_id);
})
app.post('/messagesFromJivoSite', function (req, res) {
    const body = req.body.message.text;
    const user_id  = req.body.recipient.id;
    // const user_id = req.body.recipient.id;
    // console.log(user_id, 'ID USERA');
    // console.log(user_id, 'TEXT');
    res.set('Content-Type', 'text/plain')
    res.send(`You sent: ${body} to Express`)
    messageRouter._sendMessageFromApiToUser(body, user_id);
})
app.use(express.static(path.join(__dirname, "static")));
messageRouter.handleConnections();
http.listen(API_PORT, () => {
    console.log('Listening on port *: 3000');
});

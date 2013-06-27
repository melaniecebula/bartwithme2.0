var express = require('express');
var app = express.createServer();

var mongo = require('mongoskin');
var db = mongo.db('localhost:3000/test?auto_reconnect');
var MongoStore = require('connect-mongodb');


var http = require('http');
//var server = http.createServer(app);
//var sio = require('socket.io');
//var io = sio.listen(server);

var web = require('./web.js');
var auth = require('./auth.js');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());
app.use(express.cookieParser());


app.use(express.session({ secret: '#yolo', maxAge : new Date(Date.now() + 2628000000)}));

app.get('/', web.home);
app.post('/', auth.validateBart, auth.bartTrip);


app.get('/login', web.login);
app.post('/login', auth.validateLogin, auth.login);

app.get('/register', web.register);
app.post('/register', auth.validateRegistration, auth.register);

app.listen(3000);

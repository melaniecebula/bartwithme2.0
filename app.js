//express
var express = require('express')
  , http = require('http')
  , app = express()
  , server = http.createServer(app)
  , sio = require('socket.io')
  , io = sio.listen(server)
  , path = require('path');

//config express
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, '/static')));
});

//not sure what this does???
app.configure('development', function(){
  app.use(express.errorHandler());
});

//mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    //yay!
});

var userSchema = mongoose.Schema({
    name: String
})

var userInfoSchema = mongoose.Schema({
    name: String
    //other stuff
})
var userColl = mongoose.model('user', userSchema)
var userInfoColl = mongoose.model('userinfo', userInfoSchema)

//TODO:  check to see if user is logged in/ connected to fb already
//redirect to '/'
//TODO: sockets?  db?
app.get('/', function(req, res) {
    res.render("login");
});

app.get('/login', function(req, res) {
    res.render("login")
});

//TODO post requests
app.post('reportTimeAndRoute', function(req, res) {
    var time = req.body.time;
    var route = req.body.route;
    var toInsert = {$set: {time: time, route: route}};
});

//listening on port 3000
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

//socket.io sockets
//TODO:  understand sockets better :u
io.sockets.on('connection', function (socket) {
    socket.on('join', function (data) {
        console.log(data);
        var userID = data._id
        var toInsert = {$set: {socketID: socket.id}};
        //Model.update(conditions, update, [options], [callback])
        userColl.update({socketID: socketID}, toInsert, function(err) {
            if(err){
                console.log(err);
            }
        });
    });
    socket.on('disconnect', function() {
        var socketID = socket.id
        var toInsert = {$set: {socketID: null}};
        userColl.update({socketID:socketID}. toInsert, function(err) {
            if(err){
                console.log(err);
            }
        });
    });
});
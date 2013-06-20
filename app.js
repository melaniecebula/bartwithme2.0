//express
var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();

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

//basic served file
app.get('/', function(req, res) {
    res.render("login");
});

//listening on port 3000
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

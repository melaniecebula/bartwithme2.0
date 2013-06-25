var mongo = require('mongoskin');
var ObjectID = require('mongoskin').ObjectID;
var db = mongo.db('localhost:27017/dataHub?auto_reconnect', {safe: true});
var MetaData = db.collection('MetaData');

exports.home = function(req, res) {
    console.log('rendering home')
    res.render('index');
};

exports.register = function(req, res) {
    //loggedIn: true || false
    console.log('rendering registration')
    var loggedIn = !!req.session.user;
    res.render('register', {loggedIn: loggedIn});
};

exports.login = function(req, res) {
    //loggedIn: true || false
    console.log('rendering login')
    var loggedIn = !!req.session.user;
    res.render('login', {loggedIn: loggedIn});
};
var form = require('express-form'),
    field = form.field;
var mongo = require('mongoskin');
var ObjectID = require('mongoskin').ObjectID;
var db = mongo.db('localhost:27017/dataHub?auto_reconnect', {safe: true});
var Users = db.collection('Users');
var hash = require('node_hash');

var generateId = function(){
    console.log("generating ID")
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 8; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

exports.register = function(req, res){
    console.log('registering')
    if (!req.form.isValid) {
      res.send({'status': 'error', 'msg': 'invalid form'});
      return;
    }
    var user = req.form;
    console.log(user)
    user.permissions = {'hostedUpload': true, 'hotlinkUpload': true };
    user.salt = generateId();
    user.password = hash.sha256(user.password, user.salt);
    Users.insert(user, {safe: true}, function(err, doc){
        doc = doc[0];
        doc._id = doc._id.toString();
        req.session.user = doc;
        res.redirect('/');
    });
}

exports.validateLogin = form(
  field('email').required('Email', 'Please enter an email').toLower().trim().isEmail('Email address is not valid'), 
  field('password').required('Password', 'Please enter a password')
);

exports.validateRegistration = form(
    field('email').required('Email', 'Please enter an email').toLower().trim().isEmail('Email address is not valid'), 
    field('password').required('Password', 'Please enter a password').minLength(6, 'Passwords must be 6 characters long'),
    field('name').trim()
)

exports.login = function(req, res){
    console.log('logging in')
    if (!req.form.isValid) {
      res.send({'status': 'error', 'msg': 'fill out the forms completely'});
      return;
    }
    Users.findOne({email: req.form.email}, function(err, doc){
        if(!doc || hash.sha256(req.form.password, doc.salt) !== doc.password) {
            res.send({'status': 'error', 'msg': 'invalid username/password combo'});
        } 
        else{
            doc._id = doc._id.toString();
            req.session.user = doc;
            res.redirect('/');
        }
    });
};

exports.checkPermission = function(permission){
    var userLoggedIn = function(req, res, next){
        if ( ! req.session.user){
            res.redirect('/login')
        }
        else if (req.session.user && (! req.session.user.permissions[permission])){
            res.send(403);
        }
        else if (req.session.user && req.session.user.permissions[permission]){
            next();
        }
        
    }
    return userLoggedIn;
};

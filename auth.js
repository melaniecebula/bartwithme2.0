var form = require('express-form'),
    field = form.field;
var mongo = require('mongoskin');
var ObjectID = require('mongoskin').ObjectID;
var db = mongo.db('localhost:27017/dataHub?auto_reconnect', {safe: true});
var Users = db.collection('Users');
var hash = require('node_hash');
var bart = require("./bart.js");

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

exports.bartTrip = function(req, res) {
    console.log('BARTing')
    if (!req.form.isValid) {
      res.send({'status': 'error', 'msg': 'fill out origin, destination, and time'});
      return;
    }
    console.log('form is valid');
    console.log(req.form.origin, req.form.destination, req.form.time);
    //console.log(bart.getTimes(req.form.origin, req.form.destination, req.form.time));
    var done = function(result) {
        //TODO:  make more train results.  right now only doing result[0], which are the earliest trips (too early!)
        //perhaps a more programmatic way to generate information
        // perhaps a for loop through result (type: list)?
        console.log("0", result[0])
        console.log("1", result[1])
        console.log("2", result[2])
        var origin = result[0]['$']['origin'];
        var destination = result[0]['$']['destination'];
        var fare = result[0]['$']['fare'];
        var origTimeDate = result[0]['$']['origTimeDate'];
        var origTimeMin = result[0]['$']['origTimeMin'];
        var destTimeMin = result[0]['$']['destTimeMin'];
        var destTimeDate = result[0]['$']['destTimeDate'];
        if (result[0]['leg'] != undefined) {
            var transfer1 = result[0]['leg'][0]['$']
            //TODO:  sometimse there isn't another part to the leg :U; its like not a transfer, its another train??
            var transfer2 = result[0]['leg'][1]['$']
            var transfer1Code = transfer1['transfercode']
            var transfer2Code = transfer2['transfercode']
            var transferOrigin = transfer1['origin']
            var transferPoint = transfer2['origin']
            var transferDestination = transfer2['destination']
            var transfer1origTimeMin = transfer1['origTimeMin']
            var transfer1destTimeMin = transfer1['destTimeMin']
            var transfer2origTimeMin = transfer2['origTimeMin']
            var transfer2destTimeMin = transfer2['destTimeMin']
            var transfer1Line = transfer1['line']
            var transfer2Line = transfer2['line']
            var trainHeadStation1 = transfer1['trainHeadStation']
            var trainHeadStation2 = transfer2['trainHeadStation']
            res.render('trains', {transferO: transferOrigin, transferP: transferPoint, transferD: transferDestination, transferStart: transfer1origTimeMin, transferMid: transfer2origTimeMin, transferEnd: transfer2destTimeMin, origin: origin, dest: destination, fare: fare, origTime: origTimeMin, origDate: origTimeDate, destTime: destTimeMin, destDate: destTimeDate})
            }   else {
                    res.render('trains', {origin: origin, dest: destination, fare: fare, origTime: origTimeMin, origDate: origTimeDate, destTime: destTimeMin, destDate: destTimeDate})
        }
                
    }
    bart.getTimes(req.form.origin, req.form.destination, req.form.time, done);
}

exports.validateBart = form(
    field('origin').required('Origin', 'Please enter your current station').toUpper().trim(),
    field('destination').required('Destination', 'Please enter a destination').toUpper().trim(),
    field('time').required('Time', 'Please enter a valid #:##am/pm time').trim()
);

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

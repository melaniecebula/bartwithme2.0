//xml2js in the require path)

var sys = require('util'),
    rest = require('restler'),
    xml2js = require('xml2js');

var parser = new xml2js.Parser();

exports.getTimes = function(origin, destination, time, done) {
    var query = {}
    query.cmd = "depart"
    query.orig = origin
    query.dest = destination
    query.time = time
    query.date = "today"
    query.key = "MW9S-E7SL-26DU-VV8V"
    var options = {}
    options.query = query
    options.parser = rest.parsers.xml
    rest.get('http://api.bart.gov/api/sched.aspx?', options).on('complete', function(result) {
      if (result instanceof Error) {
        sys.puts('Error: ' + result.message);
        this.retry(5000); // try again after 5 sec
      } else {
        //console.log(result)
        console.log('train results are in')
        done(result.root.schedule[0].request[0].trip)
        //console.log(result.root.schedule[0].request[0].trip)
        }   
   });
}


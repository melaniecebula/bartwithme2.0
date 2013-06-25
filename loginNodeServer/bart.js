//xml2js in the require path)

var sys = require('util'),
    rest = require('restler'),
    xml2js = require('xml2js');

//callback for getTime

var parser = new xml2js.Parser();

function getTimes (origin, destination, time) {
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
        //return result
        console.log(result.root.schedule[0].request[0].trip)
        }   
   });
}
//example call with callback passed in
getTimes("ASHB", "CIVC", "10:00pm");


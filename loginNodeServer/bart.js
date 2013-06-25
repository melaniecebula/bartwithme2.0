//xml2js in the require path)

var sys = require('util'),
    rest = require('restler'),
    xml2js = require('xml2js');

//callback for getTime

var parser = new xml2js.Parser();

function getTime (location, destination, done) {
    rest.get('http://www.bart.gov/dev/eta/bart_eta.xml').on('complete', function(result) {
      if (result instanceof Error) {
        sys.puts('Error: ' + result.message);
        this.retry(5000); // try again after 5 sec
      } else {
        //console.log(result)
        //return result
        parser.parseString(result, function(err, data) {
            //console.log("ALL STATIONS", data.root.station)
            //console.log(station)
            var stations = data.root.station
            for (var i=0; i<stations.length; i++) {
                if (stations[i]["name"] == location) {
                    //console.log("you're at " + station +", and can leave for:")
                    //console.log(data.root.station[i]["eta"])
                    var destinations = stations[i]["eta"];
                    console.log(destinations)
                    for (var j=0; j<destinations.length; j++) {
                        if (destinations[j]["destination"][0] == destination) {
                            console.log(destinations[j]["estimate"]);
                        };
                    };
                    console.log("finished")
                    //console.log(destinations[0]["destination"][0] == destination);
                    //done(destinations)
                }
            }
        })}
    });
}
//example call with callback passed in
getTime("Downtown Berkeley", "Fremont", function(result) {
    console.log(result)
});


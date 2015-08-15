
var Spooky = require('spooky');
var logger = require('../utils/logger');
var _ = require('lodash');
var Q = require('q');

var setLookbackAction = require('../controller/actions/setLookbackAction');
var setGoingAction = require('../controller/actions/setGoingAction');
var setDistanceAction = require('../controller/actions/setDistanceAction');

exports.scrapeURLs = function(races) {
    // logger.info(races);
    var deferred = Q.defer();

    var results = [];

    var options = {
        child: { transport: 'http', 'cookies-file': 'cookies.txt' },
        casper: { logLevel: 'error', verbose: true }
    };

	var spooky = new Spooky(options, function (err) {
        if (err) {
            e = new Error('[ScraperService] Failed to initialize SpookyJS');
            e.details = err;
            throw e;
        }

        spooky.start();

        logger.info('starting SppokyJS (scraperService)');

        races.forEach(function(race) {

            spooky.thenOpen(race.url);

            spooky.waitForSelector('#filters > table > tbody > tr:nth-child(4) > td:nth-child(6) > select', function() {

                this.capture('images/initial.png')
            });

            //here we pass an eval to spooky, so let's replace the values beforehand
            var lookback = setLookbackAction();
            var going = String(setGoingAction).replace('VALUE', race.going.value);
            var distance = String(setDistanceAction).replace('VALUE', race.distance.value);

            spooky.thenEvaluate(lookback);
            spooky.thenEvaluate(going);
            spooky.thenEvaluate(distance);

            spooky.then([{url:race.url}, function() {
                var winners = this.evaluate(function (){
                    
                    srtOrder('hp');

                    var table = document.main.querySelectorAll('table')[1];
                    var rows = table.querySelectorAll('tr');
                    
                    // __utils__.echo((rows.length-1) + ' horses');

                    var runners = rows.length-1;
                    var first = '';
                    var second = '';

                    for (var index=0; index<runners; index++)
                    {
                        var name = document.getElementById('h' + index).innerHTML;
                        var ranTo = document.getElementById('hp' + index).innerHTML;

                        var isSelection = (ranTo && ranTo.length > 0);

                        if (isSelection)
                        {
                            if (first.length === 0)
                            {
                                first = name.split(') ')[1].split('[')[0];
                            }
                            else
                            {
                                second = name.split(') ')[1].split('[')[0];
                            }
                        }

                        if (first.length > 0 && second.length > 0)
                        {
                            break;
                        }
                    }

                    var picks = {
                        'first': first, 
                        'second': second,
                    };                    

                    return picks;
                });

                if (url && winners)
                {
                    winners.url = url;    
                }

                this.emit('selected', winners);
            }]);

            //take snapshot image after rules are applied
            spooky.wait(500, function() {
                this.capture('images/final.png');   
                // this.echo('final screenshot captured'); 
            });              
            
            

        })

        spooky.run();
    });

    spooky.on('selected', function(winners) {
        logger.debug(JSON.stringify(winners));
        results.push(winners);

        if (results.length === races.length) {
            this.emit('done', results);
        }
    });

    spooky.on('done', function(results) {
        deferred.resolve(results);
    })

	spooky.on('console', function (line) {
        if (!line.match('Unsafe JavaScript attempt')) {
            logger.info(line);    
        }
    });

    spooky.on('fail', function() {
        deferred.reject();
    });

    return deferred.promise;
};
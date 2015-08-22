
var Spooky = require('spooky');
var logger = require('../utils/logger');
var _ = require('lodash');
var Q = require('q');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var setLookbackAction = require('../controller/actions/setLookbackAction');
var setGoingAction = require('../controller/actions/setGoingAction');
var setDistanceAction = require('../controller/actions/setDistanceAction');

var ranToStrategy = require('../controller/strategies/ranToStrategy');
var dobStrategy = require('../controller/strategies/dobbingStrategy');

var ScraperService = function() {
    EventEmitter.call(this);
} 

util.inherits(ScraperService, EventEmitter);

ScraperService.prototype.scrapeURLs = function scrapeURLs(races, strategyName) {
    // logger.info(races);

    var strategy = strategyName == "ranTo" ? ranToStrategy : dobStrategy;

    logger.info(strategyName);

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

            //here we pass an eval to spooky, so let's replace the values beforehand
            var lookback = setLookbackAction();
            var going = String(setGoingAction).replace('VALUE', race.going.value);
            var distance = String(setDistanceAction).replace('VALUE', race.distance.value);

            spooky.thenOpen(race.url);
            spooky.thenEvaluate(lookback);
            spooky.thenEvaluate(going);
            spooky.thenEvaluate(distance);
            spooky.then([{url:race.url}, strategy]);
        })

        spooky.run();
    });

    spooky.on('selected', onSelected.bind(this));

    var counter = 0;

    function onSelected(winners) {
        counter++; 

        this.emit('result', winners);

        if (counter === races.length) {
            this.emit('done');
        }
    }

    spooky.on('console', function (line) {
        if (!line.match('Unsafe JavaScript attempt')) {
            logger.info(line);    
        }
    });

    spooky.on('fail', function() {
        this.emit('error');
    });
};

module.exports = ScraperService;
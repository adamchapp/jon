var Spooky = require('spooky');
var Q = require('q');
var logger = require('../utils/logger');

function crawl(url) {

	var deferred = Q.defer();
	
	//number of locations there are for a given day
	var maxLocations = 0;
	//counter to keep track of how many locations we have looked through
	var counter = 0;
	//the race urls
	var urls = [];

	var spooky = new Spooky({
		child: { 'transport': "http" },
		casper: {
		    logLevel: "debug",  // can also be set to "info", "warning" or "error"
		    verbose: false,
		    pageSettings: {
		    	userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.137 Safari/537.36'
		    }
		}
	}, function(err) {

		if (err) {
			logger.warn('there was an error ' + url);
		} else {
			logger.info('loading ' + url);
		}

		spooky.start(url);

		spooky.then(function() {
			
			var urls = [];

			var raceLocations = this.evaluate(function() { 
				var links = document.querySelectorAll('a');  
				var urls = [];
				
				for (var count=0; count<links.length; count++)
				{
					urls.push(links[count].href);
				}	

				return urls;
			});

			this.emit('locations', raceLocations);

			for (var count=0; count<raceLocations.length; count++)
			{
				var raceUrl = raceLocations[count];
				
				console.log('opening url: ' + raceUrl);
				this.thenOpen(raceUrl, function() {
					var races = this.evaluate(function() {
						var links = document.querySelectorAll('a');  
						var urls = [];
						
						for (var count=0; count<links.length; count++)
						{
							urls.push({url: links[count].href, title: links[count].innerHTML.trim()});
						}	
						return urls;
					});

					this.emit('times', races);	
				});
			}
		});

		spooky.run();
	});

	spooky.on('locations', function(locations) {
		maxLocations = locations.length;
		logger.info('found ' + locationCount + ' locations');
	});

	spooky.on('times', function(times) {
		counter++;
		urls = urls.concat(times);
		logger.debug('looked through ' + counter + ' of ' + maxLocations + ' locations, so far we have ' + urls.length + ' urls');

		if (counter === maxLocations)
		{
			this.emit('done', urls);
		}
	});

	spooky.on('console', function (line) {
        if (!line.match('Unsafe JavaScript attempt')) {
            logger.debug(line);    
        }
	});

	spooky.on('done', function(urls) {
		logger.info('extracted ' + urls.length + ' urls');
		deferred.resolve(urls);
	});

	return deferred.promise;
}

exports.crawl = crawl;
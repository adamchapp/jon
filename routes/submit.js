var express = require('express');
var router = express.Router();
var csv = require('fast-csv');
var _ = require('lodash');

var cookiesService = require('../scraper/services/cookieService');
var ScraperService = require('../scraper/services/scraperService');
var crawlerService = require('../scraper/services/crawlerService');

var goingFunction = require('../scraper/model/domain/race/addGoing');
var distanceFunction = require('../scraper/model/domain/race/addDistance');

var logger = require('../scraper/utils/logger');

var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

router.post('/', function(req, res, next) {
	var url = createURL(req.body);
	var username = req.body.username;
	var password = req.body.password;
	var going = req.body.going;
	var distance = req.body.distance;
	var strategy = req.body.strategy;
	var scraperService = new ScraperService();

	crawlerService.crawl(url).then(function(urls) {

		var filename = strategy + '-' + new Date().toString() + '.csv';
		res.setHeader('Content-disposition', 'attachment; filename=' + filename);
		res.setHeader('content-type', 'text/csv');
		 
		var csvStream = csv.createWriteStream({
		    headers: true,
		    objectMode: true
		});

		scraperService.on('result', function(winners) { 
			csvStream.write(winners);
		});

		scraperService.on('done', function() {
			csvStream.end();
		});

		var addGoing = _.partial(goingFunction, going);
		var addDistance = _.partial(distanceFunction, distance);

		var races = urls.map(addGoing)
						.map(addDistance);
		  
		// pipe the csvStream directly to the client
		csvStream.pipe(res);

		scraperService.scrapeURLs(races, strategy);
	})
});

function createURL(inputs) {
	logger.info('card type is ' + inputs.type);
	var prefix = (inputs.type == 'pttn') ? 'y' : 'xy';
	
	var dateInputs = inputs.date.split('/');
	var monthAsArrayIndex = dateInputs[1] - 1;
	
	var day = dateInputs[0];
	var month = months[monthAsArrayIndex];
	var year4digits = dateInputs[2];
	var year2digits = dateInputs[2].substring(2, 4);;

	return 'http://www.patternform.co.uk/cards/' + year4digits + '/' + month + '/' + prefix + day + month + year2digits + '.htm';
}

module.exports = router;

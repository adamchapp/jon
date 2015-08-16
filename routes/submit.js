var express = require('express');
var router = express.Router();
var csv = require('fast-csv');
var _ = require('lodash');

var cookiesService = require('../scraper/services/cookieService');
var ScraperService = require('../scraper/services/scraperService');
var crawlerService = require('../scraper/services/crawlerService');

var goingFunction = require('../scraper/controller/actions/header/extractGoing');
var distanceFunction = require('../scraper/controller/actions/header/extractDistance');

var logger = require('../scraper/utils/logger');

// var username = 'sparrowman';
// var password = 'hFagegB3V8';

var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

router.post('/', function(req, res, next) {
	var url = createURL(req.body);
	var username = req.body.username;
	var password = req.body.password;
	var going = req.body.going;
	var distance = req.body.distance;
	var scraperService = new ScraperService();

	// cookiesService.setCookies(username, password)
 //    .then(function () {
 //    	return 
	// })	
	crawlerService.crawl(url).then(function(urls) {
		var filename = 'results.csv';
		res.setHeader('Content-disposition', 'attachment; filename=' + filename);
		res.setHeader('content-type', 'text/csv');
		 
		var csvStream = csv.createWriteStream({
		    headers: true,
		    objectMode: true
		});

		var extractGoing = _.partial(goingFunction, going);
		var extractDistance = _.partial(distanceFunction, distance);
		
		var races = urls.map(extractGoing)
						.map(extractDistance);

		var stream = {}; //process.stdout works however
		stream.writable = true;

		logger.info('created stream for result');

		scraperService.on('result', function(winners) { 
			csvStream.write(winners);
		});

		scraperService.on('done', function() {
			csvStream.end();
		});
		  
		// pipe the csvStream directly to the client
		csvStream.pipe(res);

		scraperService.scrapeURLs(urls);
	})
});

function createURL(inputs) {
	var prefix = (inputs.type = 'pttn') ? 'y' : 'xy';
	
	var dateInputs = inputs.date.split('/');
	var monthAsArrayIndex = dateInputs[1] - 1;
	
	var day = dateInputs[0];
	var month = months[monthAsArrayIndex];
	var year4digits = dateInputs[2];
	var year2digits = dateInputs[2].substring(2, 4);;

	return 'http://www.patternform.co.uk/cards/' + year4digits + '/' + month + '/' + prefix + day + month + year2digits + '.htm';
}

module.exports = router;

var express = require('express');
var router = express.Router();
var csv = require('express-csv');
var _ = require('lodash');

var cookiesService = require('../scraper/services/cookieService');
var scraperService = require('../scraper/services/scraperService');
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

	res.write('something responded');

	res.render('result');

	// cookiesService.setCookies(username, password)
 //    .then(function () {
 //    	return 
	// })	
	crawlerService.crawl(url).then(function(urls) {
		var extractGoing = _.partial(goingFunction, going);
		var extractDistance = _.partial(distanceFunction, distance);
		
		var races = urls.map(extractGoing)
						.map(extractDistance);

		var stream = {}; //process.stdout works however
		stream.writable = true;

		scraperService.on('result', function(winners) { 
			console.log('we have a result ' + JSON.stringify(winners));
			stream.write(winners);
			res.pipe(stream);
		});

		scraperService.on('done', function() {
			res.end();
		});

		// scraperService.scrapeURLs(urls);
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

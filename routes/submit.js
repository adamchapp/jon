var express = require('express');
var router = express.Router();
var cookiesService = require('../scraper/services/cookieService');
var scraperService = require('../scraper/services/scraperService');
var crawlerService = require('../scraper/services/crawlerService');
var extractGoing = require('../scraper/controller/actions/header/extractGoing');
var extractDistance = require('../scraper/controller/actions/header/extractDistance');

var logger = require('../scraper/utils/logger');

// var username = 'sparrowman';
// var password = 'hFagegB3V8';

var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/* GET users listing. */
router.post('/', function(req, res, next) {

	logger.info(req.body);

	logger.info(createURL(req.body));

	var url = createURL(req.body);
	var username = req.body.username;
	var password = req.body.password;

	cookiesService.setCookies(username, password)
    .then(function () {
    	return crawlerService.crawl(url)
	})	
	.then(function(urls) {
		//extract information from the header
		//and create race objects
		var races = urls.map(extractGoing)
						.map(extractDistance);

		return scraperService.scrapeURLs(urls);
	})
	.then(function(results) {
		logger.info('we have ' + results.length + ' results');
	})
});

function createURL(inputs) {
	var prefix = (inputs.optradio = 'pttn') ? 'y' : 'xy';
	
	var dateInputs = inputs.date.split('-');
	var monthAsArrayIndex = dateInputs[1] - 1;
	
	var day = dateInputs[2];
	var month = months[monthAsArrayIndex];
	var year = dateInputs[0].substring(2, 4);;

	return 'http://www.patternform.co.uk/' + prefix + day + month + year + '.htm';
}

module.exports = router;

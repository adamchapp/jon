var express = require('express');
var router = express.Router();
var cookiesService = require('../scraper/services/cookieService');
var scraperService = require('../scraper/services/scraperService');
var crawlerService = require('../scraper/services/crawlerService');
var extractGoing = require('../scraper/controller/actions/header/extractGoing');
var extractDistance = require('../scraper/controller/actions/header/extractDistance');

var logger = require('../scraper/utils/logger');

var username = 'sparrowman';
var password = 'hFagegB3V8';

/* GET users listing. */
router.post('/', function(req, res, next) {
	cookiesService.setCookies(username, password)
    .then(function () {
    	return crawlerService.crawl('http://www.patternform.co.uk/y18jul15.htm')
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

module.exports = router;

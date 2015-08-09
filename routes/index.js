var express = require('express');
var router = express.Router();
var goings = require('../scraper/model/domain/goings.js');
var distances = require('../scraper/model/domain/distances.js');

/* GET home page. */
router.get('/', function(req, res, next) {

  addBlankPrefix(goings);
  addBlankPrefix(distances);
 
  res.render('index', { title: 'Patternform', 
  						goings: goings, 
  						distances: distances });
});

function addBlankPrefix(array) {
	if (array[0].label === '') {
		array.unshift({
			label: '', value: -1
		})
	}
}

module.exports = router;

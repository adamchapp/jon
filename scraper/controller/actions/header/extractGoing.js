'use strict';

var _ = require('lodash');
var logger = require('../../../utils/logger');
var goings = require('../../../model/domain/goings');

/**
 * MapReduce using the goings dataprovider. 
 *
 * 1) Matches the title, assigning a matchlevel (longer phrases = higher match level)
 * 2) Reduces the array to a single element containing the highest match level
 *     
 * @param  {Object} elem  An object containing label and url propertoes         
 * @return {Object}       The same object but enriched with a going property
 */
module.exports = function extractGoing(elem) {
    var going = goings.map(function(going) {
    	var matches = elem.title.match(new RegExp('\\b' + going.label + '\\b'));
		going.matchLevel = (matches !== null) ? matches[0].length : 0;    	
    	return going;
    }).reduce(function(previous, current) {
    	return previous.matchLevel > current.matchLevel ? previous : current;
    });

    elem.going = going;
        
    return elem;
}


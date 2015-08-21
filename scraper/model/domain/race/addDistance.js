'use strict';

var distances = require('../../../model/domain/distances');
var logger = require('../../../utils/logger');

/**
 * Either uses specified value or filters the distance dataprovider to get a distance value
 * @param  {Object} elem An object containing url, label and going properties
 * @return {Object}      An enriched object with distance property
 */
module.exports = function addDistance(value, elem) {

    if (value != -1 && value !== undefined) {        
        elem.distance = value; 
    } else {
        //split the string in half, using the separator label from the going
        var distanceString = elem.title.split(elem.distanceSeparatorLabel)[1];

        // //create an array containing miles, furlongs and yards
        var miles = format(distanceString.match(/[0-9]m/g), 'm'); 
        var furlongs = format(distanceString.match(/\d{1,3}f/g), 'f');
        var yards = format(distanceString.match(/\d{1,3}y/g), 'y');

        var totalInFurlongs = calculateDistanceInFurlongs(miles, furlongs, yards);

        var result = distances.filter(function(distance) {
            return Number(distance.furlongs) === Number(totalInFurlongs);
        });

        logger.info(elem.title +  ' ::: ' + totalInFurlongs + ' ::: ' + result[0].label + ',' + result.length + ' result(s)');
        elem.distance = result[0];
    }

    logger.debug('extracting distance: ' + distanceString + ':: ' + miles + 'm' + furlongs +'f' + yards + 'y', 'value in furlongs is ' + totalInFurlongs);
    
    return elem;
};

/**
 * Takes a regular expression and splits it by delimeter. If the regex is null it returns 0
 * @param  {[type]} inputString An array of results from String.match(regex);
 * @param  {[type]} delimiter   A string delimiter representing a unit of travel
 * @return {[type]} A formatted distance in numbers
 */
function format(inputString, delimiter)
{
    if (inputString !== undefined && inputString !== null)
    {
        return Number(inputString[0].split(delimiter)[0]);    
    }
    return 0;
}

/**
 * Returns the total distance calculated in furlongs, rounded up to the nearest furlong
 * @param  {Number} miles    Distance in miles
 * @param  {Number} furlongs Distance in furlongs
 * @param  {Number} yards    Distance in yards
 * @return {Number}          Total distance represented in furlongs
 */
function calculateDistanceInFurlongs(miles, furlongs, yards)
{
    var total = furlongs;

    //round yards up to the nearest furlong
    if (yards > 111)
    {
        total++;
    }

    //add an extra 8 furlongs for every mile
    total += (miles * 8)

    return total;
}
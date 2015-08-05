'use strict';

/**
 * The below function is run through eval(). 
 * @return null
 */
module.exports = function setLookbackAction() {
	return function() {
		document.main.weeks.options[document.main.weeks.selectedIndex].value = 32000;
		document.main.b1.click();	
	}
};
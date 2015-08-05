'use strict';

//oh boy. Spooky does an eval() on these statements as a string
//The VALUE element is replaced prior to eval()
module.exports = function setGoingAction() {	
	var goings = document.main.going.options;
	var selectedIndex;

	for (var i=0; i<goings.length; i++)
	{
		if (goings[i].value == VALUE)
		{
			selectedIndex = i;
		}
	}

	document.main.going.options.selectedIndex = selectedIndex;
    document.main.b1.click();
};
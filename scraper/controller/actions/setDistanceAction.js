/**
 * The entire exported statement is run through eval() so the VALUE placeholder is replaced beforehand
 * @return {[type]} [description]
 */
module.exports = function setDistanceAction() {
	var distances = document.main.racdist.options;
	var selectedIndex;

	for (var i=0; i<distances.length; i++)
	{
		if (distances[i].value == VALUE)
		{
			selectedIndex = i;
		}
	}

	document.main.racdist.options.selectedIndex = selectedIndex;
    document.main.b1.click();
};
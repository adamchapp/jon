module.exports = function dobbingStrategy() {
    var winners = this.evaluate(function (){

        srtOrder('wp');

        var table = document.main.querySelectorAll('table')[1];
        var elems = table.querySelectorAll('tr');

        var runners = elems.length-1;
        var picks = [];

        for (var index=0; index<runners; index++)
        {
            var name = document.getElementById('h' + index).innerHTML;
            var dob = document.getElementById('wp' + index).innerHTML;
            var dobSymbols = document.getElementById('f' + index).innerText;
            var prettyName = name.split(') ')[1].split('[')[0];
            var dobValue = Number(dob.split(' %')[0]);
            if (dobValue == 80) {
                picks.push(prettyName + '(' + dobValue + ')');    
            } else if (dobValue == 100) {
                var asterisksAndDigitMatches = dobSymbols.match(/[0-9*]/g);
                var count = asterisksAndDigitMatches ? asterisksAndDigitMatches.length : 0;
                
                if (count >= 2)
                {
                    picks.push(prettyName);    
                }
            }
        }
        return picks;
    });

    if (!winners || winners === undefined) 
    {
        winners = [];
    }

    if (url && winners)
    {
        winners.unshift(url);    
    }

    this.emit('selected', winners);
}
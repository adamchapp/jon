module.exports = function ranToStrategy() {
    var winners = this.evaluate(function (){
        
        srtOrder('hp');

        var table = document.main.querySelectorAll('table')[1];
        var rows = table.querySelectorAll('tr');
        
        // __utils__.echo((rows.length-1) + ' horses');

        var runners = rows.length-1;
        var first = '';
        var second = '';

        for (var index=0; index<runners; index++)
        {
            var name = document.getElementById('h' + index).innerHTML;
            var ranTo = document.getElementById('hp' + index).innerHTML;

            var isSelection = (ranTo && ranTo.length > 0);

            if (isSelection)
            {
                if (first.length === 0)
                {
                    first = name.split(') ')[1].split('[')[0];
                }
                else
                {
                    second = name.split(') ')[1].split('[')[0];
                }
            }

            if (first.length > 0 && second.length > 0)
            {
                break;
            }
        }

        var picks = {
            'first': first, 
            'second': second,
        };                    

        return picks;
    });

    if (url && winners)
    {
        winners.url = url;    
    }

    this.emit('selected', winners);
}
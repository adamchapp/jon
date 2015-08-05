var Spooky = require('spooky');
var Q = require('q');
var logger = require('../utils/logger');

var url = 'http://www.patternform.co.uk/forumpatt/ucp.php?mode=login';
var username = 'sparrowman';
var password = 'hFagegB3V8';

exports.setCookies = function setCookie() {

	var deferred = Q.defer();

	var spooky = new Spooky({
        child: { transport: 'http', 'cookies-file': 'cookies.txt' },
        casper: {
            logLevel: 'error',
            verbose: false,
            options: {
                clientScripts: ['node_modules/jquery/dist/jquery.min.js']
            }
        }
    }, function (err) {
        if (err) {
            logger.error(err);
        }

        logger.info('Starting SpookyJS (cookieServce)');    
        
        spooky.start(url);

        spooky.then( 
        function () {
            this.capture('images/login/login-start.png'); 
            this.echo('capturing inital login screenshot');  
        });

        //this does the actual login if we are not using cookies. PhantomJS seems to cache them within an open
        //terminal session
        spooky.thenEvaluate(function(username, password) {
            $("input[id=username]").val(username);
            $("input[id=password]").val(password);        
            $("#login > div:nth-child(1) > div > div > fieldset > dl:nth-child(5) > dd > input.button1").click();
        }, {username:username, password:password});

        spooky.then(function () {
            this.capture('images/login/login-complete.png'); 
            this.echo('capturing login complete screenshot');  
            this.emit('complete', phantom.cookies);
        });

        spooky.run();
    });

	spooky.on('console', function (line) {
        if (!line.match('Unsafe JavaScript attempt')) {
            logger.debug(line);    
        }
	});

    spooky.on('complete', function(value) {
        logger.info('Retrieved cookies');
        deferred.resolve(value);
    })

    spooky.on('fail', function() {
        deferred.reject();
    })

    return deferred.promise;
};
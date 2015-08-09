$(document).ready(function(){

    $('#inputDate').datepicker({
        format: 'dd/mm/yyyy',
    });

    $('.form-submit').validator().on('submit', function (e) {
        if (e.isDefaultPrevented()) {
            console.log('not submitting the form');
        } else {
            console.log('submitting the form');
            var $container = $(this).closest('.container');
            $container.html('<h3>Please wait<h3><small>Your file will be ready shortly</small>')
        }
    })

});
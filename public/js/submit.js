$(document).ready(function(){
    $('.form-submit').validator().on('submit', function (e) {
        if (e.isDefaultPrevented()) {
            console.log('not submitting the form');
        } else {
            console.log('submitting the form');
            e.preventDefault();
            
            var action = $(this).attr('action');
            var $container = $(this).closest('.container');
            $.ajax({
                url: action,
                type: 'POST',
                data: $(this).serialize(),
                success: function(data){
                    if(data.success){
                        $container.html('<h2>Thank you!</h2>');
                    } else {
                        $container.html('There was a problem.');
                    }
                },
                error: function(){
                    $container.html('There was a problem.');
                }
            });
        }
    })

});
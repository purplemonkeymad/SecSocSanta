/* index specific js code */

// add actions to buttons.

$("#enter-gamecode").submit( function(event) {
    event.preventDefault();
    code = $('#gamecode')[0].value
    error_object = $('#gamecode-error')
    error_object.text("")
    if (code.length != 8) {
        error_object.text("Codes should be exactly 8 characters long.");
    } else {
        get_game(code,function(json_data){
            $('[id^=game-info]').each(function (i){
                $(this).css('display','none');
            });
            if (json_data.status == 'error'){
                error_object.text(json_data.statusdetail)
            } else if (json_data.status == 'ok'){
                // fill details into next card.
                if (json_data.state == 0){
                    card = $('#game-info-open');
                    card.find('h1').text(json_data.name);
                } else if (json_data.state == 1) {
                    card = $('#game-info-ran');
                    card.find('h1').text(json_data.name);
                } else if (json_data.state == 2) {
                    card = $('#game-info-closed');
                    card.find('h1').text(json_data.name);
                }
                card.css("display",'block');
            } else {
                error_object.text("Invalid reply from API.");
            }
        },error_object)
    }
});

$("#game-actions-ran").submit(function(event) {
    event.preventDefault();
    console.log("game-register");
});



/* index specific js code */

// add actions to buttons.

// lookup game
$("#enter-gamecode").submit( function(event) {
    event.preventDefault();
    code = $('#gamecode')[0].value;
    error_object = $('#gamecode-error');
    error_object.text("");
    if (code.length != 8) {
        error_object.text("Codes should be exactly 8 characters long.");
    } else {
        get_game(code,function(json_data){
            $('[id^=game-info-]').each(function (i){
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

// get your results
$("#game-actions-ran").submit(function(event) {
    event.preventDefault();
    code = $('#gamecode')[0].value;
    username = $("#results-username")[0].value;
    error_object = $('#gameran-error');
    error_object.text("");
    if (code.length != 8) {
        error_object.text("Codes should be exactly 8 characters long. Did you modify the input?");
    } else if (username.length == 0) {
        error_object.text("You must input a name.");
    } else {
        get_user(code,username,function(json_data){
            $('[id^=game-info-ran-]').each(function (i){
                $(this).css('display','none');
            });
            if (json_data.status == 'error'){
                error_object.text(json_data.statusdetail)
            } else if (json_data.status == 'ok'){
                card = $('#game-info-ran-results');
                card.find('#giftee-anounce').text(json_data.giftee);
                list = card.find('#game-results-list');
                list.empty();
                list.append(
                    json_data.ideas.map( i =>
                        $('<li>').addClass('mdl-list__item')
                            .append(
                                $('<span>').addClass('mdl-list__item-primary-content').text(i)
                            )
                    )
                )
                card.css('display','block');
            } else {
                error_object.text("Invalid reply from API.");
            }
        },error_object)
    }
});

// register for game
$("#button-game-register").off('click').on('click',function (event) {
    event.preventDefault();
    $('[id^=game-info-open-]').each(function (i){
        $(this).css('display','none');
    });
    $('#register-username').val('').parent().removeClass('is-focused');
    $('#game-info-open-register').css('display','block');
})

// do register
$('#enter-name-register').submit(function(event) {
    event.preventDefault();
    code = $('#gamecode')[0].value;
    username = $("#register-username")[0].value;
    error_object = $('#gameregister-error');
    error_object.text("");
    if (code.length != 8) {
        error_object.text("Codes should be exactly 8 characters long. Did you modify the input?");
    } else if (username.length == 0) {
        error_object.text("You must input a name.");
    } else {
        add_user(code,username,function(json_data){
            if (json_data.status == 'error'){
                error_object.addClass('error-text');
                error_object.text(json_data.statusdetail);
            } else if (json_data.status == 'ok'){
                error_object.removeClass('error-text');
                $('#register-username').val('').parent().removeClass('is-focused');
                error_object.text("Successful Registration.");
            }
        },error_object);
    }
});

$("#button-game-ideas").off('click').on('click',function (event) {
    event.preventDefault();
    $('[id^=game-info-open-]').each(function (i){
        $(this).css('display','none');
    });
    $('#register-idea').val('').parent().removeClass('is-focused');
    $('#game-info-open-idea').css('display','block');
});

$('#enter-idea').submit(function(event) {
    event.preventDefault();
    code = $('#gamecode')[0].value;
    idea = $("#register-idea")[0].value;
    error_object = $('#idearegister-error');
    error_object.text("");
    if (code.length != 8) {
        error_object.text("Codes should be exactly 8 characters long. Did you modify the input?");
    } else if (idea.length == 0) {
        error_object.text("You must input an idea.");
    } else if (idea.length > 260) {
        error_object.text("Ideas are limited to 260 Characters, be more succinct.")
    } else {
        add_idea(code,idea,function(json_data){
            if (json_data.status == 'error'){
                error_object.addClass('error-text');
                error_object.text(json_data.statusdetail);
            } else if (json_data.status == 'ok'){
                error_object.removeClass('error-text');
                $('#register-idea').val('').parent().removeClass('is-focused');
                error_object.text("Successful Submission.");
            }
        },error_object);
    }
});

// register email button
$('form#register-email').submit(function(event) {
    event.preventDefault();
    var register_email = $('input#register-email')[0].value;
    var register_name = $('input#register-name')[0].value;
    error_object = $('div#register-email-error');
    error_object.text("");
    if (!register_email.match('.+@.+')){
        error_object.text("Please Enter an email address.");
    } else if (register_name.length == 0) {
        error_object.text("Please Enter a Display Name for yourself.");
    } else {
        doRegister(register_email,register_name,function(json_data){
            if (json_data.status == 'error'){
                error_object.addClass('error-text');
                error_object.text(json_data.statusdetail);
            } else if (json_data.status == 'ok'){
                // save session id
                setSessionId(json_data.session);
                set_buttons_from_status();
                show_card_matching('verify');
            }
        },error_object);
    }
});

/****************** nav functions ************/

$('a.mdl-navigation__link').click(function(e) {
    var card_id = this.href.replace('#','').replace('?','');
    show_card_exact(card_id);
    return false;
})

// auto fill an submit a code if given as a uri hash (#ABCDEFGH)
$( window ).on( "load", function() {

    // hide buttons you can't use yet
    set_buttons_from_status();

    pot_code = $(location)[0].hash.replace('#','');
    if (pot_code.length == 8) {
        // good enough
        $('#gamecode').val(pot_code).parent().addClass('is-focused');
        $("#enter-gamecode").submit();
    }
});

/******************** index functions ********************/

function set_buttons_from_status(){
    var currentstatus = getStoredLoginStatus();
    if (currentstatus == "loggedIn") {
        $(".needs-login").css('display','block');
        $(".needs-logout").css('display','none');
        $(".needs-verify").css('display','none');

    } else if (currentstatus == "loggedOut") {
        $(".needs-login").css('display','none');
        $(".needs-logout").css('display','block');
        $(".needs-verify").css('display','none');

    } else if (currentstatus == "verifyNeeded") {
        $(".needs-login").css('display','none');
        $(".needs-logout").css('display','block');
        $(".needs-verify").css('display','block');
    }
}
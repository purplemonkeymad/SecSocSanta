/* manage specific js code */

// add actions to buttons.

// lookup game
$("#enter-gamecode").submit( function(event) {
    event.preventDefault();
    code = $('#gamecode')[0].value;
    admin = $('#admincode')[0].value;
    error_object = $('#gamecode-error');
    error_object.text("");
    if (code.length != 8) {
        error_object.text("Codes should be exactly 8 characters long.");
    } else if (admin.length != 64 ){
        error_object.text("Admin code should be exactly 64 characters long");
    } else {
        get_auth(code,admin,function(json_data){
            // hide all game-edit level panels
            $('[id^=game-edit-]').each(function (i){
                $(this).css('display','none');
            });
            if (json_data.status == 'error'){
                error_object.text(json_data.statusdetail);
            } else if (json_data.status == 'ok'){
                // fill details into next card.
                var card = $('#game-edit-existing');
                card.find('h1').text(json_data.name);
                card.find('#edit-members').text(json_data.santas);
                card.find('#edit-ideas').text(json_data.ideas);
                card.css('display','block');

                // set button states by group status
                var current_state = json_data.state;
                if (current_state == 0){
                    // is open for registration
                    $('#roll-game-button')[0].disabled=false;
                    $('#list-users')[0].disabled=false;
                    $('#list-ideas')[0].disabled=true;
                } else if (current_state == 1){
                    // is rolled
                    $('#roll-game-button')[0].disabled=true;
                    $('#list-users')[0].disabled=false;
                    $('#list-ideas')[0].disabled=false;
                } else {
                    // closed?
                    $('#roll-game-button')[0].disabled=true;
                    $('#list-users')[0].disabled=true;
                    $('#list-ideas')[0].disabled=true;
                }
            } else {
                error_object.text("Invalid reply from API.");
            }
        },error_object)
    }
});

// roll game
$("#roll-game-button").off('click').on('click',function (event) {
    event.preventDefault();
    /// hide child cards
    $('[id^=game-edit-existing-]').each(function (i){
        $(this).css('display','none');
    });
    code = $('#gamecode')[0].value;
    admin = $('#admincode')[0].value;
    error_object = $('#edit-game-error');
    error_object.addClass("error-text");
    error_object.text("");
    if (code.length != 8) {
        error_object.text("Codes should be exactly 8 characters long.");
    } else if (admin.length != 64 ){
        error_object.text("Admin code should be exactly 64 characters long");
    } else {
        roll_santas(code,admin,function(json_data){
            if (json_data.status == 'error'){
                error_object.text(json_data.statusdetail);
            } else if (json_data.status == 'ok'){
                error_object.removeClass('error-text');
                error_object.text("Success.");
            } else {
                error_object.text("Invalid reply from API.");
            }
        },error_object)
    }
})

// list users
$('#list-users').off('click').on('click',function (event) {
    event.preventDefault();
    /// hide child cards
    $('[id^=game-edit-existing-]').each(function (i){
        $(this).css('display','none');
    });
    code = $('#gamecode')[0].value;
    admin = $('#admincode')[0].value;
    error_object = $('#edit-game-error');
    error_object.addClass("error-text");
    error_object.text("");
    if (code.length != 8) {
        error_object.text("Codes should be exactly 8 characters long.");
    } else if (admin.length != 64 ){
        error_object.text("Admin code should be exactly 64 characters long");
    } else {
        list_users(code,admin,function(json_data){
            if (json_data.status == 'error'){
                error_object.text(json_data.statusdetail);
            } else if (json_data.status == 'ok'){
                error_object.removeClass('error-text');
                error_object.text("");

                var card = $('#game-edit-existing-listusers');

                // fill usernames
                list = card.find('#game-listuser-tbody');
                list.empty();
                list.append(
                    json_data.users.map( i =>
                        $('<li>').addClass('mdl-list__item')
                            .append(
                                $('<span>').addClass('mdl-list__item-primary-content').text(i)
                            )
                    )
                );

                // make card visible
                card.css('display','block')
            } else {
                error_object.text("Invalid reply from API.");
            }
        },error_object)
    }
})

// list ideas left over
$('#list-ideas').off('click').on('click',function (event) {
    event.preventDefault();
    /// hide child cards
    $('[id^=game-edit-existing-]').each(function (i){
        $(this).css('display','none');
    });
    code = $('#gamecode')[0].value;
    admin = $('#admincode')[0].value;
    error_object = $('#edit-game-error');
    error_object.addClass("error-text");
    error_object.text("");
    if (code.length != 8) {
        error_object.text("Codes should be exactly 8 characters long.");
    } else {
        list_leftover_ideas(code,function(json_data){
            if (json_data.status == 'error'){
                error_object.text(json_data.statusdetail);
            } else if (json_data.status == 'ok'){
                error_object.removeClass('error-text');
                error_object.text("");

                var card = $('#game-edit-existing-ideasleft');

                // fill usernames
                list = card.find('#game-listitem-list');
                list.empty();
                list.append(
                    json_data.ideas.map( i =>
                        $('<li>').addClass('mdl-list__item')
                            .append(
                                $('<span>').addClass('mdl-list__item-primary-content').text(i)
                            )
                    )
                );

                // make card visible
                card.css('display','block')
            } else {
                error_object.text("Invalid reply from API.");
            }
        },error_object)
    }
})

// new game
$("#button-game-new").off('click').on('click',function (event) {
    event.preventDefault();
    $('[id^=game-edit-]').each(function (i){
        $(this).css('display','none');
    });
    var card = $('#game-edit-new');
    card.css('display','block');
})

// register game
$("#enter-newgame").submit( function(event) {
    event.preventDefault();
    name = $('#newname')[0].value;
    error_object = $('#enter-newgame-error');
    error_object.addClass("error-text");
    error_object.text("");
    if (name.length == 0) {
        error_object.text("Enter a name.");
    } else {
        new_group(name,function(json_data){
            if (json_data.status == 'error'){
                error_object.text(json_data.statusdetail);
            } else if (json_data.status == 'ok'){
                // fill info into existing fields.
                $('#gamecode').val(json_data.pubkey).parent().addClass('is-focused');
                $('#admincode').val(json_data.privkey).parent().addClass('is-focused');
                success_text = "\
                Success. Share the Game code that has been placed below. Keep the Secret code to yourself, but keep it safe. It is needed to roll the Santas. \
                <a href=\"/#" + json_data.pubkey + "\">Don't forget to register yourself. </a>\
                "
                error_object.html(success_text);
                error_object.removeClass('error-text');
                $('#new-results-table-code').text(json_data.pubkey);
                $('#new-results-table-secret').text(json_data.privkey);
                $('#new-results-table').css('display','block')
            } else {
                error_object.text("Invalid reply from API.");
            }
        },error_object)
    }
});

// auto fill an submit a code if given as a uri hash (#ABCDEFGH), but we can't submit so just leave it in there.
$( window ).on( "load", function() {
    pot_code = $(location)[0].hash.replace('#','');
    if (pot_code.length == 8) {
        // good enough
        $('#gamecode').val(pot_code).parent().addClass('is-focused');
    }
});
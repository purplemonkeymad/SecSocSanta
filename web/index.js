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

// replacement join game function
$('form#join-group').submit(function(event){
    event.preventDefault();
    error_object = $('div#join-error');
    error_object.text("");
    var code = $('input#join-group-code')[0].value;
    var name = $('input#join-group-name')[0].value;
    joinGroup(code,name,function(json_data){
        if (json_data.status == 'error'){
            error_object.addClass('error-text');
            error_object.text(json_data.statusdetail);
        } else if (json_data.status == 'ok'){
            error_object.removeClass('error-text');
            if (json_data.join_status == 'Existing'){
                error_object.text('You already are joined to this group.');
            } else {
                error_object.text(('You Joined ' + json_data.gamename + ' as ' + json_data.name));
            }
        }
    },error_object);
});

// new group
$("#new-group").submit( function(event) {
    event.preventDefault();
    group_name = $('#new-group-name').val();
    error_object = $('#new-error');
    error_object.addClass("error-text");
    error_object.text("");
    if (group_name.length == 0) {
        error_object.text("Enter a name.");
    } else {
        new_group(group_name,function(json_data){
            if (json_data.status == 'error'){
                error_object.text(json_data.statusdetail);
            } else if (json_data.status == 'ok'){
                // fill info into existing fields.
                var result_element = getTemplate('#new-group-results-template');
                $(result_element).find('#new-group-name-result').text(json_data.name);
                $(result_element).find('#new-group-code-result').text(json_data.pubkey);
                var new_element = $('#new-group-results').append(result_element).children().last('.new-group-results-item');
                // set mdl events
                componentHandler.upgradeElements(new_element);

                clearMaterialInputBox('#new-group-name');
            } else {
                error_object.text("Invalid reply from API.");
            }
        },error_object)
    }
});

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

// login button
$('form#login-email').submit(function(event) {
    event.preventDefault();
    var login_email = $('input#login-email')[0].value;
    error_object = $('div#login-email-error');
    error_object.text("");
    if (!login_email.match('.+@.+')){
        error_object.text("Please Enter an email address.");
    } else {
        doLogin(login_email,function(json_data){
            if (json_data.status == 'error'){
                error_object.addClass('error-text');
                error_object.text(json_data.statusdetail);
            } else if (json_data.status == 'ok'){
                error_object.removeClass('error-text');
                // save session id
                setSessionId(json_data.session);
                set_buttons_from_status();
                show_card_matching('verify');
            }
        },error_object);
    }
});

// logout button
$('form#logout-session').submit(function(event) {
    event.preventDefault();
    var creds = getSessionCredentials();
    error_object = $('div#logout-error');
    error_object.text("");
    if (getStoredLoginStatus() != 'loggedIn') {
        error_object.text("Not logged in.");
    } else if (!creds.session){
        error_object.text("No logon session.");
    } else {
        doLogOut(creds.session,creds.secret,function(json_data){
            if (json_data.status == 'error'){
                error_object.addClass('error-text');
                error_object.text(json_data.statusdetail);
            } else if (json_data.status == 'ok'){
                error_object.removeClass('error-text');
                show_card_matching('home');
            }
            clearSession();
            set_buttons_from_status();
        },error_object);
    }
});


// verify button
$("form#verify-code").submit(function(event){
    event.preventDefault();
    var verify_code = $('input#verify-email')[0].value;
    var session = getSessionCredentials().session;
    error_object = $('div#verify-code-error');
    error_object.text("");
    if (verify_code.length == 0){
        error_object.text("Please Enter a code.");
    } else if (session.length == 0) {
        error_object.text("Session ID missing, try a new login instead.");
    } else {
        var localPass = generateId();
        doVerify(session,verify_code,localPass,function(json_data){
            if (json_data.status == 'error'){
                error_object.addClass('error-text');
                error_object.text(json_data.statusdetail);
            } else if (json_data.status == 'ok'){
                // save session id
                setSessionId(json_data.session);
                setSessionPw(localPass);
                set_buttons_from_status();
                show_card_matching('home');
            }
        },error_object);
    }
});

/****************** nav functions ************/

$('a.mdl-navigation__link').click(function(e) {
    e.preventDefault();
    var card_id = this.href.replace(/.*\#/,'').replace(/.*\?/,'');
    show_card_exact(card_id);
    // remove draw only if visible
    if ($( '.mdl-layout__drawer')[0].classList.contains('is-visible')){
        $('.mdl-layout')[0].MaterialLayout.toggleDrawer();
    }
})

// auto fill an submit a code if given as a uri hash (#ABCDEFGH)
$( window ).on( "load", function() {

    // hide buttons you can't use yet
    set_buttons_from_status();

    // check if verify is needed and go to that card
    if (getStoredLoginStatus() == 'verifyNeeded'){
        show_card_exact('verify');
    }

    uri_view = location.search.replace('?','');
    if (uri_view.length > 0){
        show_card_exact(uri_view);
    }
    // remove draw only if visible
    if ($( '.mdl-layout__drawer')[0].classList.contains('is-visible')){
        $('.mdl-layout')[0].MaterialLayout.toggleDrawer();
    }

});

/*******************  on nav to card functions ************/

function nav_event_game_list(){
    // remove existing items if any

    $('#game-owned-list li').remove();
    $('#game-joined-list li').remove();

    error_object = $('div#game-list-error');
    error_object.text("");
    getOwnedGroupList(function(json_data) {
        if (json_data.status == 'error'){
            error_object.addClass('error-text');
            error_object.text(json_data.statusdetail);
        } else if (json_data.status == 'ok'){
            var grouplist = json_data.grouplist;
            grouplist.forEach(g => {
                var row = getTemplate('#game-owned-item');
                row.querySelector('#li-item-name').innerText = g.name;
                row.querySelector('#li-item-code').innerText = g.code;
                row.querySelector('#li-item-status').innerText = ['Open','Rolled','Closed'][g.state];
                var rowInDocument = $('#game-owned-list').append(row).children().last('li.mdl-list__item');
                // set mdl events
                componentHandler.upgradeElements(rowInDocument);
                // set accordion properties
                $(rowInDocument).find('.mdl-accordion__content').each(function(){
                    var content = $(this);
                    content.css('margin-top', -content.height());
                });
                $(rowInDocument).find('.mdl-accordion__button').on('click', function(){
                    $(this).parent('.mdl-accordion').toggleClass('mdl-accordion--opened');
                    getOwnedGameOnExpand($(this).parent(),$('#game-list-error'));
                });
                // set button status.
                if (g.state != 0){
                    $(rowInDocument).find('#roll-button').attr('disabled','');
                }

            });
        }
    },error_object);
    getJoinedGroupList(function(json_data) {
        if (json_data.status == 'error'){
            error_object.addClass('error-text');
            error_object.text(json_data.statusdetail);
        } else if (json_data.status == 'ok'){
            var grouplist = json_data.grouplist;
            grouplist.forEach(g => {
                var row = getTemplate('#game-joined-item');
                row.querySelector('#li-item-name').innerText = g.name;
                row.querySelector('#li-item-code').innerText = g.code;
                row.querySelector('#li-item-status').innerText = ['Open','Rolled','Closed'][g.state];
                row.querySelector('#li-item-username').innerText = g.joinname;
                var rowInDocument = $('#game-joined-list').append(row).children().last('li.mdl-list__item');
                // set mdl events
                componentHandler.upgradeElements(rowInDocument);
                // set accordion properties
                $(rowInDocument).find('.mdl-accordion__content').each(function(){
                    var content = $(this);
                    content.css('margin-top', -content.height());
                });
                $(rowInDocument).find('.mdl-accordion__button').on('click', function(){
                    $(this).parent('.mdl-accordion').toggleClass('mdl-accordion--opened');
                    getJoinedGameOnExpand($(this).parent(),$('#game-list-error'));
                });
            });
        }
    },error_object);
    
}

function nav_event_join(){
    clearMaterialInputBox('#join-group-code')
    clearMaterialInputBox('#join-group-name')
}

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

function getOwnedGameOnExpand(element,error_object){
    var localRoot = $(element)
    if (localRoot.find('#group-sum-card').hasClass('is-filled')){
        // nothing to do
    } else {
        var code = $(element).find('#li-item-code').text()
        get_game_summary(code,function(json_data){
            if (json_data.status == 'error'){
                error_object.addClass('error-text');
                error_object.text(json_data.statusdetail);
            } else if (json_data.status == 'ok'){  
                localRoot.find('#group-sum-members').text(json_data.santas);
                localRoot.find('#group-sum-ideas').text(json_data.ideas);
                localRoot.find('#group-sum-card').addClass('is-filled')
            }
        },error_object);
    }
}

function getJoinedGameOnExpand(element,error_object){
    localRoot = $(element);
    var openStatus = localRoot.find('#li-item-status').text();
    if (openStatus == 'Open') {
        localRoot.find('#group-list-open').css('display','block');
        localRoot.find('#group-list-rolled').css('display','none');
        // register idea action
        if (localRoot.find('#group-list-open').hasClass('is-filled')){
            // nothing to do
        } else {
            localRoot.find('#game-list-new-idea').submit(function(event) {
                event.preventDefault();
                var code = localRoot.find('#li-item-code').text();
                var ideaBox = localRoot.find('#game-list-register-idea');
                var idea = ideaBox.val();
                error_object = localRoot.find('#game-list-idearegister-error');
                error_object.text("");
                if (idea.length == 0) {
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
                            clearMaterialInputBox(ideaBox);
                            error_object.text("Successful Submission.");
                        }
                    },error_object);
                }
            });
            localRoot.find('#group-list-open').addClass('is-filled');
        }
    } else if (openStatus == 'Rolled') {
        localRoot.find('#group-list-open').css('display','none');
        localRoot.find('#group-list-rolled').css('display','block');
        // get results
        if (localRoot.find('#group-list-rolled').hasClass('is-filled')){
            // nothing to do
        } else {
            var code = $(element).find('#li-item-code').text()
            error_object = localRoot.find('#game-list-results-error');
            error_object.text("");
            get_group_results(code,function(json_data){
                if (json_data.status == 'error'){
                    error_object.addClass('error-text');
                    error_object.text(json_data.statusdetail);
                } else if (json_data.status == 'ok'){
                    localRoot.find('#giftee-anounce').text(json_data.giftee);
                    var idea_list = json_data.ideas;
                    if (idea_list.length > 0){
                        idea_list.forEach(i => {
                            var row = getTemplate('#game-results-idea-listitem');
                            $(row).find('.idea-item').text(i);
                            var rowInDocument = localRoot.find('#game-results-list').append(row).children().last('li.mdl-list__item');
                            // set mdl events
                            componentHandler.upgradeElements(rowInDocument);
                        });
                    } else {
                        error_object.addClass('error-text');
                        error_object.text("No ideas given, please reload.");
                    }
                    localRoot.find('#group-list-rolled').addClass('is-filled');
                }
            },error_object);
        }
    }
}
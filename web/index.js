/* index specific js code */

// add actions to buttons.

// replacement join game function
$('form#join-group').submit(function(event){
    event.preventDefault();
    error_object = $('div#join-error');
    error_object.removeClass('error-text');
    error_object.text("");
    show_progress('#join-progress');
    var code = $('input#join-group-code')[0].value;
    var name = $('input#join-group-name')[0].value;
    if (code.length == 0){
        error_object.addClass('error-text');
        error_object.text('You need to enter a join code.');
        hide_progress('#join-progress');
    } else {
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
            hide_progress('#join-progress');
        },error_object,'#join-progress');
    }
});

// new group
$("#new-group").submit( function(event) {
    event.preventDefault();
    group_name = $('#new-group-name').val();
    error_object = $('#new-error');
    error_object.removeClass('error-text');
    error_object.text("");
    show_progress('#new-progress');
    if (group_name.length == 0) {
        error_object.text("Enter a name.");
        hide_progress('#new-progress');
    } else {
        new_group(group_name,function(json_data){
            if (json_data.status == 'error'){
                error_object.addClass('error-text');
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
                error_object.addClass('error-text');
                error_object.text("Invalid reply from API.");
            }
            hide_progress('#new-progress');
        },error_object,'#new-progress');
    }
});

// register email button
$('form#register-email').submit(function(event) {
    event.preventDefault();
    var register_email = $('input#register-email')[0].value;
    var register_name = $('input#register-name')[0].value;
    error_object = $('div#register-email-error');
    error_object.text("");
    show_progress('#register-email-progress');
    if (!register_email.match('.+@.+')){
        error_object.addClass('error-text');
        error_object.text("Please Enter an email address.");
        hide_progress('#register-email-progress');
    } else if (register_name.length == 0) {
        error_object.addClass('error-text');
        error_object.text("Please Enter a Display Name for yourself.");
        hide_progress('#register-email-progress');
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
            hide_progress('#register-email-progress');
        },error_object,'#register-email-progress');
    }
});

// login button
$('form#login-email').submit(function(event) {
    event.preventDefault();
    var login_email = $('input#login-email')[0].value;
    error_object = $('div#login-email-error');
    error_object.text("");
    show_progress('#login-email-progress');
    if (!login_email.match('.+@.+')){
        error_object.addClass('error-text');
        error_object.text("Please Enter an email address.");
        hide_progress('#login-email-progress');
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
            hide_progress('#login-email-progress');
        },error_object,'#login-email-progress');
    }
});

// logout button
$('form#logout-session').submit(function(event) {
    event.preventDefault();
    var creds = getSessionCredentials();
    error_object = $('div#logout-error');
    error_object.text("");
    show_progress('#logout-progress');
    if (getStoredLoginStatus() != 'loggedIn') {
        error_object.addClass('error-text');
        error_object.text("Not logged in.");
        hide_progress('#logout-progress');
    } else if (!creds.session){
        error_object.addClass('error-text');
        error_object.text("No logon session.");
        hide_progress('#logout-progress');
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
            hide_progress('#logout-progress');
        },error_object,'#logout-progress');
    }
});


// verify button
$("form#verify-code").submit(function(event){
    event.preventDefault();
    var verify_code = $('input#verify-email')[0].value;
    var session = getSessionCredentials().session;
    error_object = $('div#verify-code-error');
    error_object.text("");
    show_progress('#verify-code-progress');
    if (verify_code.length == 0){
        error_object.addClass('error-text');
        error_object.text("Please Enter a code.");
        hide_progress('#verify-code-progress');
    } else if (session.length == 0) {
        error_object.addClass('error-text');
        error_object.text("Session ID missing, try a new login instead.");
        hide_progress('#verify-code-progress');
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
            hide_progress('#verify-code-progress');
        },error_object,'#verify-code-progress');
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
    show_progress('#game-list-progress');
    getOwnedGroupList(function(json_data) {
        if (json_data.status == 'error'){
            error_object.addClass('error-text');
            error_object.text(json_data.statusdetail);
        } else if (json_data.status == 'ok'){
            var grouplist = json_data.grouplist;
            if (grouplist.length == 0){
                $('#group-list-container-owned').css('display','none');
            } else {
                $('#group-list-container-owned').css('display','block');
            }
            grouplist.forEach(g => {
                var row = getTemplate('#game-owned-item');
                row.querySelector('#li-item-name').innerText = g.name;
                row.querySelector('#li-item-code').innerText = g.code;
                row.querySelector('#li-item-status').innerText = ['Open','Rolled','Closed'][g.state];
                var rowInDocument = $('#game-owned-list').append(row).children().last();
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
            error_object.removeClass('error-text');
            error_object.text('');
        }
        hide_progress('#game-list-progress');
    },error_object,'#game-list-progress');
    getJoinedGroupList(function(json_data) {
        if (json_data.status == 'error'){
            error_object.addClass('error-text');
            error_object.text(json_data.statusdetail);
        } else if (json_data.status == 'ok'){
            var grouplist = json_data.grouplist;
            if (grouplist.length == 0){
                $('#group-list-container-joined').css('display','none');
            } else {
                $('#group-list-container-joined').css('display','block');
            }
            grouplist.forEach(g => {
                var row = getTemplate('#game-joined-item');
                row.querySelector('#li-item-name').innerText = g.name;
                row.querySelector('#li-item-code').innerText = g.code;
                row.querySelector('#li-item-status').innerText = ['Open','Rolled','Closed'][g.state];
                row.querySelector('#li-item-username').innerText = g.joinname;
                var rowInDocument = $('#game-joined-list').append(row).children().last();
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
            error_object.removeClass('error-text');
            error_object.text('');
        }
        hide_progress('#game-list-progress');
    },error_object,'#game-list-progress');
    
}

function nav_event_join(){
    clearMaterialInputBox('#join-group-code')
    clearMaterialInputBox('#join-group-name')
}

/******************** index functions ********************/

function set_buttons_from_status(){
    var currentstatus = getStoredLoginStatus();
    if (currentstatus == "loggedIn") {
        $(".needs-login").removeClass('nav-hidden');
        $(".needs-logout").addClass('nav-hidden');
        $(".needs-verify").addClass('nav-hidden');

    } else if (currentstatus == "loggedOut") {
        $(".needs-login").addClass('nav-hidden');
        $(".needs-logout").removeClass('nav-hidden');
        $(".needs-verify").addClass('nav-hidden');

    } else if (currentstatus == "verifyNeeded") {
        $(".needs-login").addClass('nav-hidden');
        $(".needs-logout").removeClass('nav-hidden');
        $(".needs-verify").removeClass('nav-hidden');
    }
}

function getOwnedGameOnExpand(element,error_object,progress_element=null){
    var localRoot = $(element)
    if (localRoot.find('#group-sum-card').hasClass('is-filled')){
        // nothing to do
    } else {
        var code = $(element).find('#li-item-code').text()
        show_progress(progress_element);
        get_game_summary(code,function(json_data){
            if (json_data.status == 'error'){
                error_object.addClass('error-text');
                error_object.text(json_data.statusdetail);
            } else if (json_data.status == 'ok'){  
                localRoot.find('#group-sum-members').text(json_data.santas);
                localRoot.find('#group-sum-ideas').text(json_data.ideas);
                localRoot.find('#group-sum-card').addClass('is-filled')
                // create roll button event:
                var rollButton = localRoot.find('#roll-button');
                rollButton.off('click').on('click',function (event) {
                    event.preventDefault();
                    // find root element of this group
                    var gameRoot = $(this).closest('.game-owned-entry');
                    code = gameRoot.find('#li-item-code').text();
                    error_object = gameRoot.find('#game-entry-error');
                    error_object.text("");
                    show_progress(gameRoot.find('#game-entry-progress'));
                    if (code.length != 8) {
                        error_object.text("Codes should be exactly 8 characters long.");
                        hide_progress(gameRoot.find('#game-entry-progress'));
                    } else {
                        roll_santas(code,function(json_data){
                            if (json_data.status == 'error'){
                                error_object.addClass("error-text");
                                error_object.text(json_data.statusdetail);
                                hide_progress(gameRoot.find('#game-entry-progress'));
                            } else if (json_data.status == 'ok'){
                                error_object.removeClass('error-text');
                                error_object.text("Success.");
                                hide_progress(gameRoot.find('#game-entry-progress'));
                            } else {
                                error_object.addClass("error-text");
                                error_object.text("Invalid reply from API.");
                                hide_progress(gameRoot.find('#game-entry-progress'));
                            }
                        },error_object,gameRoot.find('#game-entry-progress'));
                    }
                })

                // create view members event
                var viewMemButton = localRoot.find('#view-members');
                viewMemButton.off('click').on('click',function (event) {
                    var gameRoot = $(this).closest('.game-owned-entry');
                    code = gameRoot.find('#li-item-code').text();
                    error_object = gameRoot.find('#game-entry-error');
                    error_object.text("");
                    show_progress(gameRoot.find('#game-entry-progress'));
                    if (code.length != 8) {
                        error_object.text("Codes should be exactly 8 characters long.");
                        hide_progress(gameRoot.find('#game-entry-progress'));
                    } else {
                        list_users(code,function(json_data){
                            if (json_data.status == 'error'){
                                error_object.addClass("error-text");
                                error_object.text(json_data.statusdetail);
                                hide_progress(gameRoot.find('#game-entry-progress'));
                            } else if (json_data.status == 'ok'){
                                var listDialog = document.querySelector('#UserList');
                                if (! listDialog.showModal) {
                                    dialogPolyfill.registerDialog(listDialog);
                                }
                                // clear a create list
                                var ulElement = $(listDialog).find('#userList-list');
                                ulElement.find('li').remove();
                                var newItems = json_data.users.map(u => 
                                    $('<li>')
                                        .addClass('mdl-list__item')
                                        .append(
                                            $('<span>').addClass('mdl-list__item-primary-content').text(u)
                                        ) 
                                );
                                ulElement.append(newItems);

                                $(listDialog).off('click').on('click',function() {
                                    listDialog.close();
                                });

                                listDialog.showModal();
                            }
                            hide_progress(gameRoot.find('#game-entry-progress'));
                        },error_object,gameRoot.find('#game-entry-progress'));
                    }
                });

                hide_progress(progress_element);
            }
        },error_object);
    }
}

function getJoinedGameOnExpand(element,error_object,progress_element=null){
    localRoot = $(element);
    var openStatus = localRoot.find('#li-item-status').text();
    if (openStatus == 'Open') {
        localRoot.find('#group-list-open').css('display','block');
        localRoot.find('#group-list-rolled').css('display','none');
        // register idea action
        if (localRoot.find('#group-list-open').hasClass('is-filled')){
            // nothing to do
        } else {
            show_progress(progress_element);
            localRoot.find('#game-list-new-idea').submit(function(event) {
                event.preventDefault();
                var code = localRoot.find('#li-item-code').text();
                var ideaBox = localRoot.find('#game-list-register-idea');
                var idea = ideaBox.val();
                error_object = localRoot.find('#game-list-idearegister-error');
                error_object.text("");
                progress_object = localRoot.find('#game-list-idearegister-progress');
                show_progress(progress_object);
                button_object = $(this).find('#enter-idea-button');
                disable_button(button_object);
                if (idea.length == 0) {
                    error_object.text("You must input an idea.");
                    hide_progress(progress_object);
                    enable_button(button_object);
                } else if (idea.length > 260) {
                    error_object.text("Ideas are limited to 260 Characters, be more succinct.")
                    hide_progress(progress_object);
                    enable_button(button_object);
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
                        hide_progress(progress_object);
                        enable_button(button_object);
                    },error_object,progress_object);
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
            show_progress(progress_element);
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
                        error_object.removeClass('error-text');
                        error_object.text("");
                    } else {
                        error_object.addClass('error-text');
                        error_object.text("No ideas given, please reload.");
                    }
                    localRoot.find('#group-list-rolled').addClass('is-filled');
                }
                hide_progress(progress_element);
            },error_object);
        }
    }
}

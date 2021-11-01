/* front end code for santa api */

/* shared functions and variables */

// set location of backend.
var backendUri = "http://localhost:5000";

function get_game(code,callback,error_element){
    var uri = backendUri + "/game?code=" + code;
    $.getJSON(uri,callback).fail(function(e){ error_element.text("Unable to contact server.") })
}

function get_user(code,name,callback,error_element){
    var uri = backendUri + '/user?code=' + code + '&name=' + name;
    $.getJSON(uri,callback).fail(function(e){ error_element.text("Unable to contact server.") })
}

function add_user(code,name,callback,error_element){
    var uri = backendUri + '/user';
    var post_data = JSON.stringify({"code": code,"name": name})
    $.post(uri,post_data,callback, 'json').fail(function(e){ error_element.text("Unable to contact server.")});
}

function joinGroup(code,name,callback,error_element){
    if (getStoredLoginStatus() == "loggedIn"){
        post = {'code':code,'name':name}
        $.extend(post,getSessionCredentials());
        doEndpointPost(post,'join_game',callback,error_element);
    } else {
        error_element.text = "Not logged in.";
    }
}

function add_idea(code,idea,callback,error_element){
    var idea_post_data = {'code': code,'idea': idea};
    $.extend(idea_post_data,getSessionCredentials());
    doEndpointPost(idea_post_data,'idea',callback,error_element)
}

function get_auth(code,secret,callback,error_element){
    var uri = backendUri + '/game';
    var auth_post_data = JSON.stringify({"code":code,"secret":secret,"auth":1});
    $.post(uri,auth_post_data,callback,'json').fail(function(e){ error_element.text("Unable to contact server.")});
}

function roll_santas(code,callback,error_element){
    if (getStoredLoginStatus() == "loggedIn"){
        post = {'code':code,'state':1}
        $.extend(post,getSessionCredentials());
        doEndpointPost(post,'game',callback,error_element);
    } else {
        error_element.text = "Not logged in.";
    }
}

function new_group(name,callback,error_element){
     if (getStoredLoginStatus() == "loggedIn"){
        post = {'name':name}
        $.extend(post,getSessionCredentials());
        doEndpointPost(post,'new',callback,error_element);
    } else {
        error_element.text = "Not logged in.";
    }
}

function list_users(code,secret,callback,error_element){
    var uri = backendUri + '/list_user';
    var list_users_post_data = JSON.stringify({'code':code,'secret':secret});
    $.post(uri,list_users_post_data,callback,'json').fail(function(e){ error_element.text("Unable to contact server.")});
}

function get_game_summary(code,callback,error_element){
    if (getStoredLoginStatus() == "loggedIn"){
        post = {'code':code}
        $.extend(post,getSessionCredentials());
        doEndpointPost(post,'game_sum',callback,error_element);
    } else {
        error_element.text = "Not logged in.";
    }
}

// get ideas that were not selected for anyone.
function list_leftover_ideas(code,callback,error_element){
    var uri = backendUri + '/idea?code=' + code;
    $.getJSON(uri,callback).fail(function(e){ error_element.text("Unable to contact server.") })
}

// get group selection results
function get_group_results(code,callback,error_element){
    var post = {'code':code};
    $.extend(post,getSessionCredentials());
    doEndpointPost(post,'results',callback,error_element);
}

function getEndpoint(name){
    return (backendUri + '/' + name);
}

function doEndpointPost(data,path,callback,error_element){
    var post_data = JSON.stringify(data);
    $.post(getEndpoint(path),post_data,callback,'json').fail(function(e){ error_element.text("Unable to contact server.")});
}
/********** Display change functions *********/

function show_card_matching(idmatch){
    $('#main').children('div').each(function(i){
        if (this.id.match(idmatch)) {
            $(this).css('display','block');
        } else {
            $(this).css('display','none');
        }
    });
}

function show_card_exact(id_cards){
    $('#main').children('div').each(function(i){
        if (id_cards.includes(this.id)) {
            $(this).css('display','block');
        } else {
            $(this).css('display','none');
        }
    });
    var navFunctionName = "nav_event_" + id_cards.replace('-','_');
    if (typeof window[navFunctionName] === 'function'){
        var funcObject = window[navFunctionName];
        funcObject();
    }
}

function getTemplate(query){
    return $(query)[0].content.cloneNode(true);
}

function insertItemToNode(targetSelector,insertObject){
    $(targetSelector).append(insertObject);
}

function clearMaterialInputBox(selector){
    $(selector).val('').parent().removeClass('is-focused').removeClass('is-dirty');
}

/************* login storage *************/

var storedValues = window.localStorage;

function getStoredLoginStatus(){
    if (storedValues.sessionid) {
        if (storedValues.sessionpw) {
            return "loggedIn";
        } else {
            return "verifyNeeded";
        }
    } else {
        return "loggedOut";
    }
}

function getSessionCredentials(){
    currentStatus = getStoredLoginStatus()
    if (currentStatus== "loggedIn") {
        return {
            "session" : storedValues.sessionid,
            "secret" : storedValues.sessionpw,
        };
    } else if (currentStatus == "verifyNeeded") {
        return {
            "session" : storedValues.sessionid,
        }
    } else {
        return {};
    }
}

function setSessionId(sessionid){
    storedValues.sessionid = sessionid;
}

function setSessionPw(sessionpw){
    storedValues.sessionpw = sessionpw;
}

function clearSession(){
    storedValues.removeItem('sessionid');
    storedValues.removeItem('sessionpw');
}

function doLogin(email,callback,error_element){
    doEndpointPost({'email':email},'auth/new_session',callback,error_element);
}

function doRegister(email,name,callback,error_element){
    doEndpointPost({'email':email,'name':name},'auth/register',callback,error_element);
}

function doVerify(sessionid,verify,sessionpw,callback,error_element){
    doEndpointPost({'session':sessionid,'code':verify,'secret':sessionpw},'auth/verify_session',callback,error_element);
}

function doLogOut(sessionId,sessionPw,callback,error_element){
    doEndpointPost({'session':sessionId,'secret':sessionPw},'auth/end_session',callback,error_element);
}

/*********************** Secret gen  ***************/

// https://stackoverflow.com/a/27747377

// dec2hex :: Integer -> String
// i.e. 0-255 -> '00'-'ff'
function dec2hex (dec) {
    return dec.toString(16).padStart(2, "0")
}

// generateId :: Integer -> String
function generateId (len) {
    var arr = new Uint8Array((len || 60) / 2)
    window.crypto.getRandomValues(arr)
    return Array.from(arr, dec2hex).join('')
}

/***********new group view *************/
function getOwnedGroupList(callback,error_element) {
    if (getStoredLoginStatus() == "loggedIn"){
        var creds = getSessionCredentials();
        doEndpointPost({
            'session': creds.session,
            'secret' : creds.secret,
        },'game/owned',callback,error_element);
    } else {
        error_element.text('Not logged on.')
    }
}

function getJoinedGroupList(callback,error_element) {
    if (getStoredLoginStatus() == "loggedIn"){
        var creds = getSessionCredentials();
        doEndpointPost({
            'session': creds.session,
            'secret' : creds.secret,
        },'game/joined',callback,error_element);
    } else {
        error_element.text('Not logged on.')
    }
}

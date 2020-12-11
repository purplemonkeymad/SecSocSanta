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

function add_idea(code,idea,callback,error_element){
    var uri = backendUri + '/idea';
    var idea_post_data = JSON.stringify({'code': code,'idea': idea});
    $.post(uri,idea_post_data,callback,'json').fail(function(e){ error_element.text("Unable to contact server.")});
}

function get_auth(code,secret,callback,error_element){
    var uri = backendUri + '/game';
    var auth_post_data = JSON.stringify({"code":code,"secret":secret,"auth":1});
    $.post(uri,auth_post_data,callback,'json').fail(function(e){ error_element.text("Unable to contact server.")});
}

function roll_santas(code,secret,callback,error_element){
    var uri = backendUri + '/game';
    var roll_post_data = JSON.stringify({'code':code,'secret':secret,'state':1});
    $.post(uri,roll_post_data,callback,'json').fail(function(e){ error_element.text("Unable to contact server.")});
}

function new_group(name,callback,error_element){
    var uri = backendUri + '/new';
    var new_post_data = JSON.stringify({'name':name});
    $.post(uri,new_post_data,callback,'json').fail(function(e){ error_element.text("Unable to contact server.")});
}

function list_users(code,secret,callback,error_element){
    var uri = backendUri + '/list_user';
    var list_users_post_data = JSON.stringify({'code':code,'secret':secret});
    $.post(uri,list_users_post_data,callback,'json').fail(function(e){ error_element.text("Unable to contact server.")});
}

// get ideas that were not selected for anyone.
function list_leftover_ideas(code,callback,error_element){
    var uri = backendUri + '/idea?code=' + code;
    $.getJSON(uri,callback).fail(function(e){ error_element.text("Unable to contact server.") })
}
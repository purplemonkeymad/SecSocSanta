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
    post_data = JSON.stringify({"code": code,"name": name})
    $.post(uri,post_data,callback, 'json').fail(function(e){ error_element.text("Unable to contact server.")});
}

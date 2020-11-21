/* front end code for santa api */

/* shared functions and variables */

// set location of backend.
var backendUri = "http://localhost:5000";

function get_game(code,callback,error_element){
    var uri = backendUri + "/game?code=" + code;
    $.getJSON(uri,callback).fail(function(e){ error_element.text("Unable to contact server.") })
}
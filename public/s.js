/*eslint-env jquery, browser*/
"use strict";
var context={};
var Wpic = "<div class=\"row\"><div class=\"col-xs-2\"><img  data-toggle=\"tooltip\" title=\"Watson!\" data-placement=\"top\" src=\"/images/IBM_Watson_avatar_neg.png\" class=\"img-responsive pic-style\" alt=\"Cinque Terre\" ></div><div class=\"col-xs-10\">";
var Cpic = "<div class=\"row\"><div class=\"col-xs-2\"><img  data-toggle=\"tooltip\" title=\"You!\" src=\"/images/client.png\" class=\"img-responsive pic-style\" alt=\"Cinque Terre\" ></div>	<div class=\"col-xs-10\">  ";

function watsontalk(input) {
	$("#mainchatbody").append("<div class=\"well Watsonchat\">" + Wpic + input + "</div></div>");
	$("[data-toggle=\"tooltip\"]").tooltip();
	$("html, body").scrollTop($(document).height());
}
function Ctalk(input) {
		$("#mainchatbody").append("<div class=\"well Clientchat\">" + Cpic + input + "</div></div>");
	$("#usrinput").val("");
	$("#usrinput").focus();
	$("html, body").scrollTop($(document).height());
}
$(document).ready(function () {
	$("[data-toggle=\"tooltip\"]").tooltip();
	//$("notfound").append("ready");
	var params = {

	};
	$.post("/conversation", params).done(function onSucess(dialog) {
		context = dialog.context;
		watsontalk(dialog.output.text);
		console.log(JSON.stringify(context));
	});
	
	$("#usrinput").keydown(function (event) {
		if (event.keyCode == 13) { //ENTER IS PRESSED
			if (typeof($("#usrinput").val()) !== undefined && $.trim($("#usrinput").val()) !== "") {//Simple Validation of Input text
				params = {
					"text" : $("#usrinput").val(),
					"context" : context
				};
				
				
				console.log(JSON.stringify(params));
				var name = $("#usrinput").val();

				Ctalk(name);
				$.post("/conversation", params).done(function onSucess(dialog) {
					watsontalk(dialog.output.text);
					context = dialog.context;
				});
			}

			return false;
		}
	});
});
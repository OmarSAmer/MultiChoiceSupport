/*eslint-env jquery, browser*/
/*eslint-disable no-unused-vars */
"use strict";
var context = {};
var Wpic = "<div class=\"row\"><div class=\"col-xs-2\"><img  data-toggle=\"tooltip\" title=\"Watson!\" data-placement=\"top\" src=\"/images/IBM_Watson_avatar_neg.png\" class=\"img-responsive pic-style\" alt=\"Cinque Terre\" ></div><div class=\"col-xs-10\">";
var Cpic = "<div class=\"row\"><div class=\"col-xs-2\"><img  data-toggle=\"tooltip\" title=\"You!\" src=\"/images/client.png\" class=\"img-responsive pic-style\" alt=\"Cinque Terre\" ></div>	<div class=\"col-xs-10\">  ";
var BackBut = '<button type="button" class="btn btn-default" onclick="BackConv()"><<span class="sr-only">Back</span></button>';
var FeedbackUP1 = '<button type="button" class="btn btn-success" onclick="FB(\'up\',\'';
var FeedbackUP2 = '\')"><span class="glyphicon glyphicon-thumbs-up"></span></button>';
var FeedbackUP3 = '<button type="button" class="btn btn-danger" onclick="FB(\'down\',\'';
var FeedbackUP4 = '\')"><span class="glyphicon glyphicon-thumbs-down"></span></button>';
var fbid = "";
//



function watsontalk(input, back, feedback, ID, rcontext) {
    var ChatBody = Wpic + input;
    if (back === "true")
        ChatBody += BackBut;
    if (feedback === "true") {
        ChatBody += FeedbackUP1 + ID + FeedbackUP2;
        ChatBody += FeedbackUP3 + ID + FeedbackUP4;
    }


    $("#mainchatbody").append("<div class=\"well Watsonchat\" id='" + ID + "' rc='" + JSON.stringify(rcontext) + "'>" + ChatBody + "</div></div>");
    $("[data-toggle=\"tooltip\"]").tooltip();
    $("html, body").scrollTop($(document).height());
}

function Ctalk(input) {
    $("#mainchatbody").append("<div class=\"well Clientchat\">" + Cpic + input + "</div></div>");
    $("#usrinput").val("");
    $("#usrinput").focus();
    $("html, body").scrollTop($(document).height());
}

function FB(input, ID) {
    var params = {};
    if (input === "up")
        params = {
            "fb": {
                "id": ID,
                "success": true
            }
        };
    else if (input === "down") {
        fbid = ID;
        $("#Feedback").modal();
        return;
    } else
        params = {
            "fb": {
                "id": fbid,
                "success": false,
                "reason": input,
                "data": JSON.parse($("#" + fbid).attr("rc"))
            }
        };

    console.log(JSON.stringify(params));
    //console.log(JSON.stringify(params));
    //	var name = $("#usrinput").val();

    //Ctalk(name);
    $.post("/feedback", params).done(function onSucess(dialog) {
        //watsontalk(dialog.output.text, dialog.context.back);
        // context = dialog.context;
        if (dialog.code === "ok")
            $("#Feedback").modal("hide");
        $("#FBS").modal();
    });
}

function BackConv() {

    var params = {
        "text": "#Back",
        "context": context
    };

    console.log(JSON.stringify(params));
    //console.log(JSON.stringify(params));
    //	var name = $("#usrinput").val();

    //Ctalk(name);
    $.post("/conversation", params).done(function onSucess(dialog) {
        watsontalk(dialog.output.text, dialog.context.back);
        context = dialog.context;
    });
}

$(document).ready(function() {
    $("[data-toggle=\"tooltip\"]").tooltip();
    //$("notfound").append("ready");
    var params = {

    };
    $.post("/conversation", params).done(function onSucess(dialog) {
        context = dialog.context;
        watsontalk(dialog.output.text);
        console.log(JSON.stringify(context));
    });

    $("#usrinput").keydown(function(eventsq) {
        if (eventsq.keyCode === 13) { //ENTER IS PRESSED
            if (typeof $("#usrinput").val() !== undefined && $.trim($("#usrinput").val()) !== "") { //Simple Validation of Input text
                params = {
                    "text": $("#usrinput").val(),
                    "context": context
                };


                console.log(JSON.stringify(params));
                var eee = $("#usrinput").val();

                Ctalk(eee);
                $.post("/conversation", params).done(function onSucess(dialog) {
                    var rc = {};
                    console.log("here we go");
                    console.log(JSON.stringify(dialog));
                    rc.A = dialog.context.AnswerCode;
                    rc.I = dialog.intents[0].intent;
                    watsontalk(dialog.output.text, dialog.context.back, dialog.context.feedback, dialog.context.UID, rc);
                    context = dialog.context;
                });
            }

            return false;
        }
    });
});
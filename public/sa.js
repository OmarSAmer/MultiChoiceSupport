/*eslint-env jquery, browser*/
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
    if (back == "true")
        ChatBody += BackBut;
    if (feedback == "true") {
        ChatBody += FeedbackUP1 + ID + FeedbackUP2;
        ChatBody += FeedbackUP3 + ID + FeedbackUP4;
    }


    $("#mainchatbody").append("<div class=\"well Watsonchat\" id='" + ID + "' rc='" + JSON.stringify(rcontext) + "'>" + ChatBody + "</div></div>");
    $("[data-toggle=\"tooltip\"]").tooltip();
    $("html, body").scrollTop($(document).height());
}




function SA(input){
    $("#FBAP").text("AnswerID: "+  $("#"+input).attr("value"));
    fbid=input;
     var params = {
        "input": $("#"+input).attr("value")
    };
        $.post("/GetP", params).done(function onSucess(out) {
       $("#FBAA").val(out);
       console.log(out);
        $("#FBA").modal("show");
    });
     
      

};
function SW(input){
     $("#FBW").modal("show");
    $("#FBWP").text("Uncorrectly identified Intent: "+ $("#"+input).attr("value"));
    fbid=input;

     
      

};
function FBS(){
var params = {
    "input":$("#"+fbid).attr("value"),
        "value":  $("#FBAA").val()
    };
       $.post("/SetP", params).done(function onSucess(out) {
     //  $("#FBAA").getValue(out);
     if(out=="k323"){
        $("#FBA").modal("hide");
    FBN(); 
    }
        else
         $("#error").modal("show");
    });
}
function FBN(){
var params = {
        "input":  fbid
    };
       $.post("/FBN", params).done(function onSucess(out) {
     //  $("#FBAA").getValue(out);
     if(out=="done"){
        $("#FBA").modal("hide");
    $("#FBW").modal("hide"); 
    refresh();
    }
        else
         $("#error").modal("show");
    });
}
function refresh(){
       var params = {

    };
    $("#mainchatbody").html("");
       $.post("/adminallview", params).done(function onSucess(out) {
      out.forEach(node=>{
          if(node.success=="false")
          if(node.reason=="W")
          $("#mainchatbody").append("<div class=\"well Watsonchat\" type='W' id='" + node.id + "' value='" + JSON.stringify(node.data.I) + "'>" +"Feedback ID:"+ node.id+'<button type="button" class="btn btn-default"   onclick="SW(\'' + node.id +'\')">Open</button>' +    "</div></div>");
          else if (node.reason=="A")
          $("#mainchatbody").append("<div class=\"well Watsonchat\" type='A' id='" + node.id + "' value='" + JSON.stringify(node.data.A) + "'>" +"Feedback ID:"+ node.id + '<button type="button" class="btn btn-default"   onclick="SA( \''+ node.id +'\')">Open</button>'+ "</div></div>");
      });
    });
}
$(document).ready(function() {
    $("[data-toggle=\"tooltip\"]").tooltip();
    //$("notfound").append("ready");
 
 
refresh();
});
/*eslint-env node, express*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require("express");

var watson = require("watson-developer-cloud");
var bodyparser = require("body-parser");
var https = require("https");
const fs = require('fs')
    //var parse = require('csv-parse');
var Prop = [];
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('./MC-FAQ-Answers.properties');
/*
fs.readFile("./MC-FAQ-Answers.properties", function(err, data) {
    parse(data, { columns: true, delimiter: '=' }, function(err, rows) {
        Prop = rows;
        console.log("properties file loaded")
        console.log((rows[0]))
    })
})
*/


// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require("cfenv");
var conv_ws_id = "1382a32a-daa0-4368-ac45-82a8bf8d64db";
// create a new express server
var app = express();
var cred = new Buffer("f8ff7e7f-5ddc-4b0a-9db3-3305c439c0e1:xt3zWSAq4fYg").toString("base64");

var conversation = watson.conversation({
    username: "4b9b9fd4-27eb-49fb-b0a3-9d90cb05b087",
    password: "RznBsSfgbjf1",
    version: "v1",
    version_date: "2016-09-20"
});
// serve the files out of ./public as our main files
app.use(express.static(__dirname + "/public"));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

app.post("/conversation", function(req, res, next) {
    conversation.message({
        workspace_id: '3c791cbd-f690-4bc6-a7fb-16d9e870a1fd',
        input: { "text": req.body.text },
        context: req.body.context
    }, function(err, response) {
        if (err)
            console.log("error:", err);
        else {
            console.log(response.intents);
            console.log("this error : " + JSON.stringify(response, null, 2));
            if (response.output.text[0] != undefined) {
                if (response.output.text[0].substring(0, 2) === "A-" || response.output.text[0].substring(0, 2) === "B-" || response.output.text[0].substring(0, 2) === "R-") {
                    response.output.text[0] = properties.get(response.output.text[0]);
                    res.json(response);
                } else {
                    res.json(response);
                }
            } else {
                response.output.text[0] = properties.get("Default");
                res.json(response);
            }
        }

    });

});





// start server on the specified port and binding host
app.listen(appEnv.port, "0.0.0.0", function() {
    // print a message when the server starts listening
    console.log("server starting on " + appEnv.url);
});
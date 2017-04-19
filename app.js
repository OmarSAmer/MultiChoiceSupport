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
    version_date: "2017-04-21"
});
// serve the files out of ./public as our main files
app.use(express.static(__dirname + "/public"));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

app.post("/conversation", function(req, res, next) {
    if (req.body.context != undefined) {
        console.log("start");
        console.log("back:", req.body.context.back);
        console.log("t:", req.body.text);
        console.log("back:", req.body.context.back === true);
        console.log("t:", req.body.text == "#Back");
    }
    if (req.body.context != undefined && req.body.context.back == "true" && req.body.text == "#Back") {
        var response = req.body.context.prev_response;
        if (req.body.context.holdback == "true")
            response = response.context.prev_response;
        console.log(JSON.stringify(response));
        response.context.back = false;
        response.context.holdback = true;
        response.context.prev_response = null;
        response.context.prev_response = JSON.parse(JSON.stringify(response));
        res.json(response);

    } else {
        conversation.message({
            workspace_id: '02a0ffcf-68f4-4ffd-a879-90a4f9994802',
            input: { "text": req.body.text },
            context: req.body.context
        }, function(err, response) {
            if (err)
                console.log("error:", err);
            else {
                console.log(response.intents);


                if (response.output.text[0] != undefined) {
                    if (response.output.text[0].substring(0, 2) === "A-" || response.output.text[0].substring(0, 2) === "B-" || response.output.text[0].substring(0, 2) === "R-") {



                        response.output.text[0] = properties.get(response.output.text[0]);

                        if (response.context.system.dialog_stack[0].dialog_node == "root") {
                            if (req.body.context.holdback == "true") {
                                response.context.holdback = "false";
                                response.context.back = "true";
                            } else {
                                response.context.back = "false"; ////////////////////////////////////
                                response.context.prev_response = {};
                            }
                        } else {
                            if (req.body.context.holdback == "true")
                                response.context.back = "true";
                            else {
                                response.context.holdback = "true";
                                response.context.back = "false";
                            }

                            response.context.prev_response = JSON.parse(JSON.stringify(response));
                        }

                        res.json(response);
                        console.log("Code Res : " + JSON.stringify(response, null, 2));
                    } else {
                        if (req.body.context && req.body.context.holdback == "true") {
                            response.context.holdback = "false";
                            response.context.back = "true";
                        } else {
                            response.context.back = "false";
                            response.context.prev_response = {};
                        }
                        res.json(response);
                    }
                } else {
                    if (req.body.context && req.body.context.holdback == "true") {
                        response.context.holdback = "false";
                        response.context.back = "true";
                    } else {
                        response.context.back = "false";
                        response.context.prev_response = {};
                    }
                    response.output.text[0] = properties.get("Default");
                    res.json(response);
                }
            }

        });
    }

});





// start server on the specified port and binding host
app.listen(appEnv.port, "0.0.0.0", function() {
    // print a message when the server starts listening
    console.log("server starting on " + appEnv.url);
});
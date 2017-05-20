/*eslint-env node, express*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
/*eslint-disable no-unused-params, no-unused-vars*/
var express = require("express");

var watson = require("watson-developer-cloud");
var bodyparser = require("body-parser");
var http = require("http");
var https = require("https");
const fs = require('fs');
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
/*
var globalTunnel = require('global-tunnel');
 
globalTunnel.initialize({
  host: '10.100.12.10',
  port: 8080,
  sockets: 50 // optional pool size for each http and https 
});
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

function reportCB(input) {

    var reqq = http.request({
            host: 'd61aeb2b-f7b7-4691-93f8-0e0c76772f57-bluemix.cloudant.com',
            path: '/logs/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + cred

            }
        }, function(response) {

            var str = '';

            //another chunk of data has been recieved, so append it to `str`
            response.on('data', function(chunk) {

                str += chunk;
            });

            //the whole response has been recieved, so we just print it out here
            response.on('end', function() {

                str = JSON.parse(str);



            });

        }


    );
    reqq.write(JSON.stringify(input));
    reqq.end();
}

app.post("/adminallview", function(res) {
    var ress=[];
fs.readdir("./fb", (err, files) => {
  files.forEach(file => {
    console.log(file);
    try{
      var data=fs.readFileSync("./fb/"+file);

      data=JSON.parse(data);
                          
ress[ress.length]=data;
    }
    catch(err){
        console.log(err);
    }
//console.log(ress[0]);
                    
                
  });
   res.json(ress);
});
});

app.post("/GetP", function(req, res) {
   
    res.json(properties.get(JSON.parse(req.body.input)));
});
app.post("/SetP", function(req, res) {
    console.log("setP"+req.body.input);
    console.log(JSON.stringify(req.body.value));
    properties.set(JSON.parse(req.body.input),req.body.value);
    var saveme="";
  
    properties.each((key, value) => {
saveme+=key+"="+value+"\n";

    });

    //saveme=saveme.replace(/,/g,"\n");
       fs.writeFile('./MC-FAQ-Answers.properties', saveme, (err) => {
                        if (err) throw err;
                   
                    });
    res.json("k323");
});
app.post("/FBN", function(req, res) {
    //console.log("./fb/"+req.body.input+".fb");
   // fs.closeSync("./fb/"+req.body.input+".fb");
    fs.unlink("./fb/"+req.body.input+".fb",function(){
 res.json("done");
    }
    );
   
});
app.post("/feedback", function(req, res) {
    console.log(JSON.stringify(req.body.fb));
    fs.open("./fb/"+req.body.fb.id + ".fb", 'wx', (err, fd) => {
        console.log("cp 1");
        if (err) {
            if (err.code === 'EEXIST') {
                fs.readFile("./fb/"+req.body.fb.id + ".fb", (err, datas) => {
                    if (err) throw err;
                    var datase = JSON.parse(datas);
                    datase = req.body.fb;
                    console.log("cp 2");
                    fs.writeFile("./fb/"+req.body.fb.id + ".fb", JSON.stringify(datase), (err) => {
                        if (err) throw err;
                        console.log('The file has been saved!');
                         fs.closeSync(fd);
                    });
                    console.log(datase);
                });
                console.error('myfile already exists');
                return;
            }


        } else {
            var data = req.body.fb;
            console.log("cp 3");
            fs.writeFile("./fb/"+req.body.fb.id + ".fb", JSON.stringify(data), (err) => {
                if (err) throw err;
                console.log('The file has been saved!');
                 fs.closeSync(fd);
            });
        }


    });
   
    res.json({ code: 'ok' });

});
app.post("/conversation", function(req, res) {
    var startdate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    if (req.body.context != undefined) {
        console.log("start");
        console.log("back:", req.body.context.back);
        console.log("t:", req.body.text);
        console.log("back:", req.body.context.back === true);
        console.log("t:", req.body.text === "#Back");
    }
    if (req.body.context != undefined && req.body.context.back === "true" && req.body.text === "#Back") {
        var response = req.body.context.prev_response;
        response.context.current_response = JSON.parse(JSON.stringify(response));
        console.log("no 1, ", JSON.stringify(response));
        //      if (req.body.context.holdback == "true")
        //    response = JSON.parse(response.context.prev_response);
        //   
        //      response = response.context.prev_response;
        console.log(JSON.stringify(response));
        //response.context.back = false;
        // response.context.holdback = true;
        //  response.context.prev_response = null;
        //  response.context.prev_response = JSON.parse(JSON.stringify(response));
        res.json(response);

    } else {
        conversation.message({
            workspace_id: '5aa72247-d74a-46aa-8617-1c67f8fd8032',
            input: { "text": req.body.text },
            context: req.body.context
        }, function(err, response) {
            if (err)
                console.log("error:", err);
            else {
                console.log(response.intents);
                var FB = false;
                var sfd = Object.keys(response.context.system._node_output_map);
                //  console.log("lets see:" + Object.keys(response.context.system._node_output_map));
                //  sfd = sfd.replace("}", "]");
                //sfd = JSON.parse(sfd);
                //
                // console.log("let me check:" + sfd);
                response.context.LastNode = sfd[sfd.length - 1];
                console.log(sfd);
                console.log(response.context.LastNode);
                console.log("done");
                response.context.AnswerCode = response.output.text[0];

                if (response.context.count) response.context.count++;
                else
                    response.context.count = 0;

                response.context.UID = response.context.conversation_id + "-" + response.context.count;
                if (response.output.text[0] != undefined) {
                    if (response.output.text[0].substring(0, 2) === "A-" || response.output.text[0].substring(0, 2) === "B-" || response.output.text[0].substring(0, 2) === "R-") {
                        response.output.text[0] = properties.get(response.output.text[0]);
                        FB = true;
                    }

                } else {
                    response.output.text[0] = properties.get("Default");
                }


                if (response.context.system.dialog_stack[0].dialog_node === "root") {
                    if (FB)
                        response.context.feedback = "true";
                    if (req.body.context && req.body.context.holdback === "true") {
                        response.context.holdback = "false";
                        response.context.back = "true";
                    } else {
                        response.context.back = "false"; ////////////////////////////////////
                        response.context.prev_response = null;
                        response.context.current_response = undefined;
                    }
                } else {
                    response.context.feedback = "false";
                    if (req.body.context && req.body.context.holdback === "true")
                        response.context.back = "true";
                    else {
                        response.context.holdback = "true";
                        response.context.back = "false";
                    }

                }
                if (response.context.back === "true" || response.context.holdback === "true")
                    if (!response.context.current_response == undefined) {
                        response.context.prev_response = null;
                        response.context.current_response = JSON.parse(JSON.stringify(response));
                    } else {
                        response.context.prev_response = response.context.current_response;
                        response.context.current_response = JSON.parse(JSON.stringify(response));
                    }

                res.json(response);
                console.log("Code Res : " + JSON.stringify(response, null, 2));
                var statusch = "Start";
                if (response.context.count > 0) statusch = "Middle";
                if (response.context.feedback === "true") statusch = "End";

                reportCB({
                    start: startdate,
                    end: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
                    status: statusch,
                    Category_Name: "null",
                    ConversationID: response.context.conversation_id,
                    UtternaceID: response.context.conversation_id + "-" + response.context.count

                });

                // Set up the request



            }

        });
    }

});





// start server on the specified port and binding host
app.listen(appEnv.port, "0.0.0.0", function() {
    // print a message when the server starts listening
    console.log("server starting on " + appEnv.url);
});
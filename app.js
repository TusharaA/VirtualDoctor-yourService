/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express    = require('express'),
app          = express(),
watson       = require('watson-developer-cloud');
var mongo = require("./routes/mongo");
var mongoURL = "mongodb://localhost:27017/virtualdoctor";
var medicalResult = {};
//Bootstrap application settings
require('./config/express')(app);
var completeResult={};

//Create the service wrapper
var nlClassifier = watson.natural_language_classifier({
	url : 'https://gateway.watsonplatform.net/natural-language-classifier/api',
	username : '5d25a679-b34a-4c48-a54c-4b87b1930c92',
	password : 'nlQNERJZcGvr',
	version  : 'v1'
});

//render index page
app.get('/', function(req, res) {
	res.render('homepage', {
		ct: req._csrfToken,
		ga: process.env.GOOGLE_ANALYTICS
	});
});

app.post('/api/classify', function(req, res, next) {
	var params = {
			classifier: process.env.CLASSIFIER_ID || '3a84dfx64-nlc-5232', // pre-trained classifier
			text: req.param("questionText")
	};
	var json_response;
	nlClassifier.classify(params, function(err, results) {
		if (err) {
			return next(err);    
		} else {
			medicalResult = results;
			console.log(JSON.stringify(results));
			mongo.connect(mongoURL, function(){
				var coll = mongo.collection('Treatment');
				coll.findOne({"disease":results.top_class},{"_id":0},function(err, result) {
					if (err) {
						throw err;
					} else{						
						if(result){
							console.log("result.."+JSON.stringify(result));
							results.treatment = result;
							completeResult=results;
							json_response = {"results" : results};
							res.send(json_response);
						}else{
							results.treatment = "No Treatment";
							completeResult=results;
							json_response = {"results" : results};
							res.send(json_response);
						} 
					}	
				}); 
			});
		}
	});
});
app.get('/result',function(req,res){
	res.render('result',completeResult);
});

require('./config/error-handler')(app);
module.exports = app;
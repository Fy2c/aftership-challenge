var toolbelt 	= require('./utilities'),
	when     	= require('when'),
	http 		= require('http'),
	dateformat 	= require('dateformat'),
	parser	 	= require('xml2js');

var deferred = when.defer();

function upspsAPI() {
	//quick and dirty setting...
	this.userID = '868NONE07807';
	this.apiVersion = 'TrackV2';
}


upspsAPI.prototype.getRequest = function(tracking_number){

	this.tracking_number = tracking_number;

	var baseURL = 'production.shippingapis.com';
	var path = '/ShippingAPITest.dll';
	var xml = '<TrackRequest USERID="{0}"><TrackID ID="{1}"></TrackID></TrackRequest>';

	var querystring = new Array();
	querystring['API'] = this.apiVersion;
	querystring['XML'] = toolbelt.stringFormat(xml, [this.userID, tracking_number]);

	var requestOptions = {};
	requestOptions.host = baseURL;
	requestOptions.path = toolbelt.buildUrl(path, querystring);

	http.request(requestOptions, responseHandler).end();
	return deferred.promise;
}

// Response Action Handler
//===========================
function responseHandler(res){
	res.on('data', resDataPiper);
	res.on('end', resFinalizer);
}

function resDataPiper(chunk){
	this.buffer = this.buffer || '';
	this.buffer += chunk;
}

function resFinalizer(){
	try {
		var result = this.buffer.replace("\ufeff", "");

		// should use
		// sax.js or async with a child worker (in another process worker)....
    	parser.parseString(result, parserHandler);
	}
	catch(err) {
		//	send ticket, or support mail..
		//	also log and return error to customers
		deferred.reject(err);
	}
}

function parserHandler(err, result){
	var tracking_result = {checkpoints : []};

	//use for loop to avoid error.
	for(var tr in result){
		var trackResponse = result[tr];

		for(var ti in trackResponse){
			var trackInfo = trackResponse[ti];

			for(var td in trackInfo){
				var trackDetail = trackInfo[td];
				var result = parseResult(trackDetail);
				tracking_result.checkpoints.push(result);
			}
			
		}
	}
	deferred.resolve(tracking_result);
}


function parseResult(data){

	var trackSummary = data.TrackSummary;
	for(var i in trackSummary){

		var summary = trackSummary[i];
		var checkpoint = {};
		var idxDate = {};

		idxDate.start = summary.indexOf(' at ') + ' at '.length;
		idxDate.end = summary.indexOf(' in ');

		var msg = summary.match("was (.*) at");
		var dateTime = {};
		var rawDate = summary.substring(idxDate.start, idxDate.end);
		var time = rawDate.match("(.*) (pm|am)")[1];
		var date = rawDate.match("on (.*)")[1];

		dateTime = Date.parse(date + " " + time);

		checkpoint['country_name'] = '';
		checkpoint['message'] = toolbelt.capitaliseFirstLetter(msg[1]);
		checkpoint['checkpoint_time'] = dateformat(dateTime, 'isoDateTime')

		return checkpoint;
		
	}
	
}

module.exports = new upspsAPI;
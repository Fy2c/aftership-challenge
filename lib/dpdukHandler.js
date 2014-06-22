var toolbelt 	= require('./utilities'),
	when     	= require('when'),
	http 		= require('http')

var deferred = when.defer();

var dpdukSetting = {
	baseURL : 'www.dpd.co.uk',
	sessionPath : '/esgServer/shipping/shipment/_/parcel/?filter=id&searchCriteria=deliveryReference={0}',
	detailPath 	: '/esgServer/shipping/delivery/?parcelCode={0}'
}
function dpdukAPI() {}

dpdukAPI.prototype.getRequest = function(tracking_number){

	dpdukSetting.tracking_number = tracking_number;

	var requestOptions = {};
	requestOptions.method  = 'GET';
	requestOptions.host = dpdukSetting.baseURL;
	requestOptions.path = toolbelt.stringFormat(dpdukSetting.sessionPath, [tracking_number]);

	http.request(requestOptions, sessionResponseHandler).end();

	return deferred.promise;
}

// Response Action Handler
//===========================
function sessionResponseHandler(res){
	res.on('data', resDataPiper);
	res.on('end', resSessionFinalizer);
}

function resDataPiper(chunk){
	this.buffer = this.buffer || '';
	this.buffer += chunk;
}

function resSessionFinalizer(){
	try {
		var result = JSON.parse(this.buffer);
		this.buffer = '';

		if(!result.obj) throw "search fail.";
		if(!result.obj.parcel || result.obj.parcel.length == 0) throw "no parcel has been found";
		var obj = result.obj;
		var parcel = obj.parcel[0];
		var parcelCode = parcel.parcelCode;
		var path = toolbelt.stringFormat(dpdukSetting.detailPath, [parcelCode]);

		var headers = {}
		headers.Accept = 'application/json, text/javascript';
		headers.Cookie = 'tracking=' + obj.searchSession;

		var requestOptions = {};
		requestOptions.method  = 'GET';
		requestOptions.host = dpdukSetting.baseURL;
		requestOptions.path = path;
		requestOptions.headers = headers;

		http.request(requestOptions, responseHandler).end();
	}
	catch(err) {
		//	send ticket, or support mail..
		//	also log and return error to customers
		deferred.reject(err);
	}
}

// Response Action Handler
//===========================
function responseHandler(res){
	res.on('data', resDataPiper);
	res.on('end', resFinalizer);
}

function resFinalizer(){
	var tracking_result = {checkpoints : []};

	try {
		var result = JSON.parse(this.buffer);
		this.buffer = '';

		if(!result.obj || !result.obj.trackingEvent) throw "no tracking event has been found.";

		var trackingEvents = result.obj.trackingEvent;
		
		//use i-- to avoid running trackingEvents.length in every iteration
		for (var i = trackingEvents.length-1; i > -1; i--) {
			var trackingEvent = trackingEvents[i];
			
			var checkpoint = {};
			checkpoint.country_name = trackingEvent.trackingEventLocation;
			checkpoint.message = trackingEvent.trackingEventStatus;

			var date = trackingEvent.trackingEventDate.match("([^.]*)")
			checkpoint.checkpoint_time = date[0];

			tracking_result.checkpoints.push(checkpoint);
		}

		deferred.resolve(tracking_result);
	}
	catch(err) {
		//	send ticket, or support mail..
		//	also log and return error to customers
		deferred.reject(err);
	}
}


module.exports = new dpdukAPI;
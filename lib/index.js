(function() {
	function Courier() {
		this.usps = function(tracking_number) {
			var tracking_result = {}; // save your result to this object

			// do your job here
			return tracking_result;

		};

		this.hkpost = function(tracking_number) {
			var tracking_result = {}; // save your result to this object

			// do your job here
			return tracking_result;

		};

		/**
		 * @ Quick note:
		 * dpduk - no api, but webservice has been provided, 
		 **/

		this.dpduk = function(tracking_number) {
			var tracking_result = {}; // save your result to this object

			//================= FINDINGS =====================
			//
			// Site built with Backbone... just look at the controller for answer...
			//
			// http://www.dpd.co.uk/apps/tracking/scripts/controllers/SearchResultsController.js
			// http://www.dpd.co.uk/apps/tracking/scripts/collections/SearchResults.js
			// 	
			// 2 request total, first one return a collection (with paging), 
			// second one retrun the json for rendering view.
			//
			//=================================================

			// var options = {
			// 	method:'GET', 
			// 	host: 'www.dpd.co.uk',
			// 	path: '/esgServer/shipping/shipment/_/parcel/?filter=id&searchCriteria='
			//		   encodeURIComponent( "deliveryReference=" + this.meta.deliveryReference + "&postcode=" + this.meta.postcode )
			// };

			//grab header here...

			options = {
				method:'GET', 
				header: {''}
				host: 'www.dpd.co.uk',
				path: '/esgServer/shipping/delivery/?parcelCode=&geoSession='
			};

			// do your job here
			return tracking_result;

		};
	}

	module.exports = new Courier();
}());


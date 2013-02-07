'use strict';
(function() {
	var _eventObject = {};
	var pubsub = {
		/**
		 * Publish event
		 * @param ns_string string namespace string splited by dots
		 * @param args array of arguments given to callbacks
		 * @param recurrent bool should execution be bubbled throught namespace
		 * @param depth integer how many namespaces separated by dots will be executed
		 */
		publish : function(ns_string, args, recurrent, depth) {
			var ns_string = (typeof ns_string === 'string') ? ns_string : (console.error('ns_string must be string type'), 'randomString'),
				parts = ns_string.split('.'),
				recurrent = recurrent || false, // bubbles event throught namespace if true
				nsObject, //Namespace object to which we attach event
				args = (args) ? args : [],
				i;
			
			function executeCallback(subscribtions) {
				var i = 0,
					subscribton = null;

				for(i = 0; i < subscribtions.length; i++) {
					subscribton = subscribtions[i]
					if(typeof subscribton === 'object' && subscribton != null) {		
						subscribton.callback.apply(subscribton.object, args);
					}
				}
			}
			
			nsObject = _eventObject;
			for (i = 0; i < parts.length; i += 1) {
				if (typeof nsObject[parts[i]] === "undefined") {
					console.warn('There is no ' + ns_string + ' subscription');
					return null;
				}
				nsObject = nsObject[parts[i]];
				if(recurrent === true && typeof depth !== 'number') { //depth is not defined
					executeCallback(nsObject['_events']);
				} else if(recurrent === true && typeof depth === 'number' && i >= parts.length - depth) { //if depth is defined
					executeCallback(nsObject['_events']);
				}
			}
			
			if(recurrent === false) {
				executeCallback(nsObject['_events']);
			}
		},
		/**
		 * Subscribe event
		 * @param ns_string string namespace string splited by dots
		 * @param callback function function executed after publishing event
		 * @param givenObject object/nothing Optional object which will be used as "this" in callback
		 */
		subscribe : function(ns_string, callback, givenObject) {
			var ns_string = (typeof ns_string === 'string') ? ns_string : (console.error('ns_string must be string type'), 'randomString'),
				parts = ns_string.split('.'),
				nsObject, //Namespace object to which we attach event
				givenObjectSet = (givenObject) ? true : false,
				givenObject = (givenObjectSet) ? givenObject : callback,
				eventObject = null,
				i = 0,
				k = 0,
				subscribeArguments = arguments;
			
			//Iterating through _eventObject to find proper nsObject
			nsObject = _eventObject;
			for (i = 0; i < parts.length; i += 1) {
				if (typeof nsObject[parts[i]] === "undefined") {
					nsObject[parts[i]] = {};
					nsObject[parts[i]]['_events'] = [];
				}
				nsObject = nsObject[parts[i]];
			}
			
			eventObject = {
				callback	: callback,
				object		: givenObject // "this" parameter in executed function
			};
			
			nsObject['_events'].push(eventObject);
			return [parts.join('.'), eventObject];
		},
		unsubscribe : function(subscribeObject) {
			var ns_string = subscribeObject[0],
				parts = ns_string.split('.'),
				eventObject = subscribeObject[1],
				nsObject;
			
			//Iterating through _eventObject to find proper nsObject
			nsObject = _eventObject;
			for (i = 0; i < parts.length; i += 1) {
				if (typeof nsObject[parts[i]] === "undefined") {
					console.error('There is no ' + ns_string + ' subscription');
					return null;
				}
				nsObject = nsObject[parts[i]];
			}
			
			nsObject && $.each(nsObject['_events'], function(functionId){
				if(this == eventObject) {
					nsObject['_events'].splice(functionId, 1);
				}
			});
		}
	};

	if(module.exports) {
		module.exports = pubsub;
	} else {
		window.pubsub = pubsub;
	}
})();
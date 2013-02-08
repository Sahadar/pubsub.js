'use strict';
(function() {
	var _eventObject = {};
	var _options = {
		separator : '/',
		recurrent : false,
		log       : false
	}

	function generateId() {
		var id = Math.random()*1000000000000;
		return parseInt(id, 10);
	}

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
				parts = ns_string.split(_options.separator),
				recurrent = recurrent || _options.recurrent, // bubbles event throught namespace if true
				nsObject, //Namespace object to which we attach event
				args = (args) ? args : [],
				i;
			
			function executeCallback(subscribtions) {
				var i = 0,
					subscribtion = null;

				for(subscribtion in subscribtions) {
					if(typeof subscribtions[subscribtion] === 'object' && subscribtions[subscribtion] != null && subscribtions.hasOwnProperty(subscribtion)) {
						subscribtion = subscribtions[subscribtion];	
						subscribtion.callback.apply(subscribtion.object, args);
					}
				}
			}
			
			nsObject = _eventObject;
			for (i = 0; i < parts.length; i += 1) {
				if (typeof nsObject[parts[i]] === "undefined") {
					if(_options.log) {
						console.warn('There is no ' + ns_string + ' subscription');
					}
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
				parts = ns_string.split(_options.separator),
				nsObject, //Namespace object to which we attach event
				givenObjectSet = (givenObject) ? true : false,
				givenObject = (givenObjectSet) ? givenObject : callback,
				eventObject = null,
				i = 0,
				k = 0,
				subscribtionId = null;
			
			//Iterating through _eventObject to find proper nsObject
			nsObject = _eventObject;
			for (i = 0; i < parts.length; i += 1) {
				if (typeof nsObject[parts[i]] === "undefined") {
					nsObject[parts[i]] = {};
					nsObject[parts[i]]['_events'] = {};
				}
				nsObject = nsObject[parts[i]];
			}
			
			do {
				subscribtionId = generateId();
			} while(typeof nsObject['_events'][subscribtionId] === 'object');
			
			eventObject = {
				eventId		: subscribtionId,
				callback	: callback,
				object		: givenObject // "this" parameter in executed function
			};

			nsObject['_events'][subscribtionId] = eventObject;
			return [parts.join(_options.separator), eventObject];
		},
		unsubscribe : function(subscribeObject) {
			var ns_string = subscribeObject[0],
				parts = ns_string.split(_options.separator),
				eventObject = subscribeObject[1],
				nsObject,
				i = 0;
			
			//Iterating through _eventObject to find proper nsObject
			nsObject = _eventObject;
			for (i = 0; i < parts.length; i += 1) {
				if (typeof nsObject[parts[i]] === "undefined") {
					if(_options.log) {
						console.error('There is no ' + ns_string + ' subscription');
					}
					return null;
				}
				nsObject = nsObject[parts[i]];
			}
			
			if(nsObject['_events'][eventObject['eventId']]) {
				delete nsObject['_events'][eventObject['eventId']];
			} else if(_options.log) {
				console.info('There is no such subscribtion: ', subscribeObject);
			}
		}
	};

	if(typeof module === 'object' && module.exports) {
		module.exports = pubsub;
	} else {
		window.pubsub = pubsub;
	}
})();
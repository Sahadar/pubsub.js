'use strict';
(function() {
	var _eventObject = {};

	function forEach(dataArray, callback) {
		var i = 0,
			arrayLength = dataArray.length;

		for(i = 0; i < arrayLength; i++) {
			callback(i);
		}
	}

	function executeCallback(subscribtions, args) {
		forEach(subscribtions, function(subscribtionId) {
			var subscribtion = null;
			if(typeof subscribtions[subscribtionId] === 'object' && subscribtions.hasOwnProperty(subscribtionId)) {
				subscribtion = subscribtions[subscribtionId];	
				subscribtion.callback.apply(subscribtion.object, args);
			}
		});
	}

	function executeWildcard(nsObject, args) {
		var nsElement;
		for(nsElement in nsObject) {
			if(nsElement !== '_events' && nsObject.hasOwnProperty(nsElement)) {
				executeCallback(nsObject[nsElement]['_events'], args);
			}
		}
	}

	var pubsub = {
		options : {
			separator : '/',
			recurrent : false,
			log       : false
		},
		/**
		 * Publish event
		 * @param ns_string string namespace string splited by dots
		 * @param args array of arguments given to callbacks
		 * @param recurrent bool should execution be bubbled throught namespace
		 * @param depth integer how many namespaces separated by dots will be executed
		 */
		publish : function(ns_string, args, recurrent, depth) {
			var that = this,
				parts = ns_string.split(that.options.separator),
				recurrent = recurrent || that.options.recurrent, // bubbles event throught namespace if true
				nsObject, //Namespace object to which we attach event
				args = (args) ? args : [],
				partsLength = parts.length,
				i;

			nsObject = _eventObject;
			for (i = 0; i < partsLength; i++) {
				if(parts[i] === '*') {
					executeWildcard(nsObject, args);
					return null;
				} else if (typeof nsObject[parts[i]] === "undefined") {
					if(that.options.log) {
						console.warn('There is no ' + ns_string + ' subscription');
					}
					return null;
				}
				nsObject = nsObject[parts[i]];
				
				if(recurrent === true && typeof depth !== 'number') { //depth is not defined
					executeCallback(nsObject['_events'], args);
				} else if(recurrent === true && typeof depth === 'number' && i >= partsLength - depth) { //if depth is defined
					executeCallback(nsObject['_events'], args);
				}
			}
			
			if(recurrent === false) {
				executeCallback(nsObject['_events'], args);
			}
		},
		/**
		 * Subscribe event
		 * @param ns_string string namespace string splited by dots
		 * @param callback function function executed after publishing event
		 * @param givenObject object/nothing Optional object which will be used as "this" in callback
		 */
		subscribe : function(ns_string, callback, givenObject) {
			var that = this,
				parts = ns_string.split(that.options.separator),
				nsObject, //Namespace object to which we attach event
				givenObjectSet = (givenObject) ? true : false,
				givenObject = (givenObjectSet) ? givenObject : callback,
				eventObject = null,
				i = 0;
			
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
			return [parts.join(that.options.separator), eventObject];
		},
		unsubscribe : function(subscribeObject) {
			var that = this,
				ns_string = subscribeObject[0],
				eventObject = subscribeObject[1],
				parts = ns_string.split(that.options.separator),
				nsObject,
				i = 0;
			
			//Iterating through _eventObject to find proper nsObject
			nsObject = _eventObject;
			for (i = 0; i < parts.length; i += 1) {
				if (typeof nsObject[parts[i]] === "undefined") {
					if(that.options.log) {
						console.error('There is no ' + ns_string + ' subscription');
					}
					return null;
				}
				nsObject = nsObject[parts[i]];
			}
			
			forEach(nsObject['_events'], function(eventId){
		        if(nsObject['_events'][eventId] === eventObject) {
		        	nsObject['_events'].splice(eventId, 1);
		        }
		    });
		}
	};

	//if sbd's using requirejs library to load pubsub.js
	if(typeof define === 'function') {
		define(pubsub);
	}

	if(typeof module === 'object' && module.exports) {
		module.exports = pubsub;
	} else {
		window.pubsub = pubsub;
	}
})();
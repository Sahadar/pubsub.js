(function(scope) {
	'use strict';
	var pubsubInstance = null;
	var pubsubConfig = null;

	if(typeof pubsub === 'object') {
		pubsubConfig = pubsub;
	//node.js config from global
	} else if(typeof global === 'object' && typeof global.pubsubConfig === 'object') {
		pubsubConfig = global.pubsubConfig;
	}

	function Pubsub(config) {
		var _eventObject = {};
		var options = {
			separator : (config && config.separator) ?  config.separator : '/',
			recurrent : (config && typeof config.recurrent === 'boolean') ?  config.recurrent :  (false),
			async     : (config && typeof config.async === 'boolean') ?  config.async :  (false),
			log       : (config && config.log) ?  config.log :  (false)
		};

		function forEach(dataArray, callback) {
			var i = 0,
				arrayLength = dataArray.length;

			for(i = 0; i < arrayLength; i++) {
				callback(i);
			}
		}

		function executeCallback(subscriptions, args, async) {
			async = (typeof async === 'boolean') ?  async : options.async;

			//clone array - callbacks can unsubscribe other subscriptions
			var executedSubscriptions = subscriptions.slice();

			forEach(executedSubscriptions, function(subscribtionId) {
				var subscribtion = null;

				if(typeof executedSubscriptions[subscribtionId] === 'object' && executedSubscriptions.hasOwnProperty(subscribtionId)) {
					subscribtion = executedSubscriptions[subscribtionId];
					if(async) {
						setTimeout(function() {
							subscribtion.callback.apply(subscribtion.object, args);
						}, 4);
					} else {
						subscribtion.callback.apply(subscribtion.object, args);
					}
				}
			});
		}

		function executeWildcard(nsObject, args) {
			var nsElement;
			for(nsElement in nsObject) {
				if(nsElement !== '_events' && nsObject.hasOwnProperty(nsElement)) {
					executeCallback(nsObject[nsElement]._events, args);
				}
			}
		}

		function subscribe(nsString, callback, contextObject) {
			var parts = nsString.split(options.separator),
				nsObject, //Namespace object to which we attach event
				givenObjectSet = (contextObject) ? true : false,
				eventObject = null,
				i = 0;

			contextObject = (givenObjectSet) ? contextObject : callback;

			//Iterating through _eventObject to find proper nsObject
			nsObject = _eventObject;
			for (i = 0; i < parts.length; i += 1) {
				if (typeof nsObject[parts[i]] === "undefined") {
					nsObject[parts[i]] = {};
					nsObject[parts[i]]._events = [];
				}
				nsObject = nsObject[parts[i]];
			}

			eventObject = {
				callback	: callback,
				object  	: contextObject // "this" parameter in executed function
			};

			nsObject._events.push(eventObject);
			return {namespace : parts.join(options.separator),
				event : eventObject };
		}

		function unsubscribe (subscribeObject) {
			if(subscribeObject === null || typeof subscribeObject === 'undefined') {
				return null;
			}
			var nsString = subscribeObject.namespace,
				eventObject = subscribeObject.event,
				parts = nsString.split(options.separator),
				nsObject,
				i = 0;

			//Iterating through _eventObject to find proper nsObject
			nsObject = _eventObject;
			for (i = 0; i < parts.length; i += 1) {
				if (typeof nsObject[parts[i]] === "undefined") {
					if(options.log) {
						console.error('There is no ' + nsString + ' subscription');
					}
					return null;
				}
				nsObject = nsObject[parts[i]];
			}

			forEach(nsObject._events, function(eventId){
				if(nsObject._events[eventId] === eventObject) {
					nsObject._events.splice(eventId, 1);
				}
			});
		}

		return {
			/**
			 * Publish event
			 * @param nsString string namespace string splited by dots
			 * @param args array of arguments given to callbacks
			 * @param params paramaters possible:
			 *        @param recurrent bool should execution be bubbled throught namespace
			 *        @param depth integer how many namespaces separated by dots will be executed
			 */
			publish : function(nsString, args, params) {
				var that = this,
					parts = nsString.split(options.separator),
					recurrent = (typeof params === 'object' && params.recurrent) ? params.recurrent : options.recurrent, // bubbles event throught namespace if true
					depth = (typeof params === 'object' && params.depth) ? params.depth : null,
					async = (typeof params === 'object' && params.async) ? params.async : options.async,
					nsObject, //Namespace object to which we attach event
					partsLength = parts.length,
					iPart = null,
					i;

				args = (args) ? args : [],

				nsObject = _eventObject;
				for (i = 0; i < partsLength; i++) {
					iPart = parts[i];
					if(iPart === '*') {
						executeWildcard(nsObject, args, async);
						return null;
					} else if (typeof nsObject[iPart] === "undefined") {
						if(options.log) {
							console.warn('There is no ' + nsString + ' subscription');
						}
						return null;
					}
					nsObject = nsObject[iPart];

					if(recurrent === true && typeof depth !== 'number') { //depth is not defined
						executeCallback(nsObject._events, args, async);
					} else if(recurrent === true && typeof depth === 'number' && i >= partsLength - depth) { //if depth is defined
						executeCallback(nsObject._events, args, async);
					}
				}

				if(recurrent === false) {
					executeCallback(nsObject._events, args, async);
				}
			},
			/**
			 * Subscribe event
			 * @param nsString string namespace string splited by dots
			 * @param callback function function executed after publishing event
			 * @param params given params
			 *		@param context object/nothing Optional object which will be used as "this" in callback
			 */
			subscribe : function(nsString, callback, params) {
				var that = this,
					context = (params && typeof params.context !== 'undefined') ? params.context : null,
					subscriptions = [];

				//if we have array of callbacks - multiple subscribtion
				if(typeof callback === 'object' && callback instanceof Array) {
					forEach(callback, function(number) {
						var oneCallback = callback[number];

						subscriptions =	subscriptions.concat(that.subscribe.apply(that, [nsString, oneCallback, context]));
					});
				} else if(typeof nsString === 'object' && nsString instanceof Array) {
					forEach(nsString, function(number) {
						var namespace = nsString[number];

						subscriptions =	subscriptions.concat(that.subscribe.apply(that, [namespace, callback, context]));
					});
				} else {
					return subscribe.apply(that, arguments);
				}
				return subscriptions;
			},
			/**
			 * subscribeOnce event - subscribe once to some event, then unsubscribe immadiately
			 * @param nsString string namespace string splited by dots
			 * @param callback function function executed after publishing event
			 * @param params given params
			 *		@param context object/nothing Optional object which will be used as "this" in callback
			 */
			subscribeOnce : function(nsString, callback, params) {
				var that = this,
					context = (params && typeof params.context !== 'undefined') ? params.context : null,
					subscribtion = null;

				var subscribtionCallback = function() {
						callback.apply(this, arguments);
						that.unsubscribe(subscribtion);
					};

				subscribtion = that.subscribe.apply(that, [nsString, subscribtionCallback, context]);
				return subscribtion;
			},
			/**
			 * Unsubscribe from given subscribtion
			 * @param subscribeObject subscribtion object given on subscribe (returned from subscribtion)
			 */
			unsubscribe : function(subscribeObject) {
				var that = this;

				//if we have array of callbacks - multiple subscribtion
				if(subscribeObject instanceof Array) {
					forEach(subscribeObject, function(number) {
						var oneSubscribtion = subscribeObject[number];

						unsubscribe.apply(that, [oneSubscribtion]);
					});
				} else {
					unsubscribe.apply(that, arguments);
				}
			},
			/**
			 * newInstance - makes new instance of pubsub object with its own config
			 * @param config instance configuration
			 *        @param separator separator (default is "/")
			 *        @param recurrent should publish events be bubbled through namespace
			 *        @param async should publish events be asynchronous - not blocking function execution
			 *        @param log console.warn/error every problem
			 */
			newInstance : function(config) {
				return new Pubsub(config);
			}
		}; //return block
	}
	pubsubInstance = new Pubsub(pubsubConfig);

	//if sbd's using requirejs library to load pubsub.js
	if(typeof define === 'function') {
		define(pubsubInstance);
	}

	//node.js
	if(typeof module === 'object' && module.exports) {
		module.exports = pubsubInstance;
	}

	if(typeof window === 'object') {
		window.pubsub = pubsubInstance;	
		if(window !== scope) {
			scope.pubsub = pubsubInstance;
		}
	}
})(this);

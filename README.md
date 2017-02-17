pubsub.js
=========

Dependency free JavaScript pubsub implementation with wildcards, inheritance and multisubscriptions.

Working smoothly both on frontend and backend side.

Read documentation, check tests file, be inspired and feel free to use it and/or contribute.

[![Build Status](https://travis-ci.org/Sahadar/pubsub.js.svg?branch=master)](https://travis-ci.org/Sahadar/pubsub.js)
[![Dependency Status](https://david-dm.org/Sahadar/pubsub.js.svg)](https://david-dm.org/Sahadar/pubsub.js)
[![License](https://img.shields.io/npm/l/pubsub.js.svg)](http://opensource.org/licenses/MIT)

[Web page](https://sahadar.github.io/pubsub/)

[NPM pubsub.js link](https://npmjs.org/package/pubsub.js)

## Features

* Currently it is the most advanced dependency-free pub/sub library on npm
* Very fast
* Easy to understand
* Dependency free = using native JavaScript code
* Configurable [link](#change_config)
* Works on server and browser side smoothly [link](#change_config)
* Event inheritance [link](#event_inheritance)
* Wildcards [publish wildcard](#publish_wildcard) [subscribe wildcard](#subscribe_wildcard)
* subscribeOnce method [link](#subscribeOnce)
* Multiple subscriptions [link](#multiple_subscriptions)
* Possibility to make new instances of pubsub with private namespaces scope [link](#new_instance)
* Possibility to publish async events [link](#async_events)
* Possibility to define context for all callbacks by providing pubsub|newInstance "context" param [link](#new_instance_context)
* Possibility to define context for each callback [link](#subscribe_context)
* Controll under event bubbling depth
* Works with *require.js* library
* Written with TDD
* Compiled + gzipped weighs only 1kB, less than 320 lines of code
* Works also on IE 6+

## Installation
* download from Github
* npm: `npm install pubsub.js`
* bower: `bower install pubsub-advanced`

Default pubsub.js configuration:
```javascript
	separator : '/' // defined namespace separator
	context         // has dynamic value - when not defined it will be always reference to used callback in subscribe method
	recurrent : false // defines inheritance of publish event
	async 	  : false // if true - publish events will be asynchronous
	log       : false // set to true will log unsubscribed namespaces to which You publish event
```

**Using pubsub inside node.js**
```javascript
	var pubsub = require('pubsub.js');

	pubsub.subscribe('hello/world', function(text) {
		console.log(text);
	});
	pubsub.publish('hello/world', ['my text']);
```

## Examples

### Basic example

```javascript
	//subscribe to 'hello/world' namespace
	pubsub.subscribe('hello/world', function() {
		console.log('hello world!');
	});
	//publish event on 'hello/world' namespace
	pubsub.publish('hello/world');
	//prints "hello world" inside console
```

### Publish with param

```javascript
	//subscribe to 'hello/world' namespace
	pubsub.subscribe('hello/world', function(data) {
		console.log(data);
	});
	//publish event on 'hello/world' namespace
	pubsub.publish('hello/world', ['hello!']); // second parameter is an array of arguments
	//prints "hello!" inside console
```

### Unsubscribe

```javascript
	//subscribe to 'hello/world' namespace
	var subscription = pubsub.subscribe('hello/world', function() {
		console.log('hello world!');
	});
	//publish event on 'hello/world' namespace
	pubsub.publish('hello/world');
	//prints "hello world" inside console

	//unsubscribe
	pubsub.unsubscribe(subscription);
	//publish event on 'hello/world' namespace
	pubsub.publish('hello/world');
	//nothing happen - we've previously unsubscribed that subscription
```

### Changing default configuration <a name="change_config"></a>

***Browser***

**Before pubsub script loader** - make global variable named "pubsub" with your default configuration
```javascript
	pubsub = {
		separator : '.'
		context : referenceToContext
	}
```
**After pubsub load - use it with your configuration, pubsub.js will replace that previous "pubsub" global variable with its own instance**
```javascript
	//subscribe to 'hello.world' namespace
	var subscription = pubsub.subscribe('hello.world', function() {
		console.log('hello world!');
	});
	//publish event on 'hello.world' namespace
	pubsub.publish('hello.world');
	//prints "hello world" inside console

	//unsubscribe
	pubsub.unsubscribe(subscription);
	//publish event on 'hello.world' namespace
	pubsub.publish('hello.world');
	//nothing happen - we've previously unsubscribed that subscription
```

***Node.js***

**Before pubsub require execution** - set global.pubsubConfig variable
```javascript
	global.pubsubConfig = {
		separator : '.'
	}
```
**After pubsub load, it'll have your configuration as in browser example**


### Event inheritance <a name="event_inheritance"></a>

```javascript
	//subscribe to 'hello' namespace
	var subscription = pubsub.subscribe('hello', function() {
		console.log('hello world!');
	});
	//publish event on 'hello/world' namespace
	pubsub.publish('hello/world', [], {
		recurrent : true
	});
	//prints "hello world" inside console
	//first event goes to "hello" namespace
	//then it tries to execute on "hello/world" but nothing is listening on it
```

### Method: subscribeOnce <a name="subscribeOnce"></a>

```javascript
	var iterator = 0;
	var data = null;

	pubsub.subscribeOnce('hello/world', function(param) {
		data = param;
		iterator++;
	});
	pubsub.publish('hello/world', ['hello']);
	pubsub.publish('hello/world', ['world']);
	console.log(iterator); //1
	console.log(data); //'hello'
```

### Publish wildcard "*" <a name="publish_wildcard"></a>

```javascript
	var number = 0;

	//subscribe to "hello/world" namespace
	pubsub.subscribe('hello/world', function() {
		number++;
	});
	//subscribe to "hello/earth" namespace
	pubsub.subscribe('hello/earth', function() {
		number++;
	});
	//subscribe to "hello/galaxy" namespace
	pubsub.subscribe('hello/galaxy', function() {
		number++;
	});
	//subscribe to "hello/world/inner" namespace
	pubsub.subscribe('hello/world/inner', function() {
		number++;
	});

	pubsub.publish('hello/*');
	//hello/* executes:
	//	hello/world, hello/earth, hello/galaxy
	//	namespace, hello/world/inner is not executed
	//
	//	"*" goes only one namespace deeper
	console.log(number); //3
```

### Subscribe wildcard "*" <a name="subscribe_wildcard"></a>

```javascript
	var number = 0;

	var subscription = pubsub.subscribe('hello/*/world', function() {
		number += 1;
	});

	pubsub.publish('hello'); // won't handle
	pubsub.publish('hello/my'); // won't handle
	pubsub.publish('hello/great/galaxy'); // won't handle

	pubsub.publish('hello/my/world'); // handles
	pubsub.publish('hello/huge/world'); // handles
	pubsub.publish('hello/great/world'); // handles

	console.log(number); // 3
```

### Multiple subscriptions <a name="multiple_subscriptions"></a>

**many namespaces, one callback**
```javascript
	var number = 0;

	var subscription = pubsub.subscribe(['hello/world', 'goodbye/world'], function() {
		number++;
	});

	pubsub.publish('hello/world');
	console.log(number); //1
	pubsub.publish('goodbye/world');
	console.log(number); //2
	pubsub.unsubscribe(subscription);

	pubsub.publish('hello/world');
	console.log(number); //2
	pubsub.publish('goodbye/world');
	console.log(number); //2
```

**one namespace, many callbacks**
```javascript
	var number1 = 0;
	var number2 = 0;

	var subscription = pubsub.subscribe('hello/world', [function() {
		number1++;
	}, function() {
		number2 += 2;
	}]);

	pubsub.publish('hello/world');
	console.log(number1 + ',' + number2); //1,2
	pubsub.unsubscribe(subscription);

	pubsub.publish('hello/world');
	console.log(number1 + ',' + number2); //2,4
```

**many namespaces, many callbacks**
```javascript
	var number1 = 0;
	var number2 = 0;

	var subscription = pubsub.subscribe(['hello/world', 'goodbye/world'], [function() {
		number1++;
	}, function() {
		number2 += 2;
	}]);

	pubsub.publish('hello/world');
	console.log(number1 + ',' + number2); //1,2
	pubsub.publish('goodbye/world');
	console.log(number1 + ',' + number2); //2,4
	pubsub.unsubscribe(subscription);

	pubsub.publish('hello/world');
	console.log(number1 + ',' + number2); //2,4
	pubsub.publish('goodbye/world');
	console.log(number1 + ',' + number2); //2,4
```

###making new instances with own namespaces scope <a name="new_instance"></a>
```javascript
	var number1 = 0;
	var number2 = 0;

	var privatePubsub = pubsub.newInstance();

	pubsub.subscribe('hello/world', function() {
		number1++;
	});

	privatePubsub.subscribe('hello/world', function() {
		number2++;
	});

	pubsub.publish('hello/world');
	console.log(number1 + ',' + number2); //1,0

	privatePubsub.publish('hello/world');
	console.log(number1 + ',' + number2); //1,1
```

**making new instances with own context <a name="new_instance_context"></a>**
```javascript
	var contextArgument = ["object"];
	var privatePubsub = pubsub.newInstance({
		context : contextArgument
	});

	privatePubsub.subscribe('hello/context', function() {
		var that = this;

		console.log(that === contextArgument); //true
	});
	privatePubsub.publish('hello/context');
```

###Using pubsub asynchronously <a name="async_events"></a>
```javascript
	var number1 = 0;

	var asyncPubsub = pubsub.newInstance({
		async : true
	});

	asyncPubsub.subscribeOnce('hello/world', function() {
		number1++;
		console.log(number1); //2
	});

	asyncPubsub.publish('hello/world'); // asynchronous call to 'hello/world'

	number1++;
	console.log(number1); //1
```

###Using context param in subscribe method <a name="subscribe_context"></a>
```javascript
	var contextArgument = ["object"];
	var privatePubsub = pubsub.newInstance();

	function callbackFirst() {
		var that = this;

		console.log(that === callbackFirst); // true
	}
	function callbackSecond() {
		var that = this;

		console.log(that === contextArgument); // true
	}

	var privateSubscribtion1 = privatePubsub.subscribe('hello/context', callbackFirst);
	var privateSubscribtion2 = privatePubsub.subscribe('hello/that', callbackSecond, {
		context : contextArgument
	});
```

## Changelog
* v1.5.2
	* Fixed IE11 cross frames communication (isArray)
* v1.5.1
	* Fix "context" option for subscribeOnce
	* .eslintrc style guide added + code stylistic fixes
* v1.5.0
	* Fix issue #8 - "context" option, new test cases
* v1.4.3
	* Fix issue #7 - "recurrent" option, new test cases
* v1.4.2
	* Documentation changes
* v1.4.1
	* Travis integration
* v1.4.0
	* Added subscription wildcard "*"
* v1.3.1
	* Fixed problem with "window reference error" in node.js environment
* v1.3.0
	* Changed the way of using context parameter in subscribe method - API changes to subscribe method!
* v1.2.0
	* Changed the way of using event inheritance - API changes to publish method!
	* Added possibility to use "publish" asynchronously
* v1.1.0
	* reworked core
	* changed the way of setting own config
	* implemented "newInstance" method
* v1.0.6
	* Fixed bug with unsubscription - subscription during publish of the same namespace (test case 3)
* v1.0.5
	* Added multisubscription possibilities
* v1.0.4
	* Added subscribeOnce method
* v1.0.3
	* Changed scope binding in pubsub
* v1.0.2
	* Publish wildcard "*" added
* v1.0.1
	* Improved performance - about 350% on chrome, 20% on firefox
* v1.0.0
	* Every basic test passing

## License

MIT

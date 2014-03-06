pubsub.js
=========

JavaScript pubsub implementation with wildcards, inheritance and multisubscriptions

[NPM pubsub.js link](https://npmjs.org/package/pubsub.js)

[pubsub.js performance test](http://jsperf.com/pubsub-js-vs-jquery-events)

## Features

* Very fast
* Easy to understand
* Configurable
* Dependency free
* Using native JavaScript code
* Works on server and browser side smoothly
* Event inheritance
* Wildcards
* subscribeOnce method
* Multiple subscriptions
* Controll under event bubbling depth
* Works with require.js library
* Written with TDD
* Possibility to make new instances of pubsub with private namespaces scope
* Possibility to publish async events
* Compiled + gzipped weight only 1kB
* Works also on IE 6+

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

### Publish with parameter

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

### Changing default configuration

***Browser***

**Before pubsub script loader** - make global variable named "pubsub" with your default configuration
```javascript
	pubsub = {
		separator : '.'
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


### Event inheritance

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

### Method: subscribeOnce

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

### Wildcard "*" <-- one namespace deeper

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

### Multiple subscription

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

###making new instances with own namespaces scope
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

**Using pubsub asynchronously**
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

## Installation
Download from github or type `npm install pubsub.js`

Default pubsub.js configuration:
```javascript
	separator : '/' //defined namespace separator
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

## Changelog
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
	* Wildcard "*" added
* v1.0.1
	* Improved performance - about 350% on chrome, 20% on firefox
* v1.0.0
	* Every basic tests passing

## License

MIT

pubsub.js
=========

JavaScript pubsub implementation with wildcards, inheritance and multisubscribtions

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
* Multiple subscribtions
* Controll under event bubbling depth
* Works with require.js library
* Written with TDD
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
	var subscribtion = pubsub.subscribe('hello/world', function() {
		console.log('hello world!');
	});
	//publish event on 'hello/world' namespace
	pubsub.publish('hello/world');
	//prints "hello world" inside console

	//unsubscribe
	pubsub.unsubscribe(subscribtion);
	//publish event on 'hello/world' namespace
	pubsub.publish('hello/world');
	//nothing happen - we've previously unsubscribed that subscribtion
```

### Changing default configuration

```javascript
	pubsub.options.separator = '.';

	//subscribe to 'hello.world' namespace
	pubsub.subscribe('hello.world', function(data) { //event namespace separated by dots
		console.log(data);
	});
	//publish event on 'hello.world' namespace
	pubsub.publish('hello.world', ['hello!']); // second parameter is an array of arguments
	//prints "hello!" inside console
```

### Event inheritance

```javascript
	//subscribe to 'hello' namespace
	var subscribtion = pubsub.subscribe('hello', function() {
		console.log('hello world!');
	});
	//publish event on 'hello/world' namespace
	pubsub.publish('hello/world', true);
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

### Multiple subscribtion

**many namespaces, one callback**
```javascript
	var number = 0;

	var subscribtion = pubsub.subscribe(['hello/world', 'goodbye/world'], function() {
		number++;
	});

	pubsub.publish('hello/world');
	console.log(number); //1
	pubsub.publish('goodbye/world');
	console.log(number); //2
	pubsub.unsubscribe(subscribtion);

	pubsub.publish('hello/world');
	console.log(number); //2
	pubsub.publish('goodbye/world');
	console.log(number); //2
```

**one namespace, many callbacks**
```javascript
	var number1 = 0;
	var number2 = 0;

	var subscribtion = pubsub.subscribe('hello/world', [function() {
		number1++;
	}, function() {
		number2 += 2;
	}]);

	pubsub.publish('hello/world');
	console.log(number1 + ',' + number2); //1,2
	pubsub.unsubscribe(subscribtion);

	pubsub.publish('hello/world');
	console.log(number1 + ',' + number2); //2,4
```

**many namespaces, many callbacks**
```javascript
	var number1 = 0;
	var number2 = 0;

	var subscribtion = pubsub.subscribe(['hello/world', 'goodbye/world'], [function() {
		number1++;
	}, function() {
		number2 += 2;
	}]);

	pubsub.publish('hello/world');
	console.log(number1 + ',' + number2); //1,2
	pubsub.publish('goodbye/world');
	console.log(number1 + ',' + number2); //2,4
	pubsub.unsubscribe(subscribtion);

	pubsub.publish('hello/world');
	console.log(number1 + ',' + number2); //2,4
	pubsub.publish('goodbye/world');
	console.log(number1 + ',' + number2); //2,4
```

## Installation
Download from github or type `npm install pubsub.js`

Default pubsub.js configuration:
```javascript
	separator : '/' //defined namespace separator
	recurrent : false // defines inheritance of publish event
	log       : false // set to true will log unsubscribed namespaces to which You publish event
```

## Changelog
* v1.0.6
	* Fixed bug with unsubscribtion - nsubscribtion during publish of the same namespace (test case 3)
* v1.0.5
	* Added multisubscribtion possibilities
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

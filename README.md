pubsub.js
=========

Vanilla JS pubsub implementation

## Features

* Dependency free
* Using native JavaScript code
* Works on server and browser side smoothly
* Event inheritance
* Wildcards
* Controll under event bubbling depth
* Easy to understand
* Works with require.js library

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

### Event inheritance

```javascript
	//subscribe to 'hello' namespace
	var subscribtion = pubsub.subscribe('hello', function() {
		console.log('hello world!');
	});
	//publish event on 'hello/world' namespace
	pubsub.publish('hello/world', true);
	//prints "hello world" inside console
	//first event goes to "hello" namespace, then it tries to execute on "hello/world" but nothing is listening on it
```

## Changelog
* v1.0.1
	* Improved performance - about 350% on chrome, 20% on firefox
* v1.0.0
	* Every basic tests passing
	
## License

MIT
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

## Changelog
* v1.0.0
	* Every basic tests passing
	
## License

MIT
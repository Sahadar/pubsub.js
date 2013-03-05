test("Presence test", function() {
	ok(typeof pubsub === 'object' && pubsub != null, "pubsub present");
	ok(typeof pubsub.publish === 'function', "pubsub has method publish");
	ok(typeof pubsub.subscribe === 'function', "pubsub has method subscribe");
	ok(typeof pubsub.subscribeOnce === 'function', "pubsub has method subscribeOnce");
	ok(typeof pubsub.unsubscribe === 'function', "pubsub has method unsubscribe");
});

test("Unsubscribe test (basic)", function() {
	var values = {};
	var param1 = "some param1";
	var param2 = "some param2";

	var subscribtion = pubsub.subscribe('hello/world4', function(param1, param2) {
		values = {
			'param1' : param1,
			'param2' : param2
		};
	});
	pubsub.publish('hello/world4', [param1, param2]);
	ok(values.param1 === param1 && values.param2 === param2, 'Values has proper value');
	pubsub.unsubscribe(subscribtion);
	pubsub.publish('hello/world4', [null, null]);
	ok(values.param1 === param1 && values.param2 === param2, 'Values has proper value');
});

test("Unsubscribe test (chained unsubscribe)", function() {
	var iterator = 0;

	var subscribtion1 = pubsub.subscribe('hello/world1', function() {
		iterator++;
		pubsub.unsubscribe(subscribtion1);
	});
	var subscribtion2 = pubsub.subscribe('hello/world1', function() {
		iterator++;
	});

	pubsub.publish('hello/world1');
	ok(iterator === 2, 'Second subscribtion executed properly');
	pubsub.unsubscribe(subscribtion2);
});

test("Publish test (basic)", function() {
	var done = false;
	var subscribtion = pubsub.subscribe('hello/world1', function() {
		done = true;
	});
	pubsub.publish('hello/world1');
	ok(done === true, 'Done has proper value');
	pubsub.unsubscribe(subscribtion);
});

test("Publish test (param)", function() {
	var done = false;
	var param = "some param";
	var subscribtion = pubsub.subscribe('hello/world2', function(param) {
		done = param;
	});
	pubsub.publish('hello/world2', [param]);
	ok(done === param, 'Done has proper value');
	pubsub.unsubscribe(subscribtion);
});

test("Method: subscribeOnce test (with param)", function() {
	var iterator = 0;
	var done = null;

	ok(typeof pubsub.subscribeOnce === 'function', 'Pubsub has method subscribeOnce');
	pubsub.subscribeOnce('hello/world', function(param) {
		done = param;
		iterator++;
	});
	pubsub.publish('hello/world', ['hello']);
	pubsub.publish('hello/world', ['world']);
	ok(done === 'hello', 'Done has proper value');
	ok(iterator === 1, 'Subscribtion executed only once');
});

test("Publish test (many params)", function() {
	var values = {};
	var param1 = "some param1";
	var param2 = "some param2";

	var subscribtion = pubsub.subscribe('hello/world3', function(param1, param2) {
		values = {
			'param1' : param1,
			'param2' : param2
		};
	});
	pubsub.publish('hello/world3', [param1, param2]);
	ok(values.param1 === param1 && values.param2 === param2, 'Values has proper values');
	pubsub.unsubscribe(subscribtion);
});

test("Inheritance test (basic)", function() {
	var values = {};
	var param1 = "some param1";
	var param2 = "some param2";

	var subscribtion = pubsub.subscribe('hello', function(param1, param2) {
		values = {
			'param1' : param1,
			'param2' : param2
		};
	});
	pubsub.publish('hello/world5', [param1, param2], true);
	ok(values.param1 === param1 && values.param2 === param2, 'Values has proper value');
	pubsub.unsubscribe(subscribtion);
});

test("Wildcards test (more advanced)", function() {
	var number = 0;

	var subscribtion1 = pubsub.subscribe('hello/world', function() {
		number++;
	});
	var subscribtion2 = pubsub.subscribe('hello/earth', function() {
		number++;
	});
	var subscribtion3 = pubsub.subscribe('hello/galaxy', function() {
		number++;
	});
	var subscribtion4 = pubsub.subscribe('hello/world/inner', function() {
		number++;
	});

	pubsub.publish('hello/*');

	ok(number === 3, 'Wildcard (*) is working properly');
	pubsub.unsubscribe(subscribtion1);
	pubsub.unsubscribe(subscribtion2);
	pubsub.unsubscribe(subscribtion3);
	pubsub.unsubscribe(subscribtion4);
});

test("Multiple subscribtion1 (one namespace, many callbacks)", function() {
	var number = 0;

	var subscribtion = pubsub.subscribe('hello/world', [
		function() {
			number++;
		},
		function() {
			number++;
		},
		function() {
			number++;
		}
	]);

	pubsub.publish('hello/world');
	ok(number === 3, 'Multiple subscribtion before unsubscribe is working properly');
	pubsub.unsubscribe(subscribtion);

	pubsub.publish('hello/world');
	ok(number === 3, 'Multiple subscribtion after unsubscribe is working properly');
});


test("Multiple subscribtion2 (many namespaces, one callback)", function() {
	var number = 0;

	var subscribtion = pubsub.subscribe(['hello/world', 'goodbye/world'], function() {
		number++;
	});

	pubsub.publish('hello/world');
	ok(number === 1, 'Subscribtion to hello/world before unsubscribe is working properly');
	pubsub.publish('goodbye/world');
	ok(number === 2, 'Subscribtion to goodbye/world before unsubscribe is working properly');
	pubsub.unsubscribe(subscribtion);

	pubsub.publish('hello/world');
	ok(number === 2, 'Subscribtion to hello/world after unsubscribe is working properly');
	pubsub.publish('goodbye/world');
	ok(number === 2, 'Subscribtion to goodbye/world after unsubscribe is working properly');
});

test("Multiple subscribtion3 (many namespaces, many callbacks)", function() {
	var number1 = 0;
	var number2 = 0;

	var subscribtion = pubsub.subscribe(['hello/world', 'goodbye/world'], [function() {
		number1++;
	}, function() {
		number2+=2;
	}]);

	pubsub.publish('hello/world');
	ok(number1 === 1, 'Subscribtion to hello/world before unsubscribe is working properly (number1)');
	ok(number2 === 2, 'Subscribtion to hello/world before unsubscribe is working properly (number2)');
	pubsub.publish('goodbye/world');
	ok(number1 === 2, 'Subscribtion to goodbye/world before unsubscribe is working properly (number1)');
	ok(number2 === 4, 'Subscribtion to goodbye/world before unsubscribe is working properly (number2)');
	pubsub.unsubscribe(subscribtion);

	pubsub.publish('hello/world');
	ok(number1 === 2, 'Subscribtion to hello/world after unsubscribe is working properly (number1)');
	ok(number2 === 4, 'Subscribtion to hello/world after unsubscribe is working properly (number2)');
	pubsub.publish('goodbye/world');
	ok(number1 === 2, 'Subscribtion to goodbye/world after unsubscribe is working properly (number1)');
	ok(number2 === 4, 'Subscribtion to goodbye/world after unsubscribe is working properly (number2)');
});

test("Pubsub newInstance with own namespaces scope", function() {
	ok(typeof pubsub.newInstance === 'function', "pubsub has method newInstance");
	var number1 = 0;
	var number2 = 0;

	var privatePubsub = pubsub.newInstance();
	
	var subscribtion = pubsub.subscribe('hello/world', function() {
		number1++;
	});
	var privateSubscribtion = privatePubsub.subscribe('hello/world', function() {
		number2++;
	});
	pubsub.publish('hello/world');
	ok(number1 === 1 && number2 === 0, "Global pubsub publish worked properly");
	privatePubsub.publish('hello/world');
	ok(number1 === 1 && number2 === 1, "Private pubsub publish worked properly");
	privatePubsub.unsubscribe(privateSubscribtion);
	privatePubsub.publish('hello/world');
	ok(number1 === 1 && number2 === 1, "Private unsubscribe worked properly");
	pubsub.unsubscribe(subscribtion);
	pubsub.publish('hello/world');
	ok(number1 === 1 && number2 === 1, "Public unsubscribe worked properly");
});

test("Switching config", function() {
	ok(typeof pubsub.newInstance === 'function', "pubsub has method newInstance");
	var number1 = 0;
	var number2 = 0;

	var privatePubsub = pubsub.newInstance({
		separator : '.'
	});
	
	var subscribtion = pubsub.subscribe('hello/world', function() {
		number1++;
	});
	var privateSubscribtion = privatePubsub.subscribe('hello.world', function() {
		number2++;
	});
	pubsub.publish('hello/world');
	ok(number1 === 1 && number2 === 0, "Global pubsub publish worked properly");
	privatePubsub.publish('hello.world');
	ok(number1 === 1 && number2 === 1, "Private pubsub publish worked properly");
	privatePubsub.unsubscribe(privateSubscribtion);
	privatePubsub.publish('hello.world');
	ok(number1 === 1 && number2 === 1, "Private unsubscribe worked properly");
	pubsub.unsubscribe(subscribtion);
	pubsub.publish('hello/world');
	ok(number1 === 1 && number2 === 1, "Public unsubscribe worked properly");
});
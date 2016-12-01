(function() {
	'use strict';
	test("Presence test", function() {
		ok(typeof pubsub === 'object' && pubsub !== null, "pubsub present");
		ok(typeof pubsub.publish === 'function', "pubsub has method publish");
		ok(typeof pubsub.subscribe === 'function', "pubsub has method subscribe");
		ok(typeof pubsub.subscribeOnce === 'function', "pubsub has method subscribeOnce");
		ok(typeof pubsub.unsubscribe === 'function', "pubsub has method unsubscribe");
	});

	test("Unsubscribe test (basic)", function() {
		var values = {};
		var param1 = "some param1";
		var param2 = "some param2";

		var subscription = pubsub.subscribe('hello/world4', function(param1, param2) {
			values = {
				param1 : param1,
				param2 : param2
			};
		});
		pubsub.publish('hello/world4', [param1, param2]);
		ok(values.param1 === param1 && values.param2 === param2, 'Values has proper value');
		pubsub.unsubscribe(subscription);
		pubsub.publish('hello/world4', [null, null]);
		ok(values.param1 === param1 && values.param2 === param2, 'Values has proper value');
	});

	test("Unsubscribe test (chained unsubscribe)", function() {
		var iterator = 0;

		var subscription1 = pubsub.subscribe('hello/world1', function() {
			iterator++;
			pubsub.unsubscribe(subscription1);
		});
		var subscription2 = pubsub.subscribe('hello/world1', function() {
			iterator++;
		});
		var subscription3 = pubsub.subscribe('hello/world2', function() {
			iterator++;
			pubsub.unsubscribe(subscription3);
		});

		pubsub.publish('hello/world1');
		ok(iterator === 2, 'Second subscription executed properly');
		pubsub.unsubscribe(subscription2);
	});

	test("Publish test (flat)", function() {
		var iterator = 0;
		var subscription = pubsub.subscribe('hello', function() {
			iterator += 1;
		});
		pubsub.publish('hello');
		pubsub.publish('world');
		ok(iterator === 1, 'Done has proper value');
		pubsub.unsubscribe(subscription);
		pubsub.publish('hello');
		ok(iterator === 1, 'Done has proper value');
	});

	test("Publish test (basic)", function() {
		var done = false;
		var subscription = pubsub.subscribe('hello/world1', function() {
			done = true;
		});
		pubsub.publish('hello/world1');
		ok(done === true, 'Done has proper value');
		pubsub.unsubscribe(subscription);
	});

	test("Publish test (param)", function() {
		var done = false;
		var param = "some param";
		var subscription = pubsub.subscribe('hello/world2', function(param) {
			done = param;
		});
		pubsub.publish('hello/world2', [param]);
		ok(done === param, 'Done has proper value');
		pubsub.unsubscribe(subscription);
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

		var subscription = pubsub.subscribe('hello/world3', function(param1, param2) {
			values = {
				param1 : param1,
				param2 : param2
			};
		});
		pubsub.publish('hello/world3', [param1, param2]);
		ok(values.param1 === param1 && values.param2 === param2, 'Values has proper values');
		pubsub.unsubscribe(subscription);
	});

	test("Inheritance test (basic)", function() {
		var values = {};
		var param1 = "some param1";
		var param2 = "some param2";

		var subscription = pubsub.subscribe('hello', function(param1, param2) {
			values = {
				param1 : param1,
				param2 : param2
			};
		});
		pubsub.publish('hello/world5', [param1, param2], {
			recurrent : true
		});
		ok(values.param1 === param1 && values.param2 === param2, 'Values has proper value');
		pubsub.unsubscribe(subscription);
	});

	test("Inheritance test (Issue #7)", function() {
		var instance = pubsub.newInstance({
			recurrent: true
		});
		var counter = 0;

		var subscription = instance.subscribe('hello', function() {
			counter += 1;
		});

		instance.publish('hello', []);

		equal(counter, 1, 'Counter executed once');
		instance.unsubscribe(subscription);
	});

	test("Inheritance test2 (Issue #7)", function() {
		var instance = pubsub.newInstance({
			recurrent: true
		});
		var counter = 0;

		var subscription = instance.subscribe('hello/world', function() {
			counter += 1;
		});

		instance.publish('hello/world');

		equal(counter, 1, 'Counter executed once');
		instance.unsubscribe(subscription);
	});

	test("Inheritance test (Depth)", function() {
		var values = {};
		var param1 = "some param1";
		var param2 = "some param2";
		var param3 = "some param3";

		var instance = pubsub.newInstance({
			recurrent : true,
			depth : 2
		});

		var subscription1 = instance.subscribe('hello/world', function(param1, param2) {
			values.param1 = param1;
		});
		var subscription2 = instance.subscribe('hello/world/one', function(param1, param2) {
			values.param2 = param2;
		});
		var subscriptionShouldNotExecute = instance.subscribe('hello', function(param1, param2, param3) {
			values.param3 = param3;
		});

		instance.publish('hello/world/one/two', [param1, param2, param3]);

		deepEqual(values, { param1 : param1, param2 : param2 }, 'Values has proper value');
		instance.unsubscribe(subscription1);
		instance.unsubscribe(subscription2);
		instance.unsubscribe(subscriptionShouldNotExecute);
	});

	test("Publish wildcard test (*)", function() {
		var number = 0;

		var subscription1 = pubsub.subscribe('hello', function() {
			number++;
		});
		var subscription2 = pubsub.subscribe('earth', function() {
			number++;
		});
		var subscription3 = pubsub.subscribe('galaxy', function() {
			number++;
		});
		var subscription4 = pubsub.subscribe('hello/world', function() {
			number++;
		});

		pubsub.publish('*');

		ok(number === 3, 'Wildcard (*) is working properly');
		pubsub.unsubscribe(subscription1);
		pubsub.unsubscribe(subscription2);
		pubsub.unsubscribe(subscription3);
		pubsub.unsubscribe(subscription4);
	});

	test("Publish wildcard test (hello/*)", function() {
		var number = 0;

		var subscription1 = pubsub.subscribe('hello/world', function() {
			number++;
		});
		var subscription2 = pubsub.subscribe('hello/earth', function() {
			number++;
		});
		var subscription3 = pubsub.subscribe('hello/galaxy', function() {
			number++;
		});
		var subscription4 = pubsub.subscribe('hello/world/inner', function() {
			number++;
		});

		pubsub.publish('hello/*');

		ok(number === 3, 'Wildcard (*) is working properly');
		pubsub.unsubscribe(subscription1);
		pubsub.unsubscribe(subscription2);
		pubsub.unsubscribe(subscription3);
		pubsub.unsubscribe(subscription4);
	});

	test("Multiple subscription1 (one namespace, many callbacks)", function() {
		var number = 0;

		var subscription = pubsub.subscribe('hello/world', [
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
		ok(number === 3, 'Multiple subscription before unsubscribe is working properly');
		pubsub.unsubscribe(subscription);

		pubsub.publish('hello/world');
		ok(number === 3, 'Multiple subscription after unsubscribe is working properly');
	});


	test("Multiple subscription2 (many namespaces, one callback)", function() {
		var number = 0;

		var subscription = pubsub.subscribe(['hello/world', 'goodbye/world'], function() {
			number++;
		});

		pubsub.publish('hello/world');
		ok(number === 1, 'Subscribtion to hello/world before unsubscribe is working properly');
		pubsub.publish('goodbye/world');
		ok(number === 2, 'Subscribtion to goodbye/world before unsubscribe is working properly');
		pubsub.unsubscribe(subscription);

		pubsub.publish('hello/world');
		ok(number === 2, 'Subscribtion to hello/world after unsubscribe is working properly');
		pubsub.publish('goodbye/world');
		ok(number === 2, 'Subscribtion to goodbye/world after unsubscribe is working properly');
	});

	test("Multiple subscription3 (many namespaces, many callbacks)", function() {
		var number1 = 0;
		var number2 = 0;

		var subscription = pubsub.subscribe(['hello/world', 'goodbye/world'], [function() {
			number1++;
		}, function() {
			number2 += 2;
		}]);

		pubsub.publish('hello/world');
		ok(number1 === 1, 'Subscribtion to hello/world before unsubscribe is working properly (number1)');
		ok(number2 === 2, 'Subscribtion to hello/world before unsubscribe is working properly (number2)');
		pubsub.publish('goodbye/world');
		ok(number1 === 2, 'Subscribtion to goodbye/world before unsubscribe is working properly (number1)');
		ok(number2 === 4, 'Subscribtion to goodbye/world before unsubscribe is working properly (number2)');
		pubsub.unsubscribe(subscription);

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

		var subscription = pubsub.subscribe('hello/world', function() {
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
		pubsub.unsubscribe(subscription);
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

		var subscription = pubsub.subscribe('hello/world', function() {
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
		pubsub.unsubscribe(subscription);
		pubsub.publish('hello/world');
		ok(number1 === 1 && number2 === 1, "Public unsubscribe worked properly");
	});

	test("Subscription wildcard test (*)", function() {
		var number = 0;

		var subscription = pubsub.subscribe('*', function() {
			number += 1;
		});

		pubsub.publish('hello');
		pubsub.publish('world');
		pubsub.publish('lord');
		pubsub.publish('globe');

		ok(number === 4, 'Subscription wildcard is working properly');
		pubsub.unsubscribe(subscription);

		pubsub.publish('hello');
		pubsub.publish('hello/world');
		ok(number === 4, 'Unsubscribe test');
	});

	test("Subscription wildcard test (hello/*)", function() {
		var number = 0;

		var subscription = pubsub.subscribe('hello/*', function() {
			number += 1;
		});

		pubsub.publish('hello/world');
		pubsub.publish('hello/globe');
		pubsub.publish('hello/galaxy');

		ok(number === 3, 'Subscription wildcard is working properly');
		pubsub.unsubscribe(subscription);

		pubsub.publish('hello/world');
		ok(number === 3, 'Subscription wildcard is working properly');
	});

	test("Subscription wildcard test (hello/*/world)", function() {
		var number = 0;

		var subscription = pubsub.subscribe('hello/*/world', function() {
			number += 1;
		});

		pubsub.publish('hello');
		pubsub.publish('hello/my');
		pubsub.publish('hello/my/world');
		pubsub.publish('hello/huge/world');
		pubsub.publish('hello/great/world');

		ok(number === 3, 'Subscription wildcard is working properly');

		pubsub.publish('hello/great/galaxy');
		ok(number === 3, 'Subscription wildcard is working properly');
		pubsub.unsubscribe(subscription);

		pubsub.publish('hello/great/world');
		ok(number === 3, 'Subscription wildcard is working properly');
	});

	test("Subscription wildcard test (hello/*/*/world)", function() {
		var number = 0;

		var subscription = pubsub.subscribe('hello/*/*/world', function() {
			number += 1;
		});

		pubsub.publish('hello/my/green/world');
		pubsub.publish('hello/huge/yellow/world');
		pubsub.publish('hello/great/blue/world');

		ok(number === 3, 'Subscription wildcard is working properly');

		pubsub.publish('hello/great/black/galaxy');
		ok(number === 3, 'Subscription wildcard is working properly');
		pubsub.unsubscribe(subscription);

		pubsub.publish('hello/great/green/world');
		ok(number === 3, 'Subscription wildcard is working properly');
	});

	asyncTest("Async pubsub test (differences)", function() {
		ok(typeof pubsub.newInstance === 'function', "pubsub has method newInstance");
		var number1 = 0;

		var asyncPubsub = pubsub.newInstance({
			async : true
		});

		asyncPubsub.subscribeOnce('hello/world', function() {
			number1++;

			ok(number1 === 2, "Async pubsub publish worked properly");
			start();
		});

		asyncPubsub.publish('hello/world', []);
		number1++;
		ok(number1 === 1, "Async pubsub publish worked properly");
	});

	asyncTest("Sync pubsub test (differences)", function() {
		ok(typeof pubsub.newInstance === 'function', "pubsub has method newInstance");
		var number1 = 0;

		var syncPubsub = pubsub.newInstance();

		syncPubsub.subscribeOnce('hello/world', function() {
			number1++;

			ok(number1 === 1, "Sync pubsub publish worked properly");
			start();
		});

		syncPubsub.publish('hello/world', []);
		number1++;
		ok(number1 === 2, "Sync pubsub publish worked properly");
	});

	test("Pubsub testing context argument in options", function() {
		var contextArgument = ["object"];
		var privatePubsub = pubsub.newInstance({
			context : contextArgument
		});
		var onceReturn = 0;

		privatePubsub.subscribe('hello/context', function() {
			var self = this;

			ok(self === contextArgument, "Context argument in options work correctly for every subscription");
		});
		privatePubsub.subscribe('hello/self', function() {
			var self = this;

			ok(self === contextArgument, "Context argument in options work correctly for every subscription");
		});
		privatePubsub.subscribeOnce('hello/once', function() {
			var self = this;

			onceReturn++;
			ok(self === contextArgument, "Context argument in options work correctly for every subscription");
		});

		privatePubsub.publish('hello/context');
		privatePubsub.publish('hello/self');
		privatePubsub.publish('hello/once');
		privatePubsub.publish('hello/once');
		equal(onceReturn, 1, "subscribeOnce callback published only once");
	});

	test("Pubsub testing override of context argument in options", function() {
		var contextArgument = ["object"];
		var contextArgument2 = ["object2"];
		var privatePubsub = pubsub.newInstance({
			context : contextArgument
		});
		var onceReturn = 0;

		privatePubsub.subscribe('hello/context', function() {
			var self = this;

			ok(self === contextArgument, "Context argument in options work correctly for every subscription");
		});
		privatePubsub.subscribe('hello/self', function() {
			var self = this;

			ok(self === contextArgument2, "Context argument in private subscription options work correctly");
		}, {
			context : contextArgument2
		});
		privatePubsub.subscribeOnce('hello/once', function() {
			var self = this;

			onceReturn++;
			ok(self === contextArgument2, "Context argument in private subscription options work correctly");
		}, {
			context : contextArgument2
		});

		privatePubsub.publish('hello/context');
		privatePubsub.publish('hello/self');
		privatePubsub.publish('hello/once');
		privatePubsub.publish('hello/once');
		ok(onceReturn === 1, "subscribeOnce callback published only once");
	});

	test("Pubsub testing use of private context for one subscribe", function() {
		var contextArgument = ["object"];
		var privatePubsub = pubsub.newInstance();

		function callbackFirst() {
			var self = this;

			ok(self === callbackFirst, "No context definition = context is same function");
		}
		function callbackSecond() {
			var self = this;

			ok(self === contextArgument, "Context argument in subscribe config works correctly");
		}

		privatePubsub.subscribe('hello/context', callbackFirst);
		privatePubsub.subscribe('hello/self', callbackSecond, {
			context : contextArgument
		});

		privatePubsub.publish('hello/context');
		privatePubsub.publish('hello/self');
	});
})();
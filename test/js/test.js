test("Presence test", function() {
	ok(typeof pubsub === 'object' && pubsub != null, "pubsub present");
	ok(typeof pubsub.publish === 'function', "pubsub has method publish");
	ok(typeof pubsub.subscribe === 'function', "pubsub has method subscribe");
	ok(typeof pubsub.unsubscribe === 'function', "pubsub has method unsubscribe");
});

test("Publish test (basic)", function() {
	var done = false;
	pubsub.subscribe('hello/world1', function() {
		done = true;
	});
	pubsub.publish('hello/world1');
	ok(done === true, 'Done has proper value');
});

test("Publish test (param)", function() {
	var done = false;
	var param = "some param";
	pubsub.subscribe('hello/world2', function(param) {
		done = param;
	});
	pubsub.publish('hello/world2', [param]);
	ok(done === param, 'Done has proper value');
});

test("Publish test (many params)", function() {
	var values = {};
	var param1 = "some param1";
	var param2 = "some param2";

	pubsub.subscribe('hello/world3', function(param1, param2) {
		values = {
			'param1' : param1,
			'param2' : param2
		};
	});
	pubsub.publish('hello/world3', [param1, param2]);
	ok(values.param1 === param1 && values.param2 === param2, 'Values has proper values');
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

test("Wildcards test (basic)", function() {
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

// test("Wildcards test (more advanced)", function() {
// 	var values = {};
// 	var param1 = "some param1";
// 	var param2 = "some param2";

// 	var subscribtion = pubsub.subscribe('hello', function(param1, param2) {
// 		values = {
// 			'param1' : param1,
// 			'param2' : param2
// 		};
// 	});
// 	pubsub.publish('hello/world5', [param1, param2], true);
// 	ok(values.param1 === param1 && values.param2 === param2, 'Values has proper value');
// 	pubsub.unsubscribe(subscribtion);
// });
function runAll() {
	asyncTest("Does setImmediate call the handler", 1, function () {
		function pass() {
			if (timer) {
				clearTimeout(timer);
			}
			ok(true, 'it worked! the handler was called');
			start();		
		}
		function fail() {
			ok(false, 'FAILED! the handler was never called');	
			start();		
		}

		var timer = setTimeout(fail, 1000);
		setImmediate(pass);
	});

	asyncTest("Does setImmediate call the handler WITH one argument", 1, function () {
		function pass(abc) {
			if (abc === "abc") {
				ok(true, 'it worked! the handler was called with the correct arguments');
			} else {
				ok(false, 'the handler was called but the arguments were incorrect');
			}
			start();		
		}
		setImmediate(pass, "abc");
	});

	asyncTest("Does setImmediate call the handler WITH two arguments", 1, function () {
		function pass(abc, num) {
			if (abc === "abc" && num === 123) {
				ok(true, 'it worked! the handler was called with the correct arguments');
			} else {
				ok(false, 'the handler was called but the arguments were incorrect');
			}
			start();		
		}
		setImmediate(pass, "abc", 123);
	});

	asyncTest("Does clearImmediate clear a setImmediate that was just set", 1, function () {
		function pass() {
			clearTimeout(timer);
			ok(false, 'FAILED! the handler was called');	
			start();		
		}
		function fail() {
			start();
			ok(true, 'it worked! the handler was correctly never called');
		}

		var timer = setTimeout(fail, 1000);
		var handle = setImmediate(pass);
		clearImmediate(handle);
	});
			
	asyncTest("Does clearImmediate clear a non-sequential setImmediate", 2, function () {
		var y = 1;

		function pass(x) {
			switch (x) {
			case 1:
				strictEqual(y, 1, "setImmediate(pass, 1)");
				break;
			case 2:
				ok(false, 'oops! should not be here. x=' + x + ' y=' + y);
				break;
			case 3:
				strictEqual(y, 2, "setImmediate(pass, 3)");
				start();
				break;
			}
			y++;
		}

		setImmediate(pass, 1);
		var handle = setImmediate(pass, 2);
		clearImmediate(handle);
		setImmediate(pass, 3);
	});
	
	asyncTest("Does setImmediate yield to subsequent code before executing its callback", 2, function () {
		var callbackCalled = false;
		function callback() {
		  callbackCalled = true;
	  
		  ok(true, "The callback was called eventually.");
	  
		  start();
		}
	
		setImmediate(callback);
		strictEqual(callbackCalled, false, "The callback wasn't called immediately.");
	});

	if (typeof Worker === "function") {
		asyncTest("Does setImmediate work inside a web worker", 1, function () {
			var worker = new Worker("worker.js");
			worker.addEventListener("message", function (event) {
				strictEqual(event.data, "TEST", "The web worker used setImmediate to pass data back to the main script");
				start();
			}, false);
		});
	}

	asyncTest("Execution order for setImmediate via postMessage", 1, function () {
        var orderOfExecution = '';
        var tmp = setImmediate(function () {
          
        });
        clearImmediate(tmp);

        window.onmessage = function (event) {
          event = event || window.event;
          if (event.data === 'some other message') {
            orderOfExecution += '1';
            if (orderOfExecution.length === 2) {
              strictEqual(orderOfExecution === '12', true, "Execution order is wrong");
              start();
            }
          }
        };
        window.postMessage('some other message', '*');

        setImmediate(function () {
          orderOfExecution += '2';
          if (orderOfExecution.length === 2) {
            strictEqual(orderOfExecution === '12', true, "Execution order is wrong");
            start();
          }
        });

	});


    asyncTest("Execution order test", 1, function () {
       var j = 0;
       setImmediate(function () {
         j = 1;
       });
       setTimeout(function () {
         strictEqual(!!j, true, "Execution order is wrong");
         start();
       }, 0);
    });
}

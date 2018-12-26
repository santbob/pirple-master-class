/*
 * The Main test runner file
 *
 */

const tests = {
  'unit': require('./unit')
};

testsLimit = function() {
  let counter = 0;
  for (let key in tests) {
    if (tests.hasOwnProperty(key)) {
      const subTests = tests[key];
      for (let testName in subTests) {
        if (subTests.hasOwnProperty(testName)) {
          counter++;
        }
      }
    }
  }
  return counter;
}

produceTestReport = function(limit, successes, errors) {
  console.log("");
  console.log("--------BEGIN TEST REPORT--------");
  console.log("");
  console.log("Total Tests: ", limit);
  console.log("Pass: ", successes);
  console.log("Fail: ", errors.length);
  console.log("");

  // If there are errors, print them in detail
  if (errors.length > 0) {
    console.log("--------BEGIN ERROR DETAILS--------");
    console.log("");
    errors.forEach(function(testError) {
      console.log('\x1b[31m%s\x1b[0m', testError.name);
      console.log(testError.error);
      console.log("");
    });
    console.log("");
    console.log("--------END ERROR DETAILS--------");
  }
  console.log("");
  console.log("--------END TEST REPORT--------");
  process.exit(0);
}

//Runs all the tests and prints the results
runTests = function() {
  const errors = [];
  let successes = 0;
  const limit = testsLimit();
  let counter = 0;
  for (let key in tests) {
    if (tests.hasOwnProperty(key)) {
      const subTests = tests[key];
      for (let testName in subTests) {
        if (subTests.hasOwnProperty(testName)) {
          (function() {
            const tempTestName = testName;
            const testValue = subTests[testName];
            //call the test
            try {
              testValue(function() {
                //being here means the test is a success
                console.log('\x1b[32m%s\x1b[0m', tempTestName);
                successes++;
              })
            } catch (e) {
              //being here means the test is a failure
              console.log('\x1b[31m%s\x1b[0m', tempTestName);
              errors.push({'name': tempTestName, 'error': e});
            } finally {
              counter++;
              if (counter == limit) {
                produceTestReport(limit, successes, errors);
              }
            }
          })();
        }
      }
    }
  }
}

runTests();

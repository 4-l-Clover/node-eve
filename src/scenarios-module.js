/**
*	Sets eVe.mode = 'addTests';
*/
eVe.set2AddTest = function () {
    eVe.mode = 'addTests';
    alert("Testing: \n You can add tests scenarios now. \nWhen you finished adding test scenarios please click 'Save New Tests' to save them.");
}


/**
*	FORM is submits only.
	Adds a test scenario when a FORM is submitted
*	@toDo : Needs improvement
	structure:
	eVe.tests[requestName] = {};
	eVe.tests[requestName][inputsStr] = result;
		requestName (string), inputsStr (JSON string), result (object)
*/
eVe.addAtestScenario = function (requestName, inputsStr, result) {
    // if both requestName && result exist: Means form submit operation finished
    if (requestName && result) {
        if (eVe.testStarted !== requestName) {
            eVe.testsNotCompleted.push(eVe.testStarted);
        }

        eVe.testStarted = '';

        if (typeof (eVe.tests[requestName]) === 'undefined') {
            eVe.tests[requestName] = {};
        }

        if (inputsStr) {
            if (eVe.tests[requestName][inputsStr]) {
                if (confirm('This test was already added. Do you want to overwride it?')) {
                    eVe.tests[requestName][inputsStr] = result;
                    return true;
                }
                return false;
            }
            else {
                eVe.tests[requestName][inputsStr] = result;
            }
        }
        else {
            if (eVe.tests[requestName]['no_inputs']) {
                if (confirm('This test was already added. Do you want to overwride it?')) {
                    eVe.tests[requestName]['no_inputs'] = result;
                    return true;
                }
                return false;
            }
            else {
                eVe.tests[requestName]['no_inputs'] = result;
            }
        }
    }
    // means test started. No result yet.
    else if (requestName) {
        eVe.testStarted = requestName;
        return false;
    }
    else {
        alert('Testing: Error 1209: Missing request name');
        return false;
    }

    eVe.countTests++;

    return true;

}


/**
*	Saves all test scenarios in eVe.tests which includes old and new test scenarios.
	Warning: You must save the new test scenarios before clearing the cache. Otherwise the new ones will be lost.
*/
eVe.saveTests = function () {

    if (typeof (eVe.tests) === 'undefined') {
        alert('Testing: Nothing to be saved.');
        return true;
    }

    let toBeSaved = 'eVe.tests = ' + JSON.stringify(eVe.tests) + ';';
    eVe.download(toBeSaved, 'eVe_testScenarios.txt');

    alert("Testing: \n" + eVe.countTests + " test scenarios were saved and attempted to downloaded for you... \nCheck downloads folder.");

    if (eVe.testsNotCompleted.length) {
        alert("Testing: \n WARNING: \nThere are " + eVe.testsNotCompleted.length + " incomplete tests: \n" + JSON.stringify(eVe.testsNotCompleted));
    }

    eVe.mode = 'tests';

    return true;


}

// eVe.download(content, 'eVe_testScenarios.txt' );
eVe.download = function (content, fileName) {
    var downloadLink = document.createElement("a");
    var file = new Blob([content], { type: 'text/plain' });
    downloadLink.href = URL.createObjectURL(file);
    downloadLink.download = fileName;
    downloadLink.click();
}
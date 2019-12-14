// This is called from eVe.init()
eVe.installTestModule = function () {

    eVe.addTestButtons();

    eVe.countTests = eVe.countObjectProperties(eVe.tests);

    alert('Testing: Currently there are ' + eVe.countTests + ' saved test scenarios.');

}

// This is called from eVe.installTestModule()
eVe.addTestButtons = function () {
    let testButtons = document.getElementById('testButtons');

    if (testButtons) {
        testButtons.style.display = 'block';
        return true;
    }

    testButtons = document.createElement('div');
    testButtons.innerHTML = '<button class="testButton" onclick="eVe.set2AddTest()">Add Tests</button> <button class="testButton" onclick="eVe.saveTests()">Save New Tests</button> . . . <button class="testButton" onclick="eVe.runAllTests()">Run Tests</button>	<button class="testButton" onclick="eVe.showTestResults()">Show Test Results</button>	';
    
    document.getElementById('r_1').appendChild(testButtons);
    testButtons.id = 'testButtons';

    return true;

}


/**
*	Counts 2 levels of properties of an object
*/
eVe.countObjectProperties = function (anObj) {
    let propertiesNum = 0;

	for(prop in anObj) {
		if(anObj.hasOwnProperty(prop)) {
			for(kid in anObj[prop]) {
				if(anObj[prop].hasOwnProperty(kid)) {
					propertiesNum++;
				}
			}
		}
    }
    
	return propertiesNum;
}

/**	
*	Creates a link for each test scenario
	Places test links in tests_div
	Tester clicks each link one by one.
	When tester finishes testing, tester clicks 'show test results'. 
*
*/
eVe.runAllTests = function () {
    eVe.mode = 'runTests';

    // Creates a link for each test scenario
    let testArea = document.getElementById('tests_div');
    if (testArea) {
        if (testArea.style.display == 'none') {
            testArea.style.display = 'block';
        }
        else {
            testArea.style.display = 'none';
        }
        return true;
    }

    // 1st level wrapper
    testArea = document.createElement('DIV');
    testArea.id = 'tests_div';

    let r1 = document.getElementById('r_1');
    let areaContent = document.getElementsByTagName('body')[0];

    areaContent.insertBefore(testArea, r1);

    let showStatus = '<h3>Prepared TESTS</h3>';

    // testLinks div
    showStatus += '<button type="button" class="hideNseek" onclick="eVe.hideNseekNext(this)"> - Forms to test</button><div id="testForms_div"></div>';
    // formLinks div
    showStatus += '<button type="button" class="hideNseek" onclick="eVe.hideNseekNext(this)"> - Links to test</button><div id="testLinks_div"></div>';
    testArea.innerHTML = showStatus;


    // testLinks elements
    let mobileMenu = document.getElementById('mobileMenu');
    let testlinks_div = document.getElementById('testLinks_div');
    testlinks_div.classList.add = 'inlineKids';

    let item;
    let menuItems = mobileMenu.getElementsByTagName('a');
    let newLinks = [];

    for (var i = 0; i < menuItems.length; i++) {
        newLink = document.createElement('a');
        newLink.href = menuItems[i].href;
        newLink.innerHTML = menuItems[i].innerHTML;
        newLinks.push(newLink);
    }

    for (var v = 0; v < newLinks.length; v++) {
        item = newLinks[v];
        testlinks_div.appendChild(item);
        item.addEventListener("click", function (e) { eVe.runALinkTest(this); });
    }

    // testForms elements
    let testFormContent = document.getElementById('testForms_div');
    testFormContent.classList.add = 'inlineKids';
    // testForms elements

    showStatus = '';
    let contentId = '';
    let testNum = '';
    let index = 0;
    let testItemContainer = {};
    newLinks = [];

    for (requestName in eVe.tests) {
        if (eVe.tests.hasOwnProperty(requestName)) {
            contentId = 'test_' + requestName;
            testFormContent.innerHTML += '<button type="button" class="hideNseek" onclick="eVe.hideNseekNext(this)"> - ' + requestName + '</button><div id="' + contentId + '"></div>';
            testItemContainer = document.getElementById(contentId);
            testItemContainer.classList.add = 'inlineKids';

            let atest = eVe.tests[requestName];
            for (datamStr in atest) {
                if (atest.hasOwnProperty(datamStr)) {
                    index++;
                    testNum = 'Test' + index;
                    item = document.createElement('a');
                    item.href = requestName;
                    item.innerHTML = testNum;
                    eVe.testsToRun[testNum] = [requestName, datamStr];
                    testItemContainer.appendChild(item);

                }
            }

        }
    }

    for (i = 0; i < testFormContent.getElementsByTagName('a').length; i ++) {
        item = testFormContent.getElementsByTagName('a')[i];

        item.addEventListener("click", function (e) {
            eVe.runAFormSubmitTest(this.innerHTML);
        });
    }

}


/**
*	This method runs a link test but the result is not evaluated here
*	Result is registered in eVe.addAtestResult()
*	eVe.addAtestResult() is called in eVe_tests1.js when a link operation is ended
*/
eVe.runALinkTest = function (alink) {
    event.preventDefault();
    // console.log('304 alink.innerHTML: ' + alink.innerHTML + ' : ' + alink.text);

    eVe.analyzeLink(alink);

    return true;

}


/**
*	This method runs a form test. 
	When test is ended eVe.addAtestResult() is called in eVe_tests1.js, not from here.
	
	testnumber] structure: [requestName, testData]
*/
eVe.runAFormSubmitTest = function (testnumber) {
    event.preventDefault();

    let testData = eVe.testsToRun[testnumber][1];
    let requestName = eVe.testsToRun[testnumber][0];
    let formId = requestName.substring(0, requestName.length - 7);
    let formContent = document.getElementById(formId);

    if (!formContent) {
        alert("Testing: \n Please open the form " + formId + " first and click the test link after.\n");
        return true;
    }

    if (testData) {
        eVe.insertFormInputs(formId, testData);
        alert('Testing: Please submit the form if you see the data populated in the form fields.');
    }
    else {
        alert('Testing: Please submit the form to test empty form.');
    }


    return true;

}


/**
* 	Inserts given values (testData) into the form fields.
	No multiselect in drop downs. Use checkboxes instead.
*/
eVe.insertFormInputs = function (formId, testData) {
    let errContent = document.getElementsByClassName('error');
    for (let v = 0; v < errContent.length; v++) {
        errContent[v].style.display = 'none';
    }

    let testContent = document.getElementById(formId);

    if (!testContent || testContent == 'null') {
        alert('Testing: Sorry cannot get the form');
        return false;
    }

    let typedTestData = JSON.parse(testData);

    testContent.reset();
    let testName, testId;

    for (let i = 0; i < testContent.elements.length; i ++) {

        testId = testContent.elements[i];
        if (typeof (testId.type !== 'undefined') && testId.type == 'hidden') {
            continue;
        }
        testName = testId.name;

        if (typeof (typedTestData[testName]) === 'undefined') {
            if (testId.type == 'textarea') {
                CKEDITOR.instances[testName].setData('');
                testId.value = '';
            }
            else if (testId.type == 'checkbox' || testId.type == 'radio') {
                testId.checked = false;
            }
            else {
                testId.value = '';
            }
        }
        else if (typeof (typedTestData[testName]) === 'string') {
            if (testId.type == 'textarea') {
                CKEDITOR.instances[testName].setData(typedTestData[testName]);
            }
            else if (testId.type == 'checkbox' || testId.type == 'radio') {
                if (testId.value == typedTestData[testName]) {
                    testId.checked = true;
                }
            }
            else {
                testId.value = typedTestData[testName];
            }
        }
        else {
            // Assumes typedTestData[testName] is array	
            if (typeof (typedTestData[testName][0]) === 'undefined') {
                continue;

            }

            if (testId.type == 'textarea') {
                CKEDITOR.instances[testName].setData(typedTestData[testName][0]);
            }
            else if (testId.type == 'checkbox' || testId.type == 'radio') {
                // Only checkboxes can have multiple values
                if (typedTestData[testName].indexOf(testId.value) > -1) {
                    testId.checked = true;
                }
            }
            else {
                testId.value = typedTestData[testName][0];
            }

        }

    }

    return true;

}


/**
*	This is called in eVe.tests1.js when running a test is finished
*	If program could run synchronously : 
		It would be possible to find out the test result programmatically 
			if(eVe.tests[requestName][inputsStr] == creturn) {
				// test was successful
			}
	Since Ajax is causing asynchronous operations we need the tester to confirm 
	each test result one by one.
*/
eVe.addAtestResult = function (requestName, inputsStr, creturn) {

    if (confirm("Testing: \n Did you get what you expected from this test? \n" + requestName + "\nOk means Yes, Cancel means No")) {
        eVe.countSuccessfulTests ++;
    }
    else {
        eVe.CountFailedTests ++;
        if (typeof (eVe.FailedTests[requestName]) === 'undefined') {
            eVe.FailedTests[requestName] = {};
        }

        if (requestName.substring(requestName.length - 6) == 'submit') {
            eVe.FailedTests[requestName][inputsStr] = 'Form submit failed expectation';
        }
        else {
            eVe.FailedTests[requestName] = 'Link failed expectation';
        }
    }

    return true;

}

/**
*	Show test results by date in local storage, 
*/
eVe.showTestResults = function () {
    // getting lists of failed tests
    let failedStr = '';

    if (eVe.CountFailedTests) {
        let failedItem, failData;

        for (requestName in eVe.FailedTests) {

            if (eVe.FailedTests.hasOwnProperty(requestName)) {
                failedItem = eVe.FailedTests[requestName];

                for (failData in failedItem) {
                    if (failedItem.hasOwnProperty(failData)) {
                        failedStr += "\n\nfailed: " + requestName + "\n" + failData;
                    }
                }
            }

        }

        failedStr += "FAILED FORM TESTS: \n" + failedStr;
    }

    let testDate = new Date().toISOString().substr(0, 19).replace(/-/g, '').replace(/:/g, '');

    alert("Testing: \n END of The tests at " + testDate + "\n Successful tests: " + eVe.countSuccessfulTests + "\n Failed links and forms tests: " + eVe.CountFailedTests + "\n" + failedStr);

    eVe.mode = 'tests';

}
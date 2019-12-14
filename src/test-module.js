const faker = require('faker');

// This is called from eVe.init()
eVe.installTestModule = function () {

    eVe.addTestButtons();
    eVe.autoAddScenario(10);

    eVe.countTests = eVe.countObjectProperties(eVe.tests);

    alert('Testing: Currently there are ' + eVe.countTests + ' saved test scenarios.');

}

// This is called from eVe.installTestModule()
eVe.autoAddScenario = function(times) {
    let requestName = "form_register1_submit";

    for (let i = 0; i < times; i ++) {
        let fakeData = {
            activeornot2: 'ACTIVE DUTY ATHLETE',
            names: faker.name.findName(),
            email1: faker.internet.email(),
            phonenumber: faker.phone.phoneNumber(),
            gender: "gender_0",
            rank: faker.random.number(),
            street: faker.address.streetAddress(),
            city: faker.address.city(),
            usaStates: faker.address.country(),
            zipcode: faker.address.zipCode(),
            servicedogs: "Yes",
            ifdog: faker.random.words(),
            names2: faker.name.findName(),
            phonenumber2: faker.phone.phoneNumber(),
            email2: faker.internet.email(),
            relation2: faker.random.words(),
            files1: faker.system.filePath()
        };

        eVe.addAtestScenario(requestName, JSON.stringify(fakeData), '');
    }
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

    for (const subKey of Object.keys(anObj)) 
        propertiesNum += Object.keys(subKey).length;
    
    return propertiesNum;
}

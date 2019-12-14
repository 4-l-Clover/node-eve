/**
	This file replaces eVe.js in tests mode.
	check eVe_mode in htmlHead.php 
	
	Whenever you change eVe.js you must make the same changes in eVe_tests.js 
		otherwise your tests might become unreliable.	
	
	Differences from eVe.js:
		Added page section "start: tests - local storage " at the end of this page
		eVe.installTestModule() is called in eVe.init()
		Cache is disabled in eVe.ajaxCall()
		Added: if(eVe.mode = ...) code blocks in many places
		
*/

console.log("First, make sure Ckeditor folder exists under js/libraries.\nThen, fill in form fields and click submit button.\nAfter each submit, you should see the submitted data under the form.");	// R***

let eVe = {};

// Tracks ajax operations. Value comes from Ajax response.
eVe.ajaxUnsafe = false;
eVe.runAfter = {};
eVe.form = {};
eVe.tokens = {};
eVe.internalLinks = {};
eVe.requireds = {};
eVe.patterns = {};
eVe.caches = {};
eVe.mode = '-';

eVe.dumpStr = '';
eVe.dumpCountObj = 0;
eVe.dumpCountRows = 0;
eVe.dumpAssocLimit = 100;

/**
	el can be document or a region or a block
	Use eVe.init when you need to add something after (window.onload and rendering the page)
	Document.ready level tasks must be in eVe.init(document).
*/
eVe.init = function (el) {

    // This function was created in htmlHead.php
    eVe.jsCodeAfterLoad();

    // Controlling links 
    eVe.controlLinks(el);

    // Controlling submit 
    eVe.preventFormSubmit();

    window.addEventListener('resize', eVe.resize);

    if (eVe.mode === 'tests') {
        eVe.installTestModule();
    }

    return true;
}

// mobile menu control
eVe.resize = function () {
    document.getElementById('mobileMenu').style.display = 'none';
    let el = document.getElementById('mobileMenuIcon');
    el.innerHTML = ' + ' + el.innerHTML.substring(3);
}

//--------- start control links ------------------------------------------------

/*
*	control links in el
*/
eVe.controlLinks = function (el) {

    let els = el.getElementsByTagName('a');
    for (let i = 0; i < els.length; i++) {
        let el = els[i];
        els[i].onclick = function (event) {
            event.preventDefault();
            eVe.analyzeLink(this)
        }
    }

    return true;

}

/*
*	control links in el
*/
eVe.analyzeLink = function (alink) {

    let isinternal = eVe.isInternalLink(alink);
    if (isinternal === 'page_first') {
        let el1 = document.getElementsByTagName('body')[0];
        el1.innerHTML = eVe.renderedBody;
        eVe.jsCodeAfterLoad();
        eVe.init(document);
        if (eVe.mode === 'tests' || eVe.mode === 'addAtest') {
            eVe.addTestButtons();
        }
        else if (eVe.mode === 'runTests') {
            eVe.addAtestResult('page_first', '', 'page_first');
            eVe.addTestButtons();
        }

        return true;
    }
    if (isinternal === 'external') {
        eVe.runExternalLink(alink);
    }
    else if (isinternal === 'hash') {
        let pos1 = alink.href.indexOf('#');
        alert('hash: ' + alink.href.substring(pos1));
        location.hash = alink.href.substring(pos1);

    }
    else if (isinternal) {
        eVe.runInternalLink(isinternal);
    }
    else {
        alert('Invalid link.');
        return false;
    }

}


/*
*	Extracts domain1 name from el and domain2 name from current page's url (location)
	Returns 
	1- 'external': If domain1 is not equal to domain2
	2- 'hash': If the link is pointing to a part on the same page
	3- any string: If the link is internal. Returned string is the request name. 
	4- else returns false.
	
*/
eVe.isInternalLink = function (el) {

    // not a valid link
    if (typeof (el.href) === 'undefined') {
        return false;
    }

    let pos3 = location.href.indexOf('#');
    if (pos3 > -1) {
        if (el.href.indexOf(eVe.urlroot) === 0) {
            return 'hash';
        }
    }

    // internal link
    if (el.href.indexOf(eVe.urlroot) === 0) {
        let ln = eVe.urlroot.length;
        let request = el.href.slice(ln + 1);
        if (request === 'page_first') {
            return 'page_first';
        }
        return request;
    }

    // not internal link
    if (el.href.indexOf('http') === 0) {
        let href1 = el.href.slice(8);
        return 'external';
    }
    else {
        return false;
    }


}


/*
*	Runs a link through Ajax 
	Format of an internal link(request): 
		contactus/b_5_1/arg1/arg2/arg3
		{requestName}/{replaceId}/arg1/arg2/arg3/  etc.

	target url = 'security.php';  
	
	Terminology: 'request', 'requests' do not include pages. All requests go through Ajax.
	Pages do not go through Ajax.
	
*/
eVe.runInternalLink = function (clink) {

    let arow, fieldName, args;
    let datam = {};
    let metaData = {};

    if (clink.indexOf("/") > -1) {
        let args = clink.split("/");
        metaData['requestName'] = args[0];
        // arguments to pass to the backend server	
        if (args.length > 1) {
            for (let i = 1; i < args.length; i++) {
                datam[i - 1] = args[i];
            }
        }
    }
    else {
        metaData['requestName'] = clink;
    }
    // each request has a wrapper div
    let cid = metaData['requestName'] + '_div';
    let isexist = document.getElementById(cid);
    if (isexist) {
        return true;
    }

    if (typeof (eVe.internalLinks[metaData['requestName']]) === 'undefined') {
        alert('Error: Sorry, there is a problem with the link.');

        return false;
    }

    metaData['targetId'] = eVe.internalLinks[metaData['requestName']][0];
    metaData['positionInTarget'] = eVe.internalLinks[metaData['requestName']][1];

    metaData['token1'] = eVe.tokens[eVe.pageid];
    if (!metaData['token1']) {
        alert('There is issue with the links.' + metaData[eVe.pageid]);

        return false;
    }


    try {
        let ajaxCallStatus = eVe.ajaxCall(metaData, datam);

    }
    catch (err) {
        alert('ERROR 240: Sorry something went wrong.' + err);
        let ajaxCallStatus = err;
    }


    return true;

}



/*
*	@toDo : Add confirm or cancel options
	@toDo : Open in new window
*/
eVe.runExternalLink = function (el) {
    msg = 'You are leaving our website';
    alert(msg);

    if (eVe.mode === 'runTests') {
        eVe.addAtestResult(el.text, '', msg);
    }

    return true;

}

//--------- end control links ------------------------------------------------


//--------- start control form ------------------------------------------------

/*
*	control form in el
*/
eVe.preventFormSubmit = function () {
    let form = document.getElementsByTagName('form');
    if (form.length > 0) {
        for (let i = 0; i < form.length; i++) {
            form[i].onsubmit = function (event) {
                event.preventDefault();
                eVe.submitForm1(this);
                // return false;
            }
        }
    }
}

/*
*	Submitting form:
	eVe.submitForm1() -> eVe.validateForm()
	eVe.submitForm2() -> eVe.ajaxCall()
*/
eVe.submitForm1 = function (cform) {
    // let cform = document.getElementById(formid);	

    if (typeof (cform.id) === 'undefined') {
        alert('ERROR: Missing form id');
    }
    if (typeof (eVe.patterns[cform.id]) === 'undefined') {
        alert('ERROR: Missing patterns for: ' + formid);
        return false;
    }

    // returns false if there is ubacceptable input
    let checked = eVe.validateForm(cform, eVe.requireds[cform.id], eVe.patterns[cform.id]);

    if (checked) {
        eVe.submitForm2(cform, checked.validateds);
    }

    return true;
}

/*

*/
eVe.getFormInputs = function (cform) {
    // inputFields = ['input', 'select', 'textarea'];
    let datamI = eVe.getInputs(cform);
    let datamS = eVe.getSelects(cform);
    let datamT = eVe.getTextareas(cform);

    // This is not working with Edge : let datam = {...datamT, ...datamI, ...datamS};

    let datam = {};
    for (let attrname in datamT) { datam[attrname] = datamT[attrname]; }
    for (let attrname in datamS) { datam[attrname] = datamS[attrname]; }
    for (let attrname in datamI) { datam[attrname] = datamI[attrname]; }

    return datam;
}


/*
*	Form validation through Javascript
*	Forms must be in a wrapper div with an ID
*   This function needs: eVe.requireds[formid], eVe.patterns[formid]
*	- returns $checked if all fields are validated
*	- If validation fails: Issues will be displayed next to form fields. This function returns false.
*/
eVe.validateForm = function (cform, requireds, patterns) {
    let formid = cform.id;
    if (!formid) {
        return false;
    }

    // datam structure: datam[el.name] = [value, value2, etc.]
    let datam = eVe.getFormInputs(cform);
    if (!eVe.getProperties(datam)) {
        alert('337 Form is empty. Please fill in the form.');
        return false;
    }

    let requestName = formid + '_submit';
    if (eVe.mode === 'addTests') {
        // registers that test started
        eVe.addAtestScenario(requestName, JSON.stringify(datam), '');
    }

    let checked = {};
    checked['unacceptables'] = [];
    checked['validateds'] = [];
    checked = eVe.checkPregMatch(patterns, datam, requireds);

    if (!checked) {
        alert('Operation failed. ');
        return false;
    }

    if (typeof (eVe.tokens[requestName]) === 'undefined') {
        row = ['token', 'Missing token.'];
        checked['unacceptables'].push(row);
        // return checked;			
    }


    if (checked.unacceptables.length > 0) {
        let msg = 'Issue with inputs.';
        console.log('352 requestName: ' + requestName);
        if (eVe.mode === 'addTests') {
            eVe.addAtestScenario(requestName, JSON.stringify(datam), msg);
        }
        else if (eVe.mode === 'runTests') {
            eVe.addAtestResult(requestName, JSON.stringify(datam), msg);
        }

        alert(msg + ' Form can NOT be submitted');
        // @toDo : display messages
        eVe.showInputIssues(formid, checked.unacceptables);
        return false;
    }
    else if (checked.validateds.length > 0) {
        // clear error messages if exists
        els = cform.getElementsByClassName('error');
        for (let v = 0; v < els.length; v++) {
            els[v].innerHTML = '';
            els[v].style.display = 'none';
        }
        return checked;

    }
    else {
        let msg = 'There is nothing to submit.';
        console.log('352 requestName: ' + requestName);
        if (eVe.mode === 'addTests') {
            eVe.addAtestScenario(requestName, JSON.stringify(datam), msg);
        }
        else if (eVe.mode === 'runTests') {
            eVe.addAtestResult(requestName, JSON.stringify(datam), msg);
        }

        alert(msg + " " + checked.validateds.length);

        return false;

    }


}

eVe.getTextareas = function (cform) {
    let datamT = {};
    let kid, coption;
    let kids = cform.getElementsByTagName('TEXTAREA');
    for (i = 0; i < kids.length; i++) {
        kid = kids[i];
        kid.value = CKEDITOR.instances[kid.name].getData();
        if (typeof (kid.value) === 'undefined' || !kid.value) {
            continue;
        }
        if (typeof (datamT[kid.name]) === 'undefined') {
            datamT[kid.name] = [];
        }
        datamT[kid.name].push(kid.value);
    }
    return datamT;
}

eVe.getInputs = function (cform) {
    let datamT = {};
    let kid, coption;
    let kids = cform.getElementsByTagName('input');
    for (i = 0; i < kids.length; i++) {
        kid = kids[i];
        if (typeof (kid.value) === 'undefined' || !kid.value) {
            continue;
        }
        if (typeof (datamT[kid.name]) === 'undefined') {
            datamT[kid.name] = [];
        }
        if (kid.type === 'checkbox' || kid.type === 'radio') {

            if (kid.checked === true) {
                datamT[kid.name].push(kid.value);
            }
        }
        else {
            datamT[kid.name].push(kid.value);
        }
    }

    return datamT;
}

// selects options are named as {selectName}_{n} 
eVe.getSelects = function (cform) {
    let datamT = {};
    let kid, coption;
    let kids = cform.getElementsByTagName('select');

    for (i = 0; i < kids.length; i++) {
        kid = kids[i];
        if (typeof (kid.name) === 'undefined') {
            alert('Error: Missing element name.');
            continue;
        }

        if (typeof (kid.value) === 'undefined' || !kid.value) {
            continue;
        }

        if (typeof (datamT[kid.name]) === 'undefined') {
            datamT[kid.name] = [];
        }
        datamT[kid.name].push(kid.value);
    }

    return datamT;
}


/**
*	@explanation :	checks size and characters of datam (inputs) against patterns

	datam structure: datam[el.name] = [value, value2, etc.]
	patterns structure: patterns[el.name] = pattern 
	requireds structure: [el1.name, el2.name, el3.name etc ]
	
	Returns validated fields and unmatched fields as arrays
	This function does not complain for data(input) that is not included in pattaerns.
	
*	@toDo : Warning: Sensitive data like password must be protected from display
*/
eVe.checkPregMatch = function (patterns, datam, requireds) {

    if (requireds.length < 1 || !eVe.getProperties(datam) || !eVe.getProperties(patterns)) {
        alert('Error 484: Missing parameters.');
        return false;
    }

    let checked = {};
    checked.unacceptables = [];
    checked.validateds = [];

    let inputs = [];
    let cinput, aMatch, fieldName;
    let row = [];
    for (fieldName in patterns) {
        if (patterns.hasOwnProperty(fieldName)) {
            if (typeof (datam[fieldName]) !== 'object' || typeof (datam[fieldName].length) === 'undefined' || datam[fieldName].length < 1) {
                if (requireds.indexOf(fieldName) > -1) {
                    row = [fieldName, "Don't leave blank."];
                    checked.unacceptables.push(row);
                }
                continue;
            }

            inputs = datam[fieldName];
            // It is ok if pattern is set but empty
            if (typeof (patterns[fieldName]) === 'undefined' || !patterns[fieldName]) {
                row = [fieldName, inputs];
                checked.validateds.push(row);
                continue;
            }

            pattern = patterns[fieldName];
            let newpattern = new RegExp(pattern);
            for (let j = 0; j < inputs.length; j++) {
                cinput = inputs[j];
                // console.log('541: ' + fieldName + ' : ' + cinput);
                if (typeof (cinput) === 'string') {
                    aMatch = cinput.match(newpattern);
                    if (aMatch) {
                        row = [fieldName, cinput];
                        checked.validateds.push(row);
                    }
                    else {
                        // checked.unacceptables[fieldName] = cinput + ' : Does not comply: ';
                        row = [fieldName, 'Does not comply'];
                        checked.unacceptables.push(row);
                    }
                }
                else {
                    // console.log('556: ' + fieldName + ' : ' + cinput);
                    row = [fieldName, 'Missing field'];
                    checked.unacceptables.push(row);

                }
            }
        }
    }

    return checked;

}


/*
*	gets validateds form inputs and token
	metaData['requestName'] = cform.id + '_submit';
	
*/
eVe.submitForm2 = function (cform, validateds) {
    if (typeof (cform) === 'undefined' || typeof (validateds) === 'undefined' || validateds.length < 1) {
        alert('System error.');
        return false;
    }

	/*
			// clear input error messages before submit
		els = cform.getElementsByClassName('error');
		for(let v=0; v<els.length; v++) {
			els[v].innerHTML = '';
			els[v].style.display = 'none';
		}
	*/

    let datam = {};
    let metaData = {};
    let arow, msg;
    for (i = 0; i < validateds.length; i++) {
        arow = validateds[i];
        // console.log('590 ' + arow[0] + ' : ' + arow[1]);
        if (typeof (datam[arow[0]]) === 'undefined') {
            datam[arow[0]] = arow[1];
        }
        // array of values: checkboxes, etc. have multiple values
        else if (typeof (datam[arow[0]]) !== 'object') {
            datam[arow[0]] = [datam[arow[0]], arow[1]];
        }
        else {
            datam[arow[0]].push(arow[1]);
        }
    }

    // watch requestName format
    metaData['formid'] = cform.id;
    metaData['requestName'] = cform.id + '_submit';
    metaData['actionType'] = 'submitForm';

    metaData['targetId'] = eVe.form[metaData['requestName']][0];
    metaData['positionInTarget'] = eVe.form[metaData['requestName']][1];
    metaData['cachable'] = eVe.form[metaData['requestName']][2];

    metaData['token1'] = eVe.tokens[metaData['requestName']];
    if (!metaData['token1']) {
        msg = 'token iisue';
        if (eVe.mode === 'addTests') {
            eVe.addAtestScenario(metaData['requestName'], JSON.stringify(datam), msg);
        }
        else if (eVe.mode === 'runTests') {
            eVe.addAtestResult(metaData['requestName'], JSON.stringify(datam), msg);
        }
        alert('There is issue with the form.' + metaData['requestName']);
        return false;
    }


    try {
        eVe.ajaxCall(metaData, datam);
    }
    catch (err) {
        if (eVe.mode === 'addTests') {
            eVe.addAtestScenario(metaData['requestName'], JSON.stringify(datam), err);
        }
        else if (eVe.mode === 'runTests') {
            eVe.addAtestResult(metaData['requestName'], JSON.stringify(datam), err);
        }
        // @toDo : save error locally and report
        console.log('ERROR-249: ' + err);
        alert('ERROR: Cannot get response from server.');

    }


    return true;


}


eVe.showInputIssues = function (formid, unacceptables) {

    let cform, els, el0, cspan, cname, cvalue, cparent;
    cform = document.getElementById(formid);

    els = cform.getElementsByClassName('error');
    for (let v = 0; v < els.length; v++) {
        els[v].innerHTML = '';
        els[v].style.display = 'none';
    }
    for (let i = 0; i < unacceptables.length; i++) {
        cname = unacceptables[i][0];
        cvalue = unacceptables[i][1];
        el0 = document.getElementById(cname + 'Error');
        if (el0) {
            el0.innerHTML = cvalue;
            el0.style.display = 'inline';
        }
        else {
            console.log("Missing element: " + cname + "Error");
            alert("Error: Missing element \n");
        }

    }

}





//--------- end control form ------------------------------------------------


//--------------------  begin: Ajax operations ------------------------------



/**
* 
* generic ajax call with customized callback function
	eVe.ajaxUnsafe = response['eVe.ajaxUnsafe']
	https://xhr.spec.whatwg.org/
	
*/
eVe.ajaxCall = function (metaData, datam) {

    if (typeof (metaData['url']) !== 'undefined') {
        var curl = metaData['url'];
        delete metaData['url'];
    }
    else {
        var curl = 'security.php';
    }

    if (eVe.ajaxUnsafe == true) {
        alert('Error-275: Unsafe to send Ajax ');
        return false;
    }

    metaData.requestType = 'Ajax';
    let params1 = {};
    let datamStr = JSON.stringify(datam);
    let metaDataStr = JSON.stringify(metaData);
    params1.datam = datamStr;
    params1.metaData = metaDataStr;

    if (eVe.mode !== 'tests' && eVe.mode !== 'addTests' && eVe.mode !== 'runTests') {
        let cached = eVe.isCached(metaData['requestName'], datamStr, metaDataStr);
        if (cached) {
            alert('Processing from cache');
            eVe.processAjaxResponse(cached, metaData, datam);
            return true;
        }
    }

    let params2 = typeof params1 == 'string' ? params1 : Object.keys(params1).map(
        function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params1[k]) }
    ).join('&');
    let xhr = new XMLHttpRequest();
    xhr.open("POST", curl, true);
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                if (metaData['cachable'] == 'cachable') {
                    eVe.caches[metaData['requestName']] = [];
                    eVe.caches[metaData['requestName']]['datamStr'] = datamStr;
                    eVe.caches[metaData['requestName']]['metaDataStr'] = metaDataStr;
                    eVe.caches[metaData['requestName']]['response'] = xhr.responseText;
                }

                xhr.eVe = eVe.processAjaxResponse(xhr.responseText, metaData, datam);
                return true;

            } else {
                console.error('720 xhr.statusText: ' + xhr.statusText);
                // @toDo : save error locally and report
                alert('ERROR 742: Sorry something went wrong.');
                // if it is form_submit
                console.log('757 actionType: ' + metaData['actionType']);

                if (eVe.mode === 'addTests' && metaData['actionType'] === 'submitForm') {
                    eVe.addAtestScenario(metaData['requestName'], datamStr, xhr.statusText);
                }
                else if (eVe.mode === 'runTests') {
                    eVe.addAtestResult(metaData['requestName'], JSON.stringify(datam), xhr.statusText);
                }
            }
        }
    };
    xhr.onerror = function (e) {
        console.error(xhr.statusText);
    };

    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params2);

    return xhr;

}



/*
*	
*	response from server - structure: 
	response = { 
		'status' : ''
		, 'html' : {}
		, 'JsFiles' : {}
		, 'tokens' : {}
	}
	css is added to elements as 

*	options for request['positionInTarget']: top, bottom, replace

	Adding Javascript to Ajax response: Check contactus1_form.php 
*/
eVe.processAjaxResponse = function (response, metaData, datam) {

    //	
    console.log('780 response: ' + response);	// R***

    response = response.trim();
    response = JSON.parse(response);

    // closing a gap for malicious attacks
    if (typeof (response.innerHTML) !== 'undefined') {
        return false;
    }

    if (response['toCaller']) {
        document.getElementById('toCaller').innerHTML = eVe.render.elements(response['toCaller']['elements']);
    }

    if (typeof (response['unacceptables']) !== 'undefined' && response['unacceptables'] && typeof (response['unacceptables'].length) !== 'undefined' && response['unacceptables'].length > 0) {
        eVe.showInputIssues(metaData['formid'], response['unacceptables']);
    }

    let imported;
    if (typeof (response['JsFiles']) !== 'undefined') {
        let script1;
        script1 = document.createElement("script");
        script1.src = response['JsFiles'][0];
        document.head.appendChild(script1);
        script1.onload = function () {
            eVe.processAjaxResponse2(response, metaData, datam);
        };
    }
    else if (typeof (response['html']) !== 'undefined') {
        eVe.processAjaxResponse2(response, metaData, datam);

    }


    if (typeof (response['tokens']) !== 'undefined') {
        for (atoken in response['tokens']) {
            if (response['tokens'].hasOwnProperty(atoken)) {
                eVe.tokens[atoken] = response['tokens'][atoken];
            }
        }
    }

    return true;

}


/**
*	response.innerH goes into repBlock
	request wrapper's id must be {requestName}_div 
*/
eVe.processAjaxResponse2 = function (response, metaData, datam) {
    console.log('844: ' + metaData['targetId'] + ' --- ' + metaData['positionInTarget']);

    let repBlock = document.getElementById(metaData['targetId']);
    if (!repBlock) {
        alert('Error: Sorry, missing argument.');
        return false;
    }

    if (typeof (response['html']['blocks']) !== 'undefined') {
        response.innerHTML = eVe.render.aRegion(response['html']['blocks']);
    }
    else if (typeof (response['html']['elements']) !== 'undefined') {
        response.innerHTML = eVe.render.elements(response['html']['elements']);
    }
    else if (typeof (response['html']['allRegions']) !== 'undefined') {
        response.innerHTML = eVe.render.allRegions(response['html']['allRegions']);
    }

    if (typeof (response.innerHTML) === 'undefined') {
        return false;
    }

    // positionInTarget: top, bottom, before, after, replace
    let cdiv;
    switch (metaData['positionInTarget']) {
        case 'bottom':
            cdiv = document.createElement('DIV');
            cdiv.innerHTML = response.innerHTML;
            repBlock.appendChild(cdiv);
            break;
        case 'top':
            cdiv = document.createElement('DIV');
            cdiv.innerHTML = response.innerHTML;
            repBlock.insertBefore(cdiv, repBlock.childNodes[0]);
            break;
        case 'replace':
            repBlock.innerHTML = response.innerHTML;
            break;
        case 'beforebegin':
            repBlock.insertAdjacentHTML('beforebegin', response.innerHTML);
            break;
        case 'afterend':
            repBlock.insertAdjacentHTML('afterend', response.innerHTML);
            break;
        default:
            repBlock.innerHTML = response.innerHTML;

    }


    // runAfter: runs after innerHTML is replaced. The code is in custom eVe.runAfter.{requestName} function. 
    if (typeof (response['runAfter']) !== 'undefined' && response['runAfter']) {
        let runAfter = response['runAfter'];

        if (typeof (eVe.runAfter[runAfter]) !== 'undefined') {
			/* This function must be in (requestName}.js file. Example: 
				Function eVe.runAfter.register1_form must be in register1_form.js file
			*/
            eVe.runAfter[runAfter](response, metaData);
        }
        else {
            console.log('Missing runAfter method 650: ' + runAfter);	// R***
        }
    }

    // These can go into custom runAfter function. 
    eVe.controlLinks(repBlock);
    eVe.preventFormSubmit();
    console.log('920 actionType: ' + typeof (metaData['actionType']));

    if (eVe.mode === 'addTests' && typeof (metaData['actionType']) !== 'undefined' && metaData['actionType'] === 'submitForm') {
        eVe.addAtestScenario(metaData['requestName'], JSON.stringify(datam), response);
    }
    else if (eVe.mode === 'runTests') {
        eVe.addAtestResult(metaData['requestName'], JSON.stringify(datam), response);
    }

    return true;

}


/**
*	Checks if we cached the exact same request
*/
eVe.isCached = function (requestName, datamStr, metaDataStr) {
    if (typeof (eVe.caches[requestName]) === 'undefined') {
        return false;
    }
    if (eVe.caches[requestName]['datamStr'] == datamStr && eVe.caches[requestName]['metaDataStr'] == metaDataStr) {
        return eVe.caches[requestName]['response'];
    }
    return false;
}


//--------------------  end: Ajax operations ------------------------------

//--------------------  begin: Tools ------------------------------


/**
*	Gets array of own properties
*/
eVe.getProperties = function (obj) {
    let props = [];
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            props.push(obj[key]);
        }
    }

    if (props.length > 0) {
        return props;
    }

    return 0;

}


/*
	The result of this method is eVe.dumpStr a global object
	
	recursive eVe.dumpAssoc(name, obj) limited to eVe.dumpAssocLimit objects 
	and eVe.dumpAssocLimit rows
	let eVe.dumpStr must be global and set to '' before calling eVe.dumpAssoc(name, obj)
	lets eVe.dumpCountObj and eVe.dumpCountRows must be global and set to 0 before calling eVe.dumpAssoc(name, obj)
	Example: If you want to dump countries : 
		set to any number: eVe.dumpAssocLimit = 1000; 
		reset:  eVe.dumpStr = '';
		reset: eVe.dumpCountObj = 0;
		reset: eVe.dumpCountRows = 0;

		eVe.dumpAssoc('countries', countries);
		console.log(eVe.dumpStr);
*/
eVe.dumpAssoc = function (name, obj) {
    eVe.dumpStr += "Name: " + name;

    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            let row = obj[key];
            // if object
            if (typeof (row) == 'object') {
                // if array : 	if( typeof(row.length) != 'undefined')
                eVe.dumpCountObj++;
                if (eVe.dumpCountObj > eVe.dumpAssocLimit) {
                    alert('Reached to overall limit ' + eVe.dumpAssocLimit + ' rows at object: ' + name);
                    return false;
                }
                eVe.dumpAssoc(key, row);
            }
            else {
                eVe.dumpCountRows++;
                if (eVe.dumpCountRows > eVe.dumpAssocLimit) {
                    alert('Stopping at row ' + eVe.dumpAssocLimit + '. Object: ' + name);
                    return false;
                }
                eVe.dumpStr += key + ' : ' + row + "\n";
            }
        }
    }

    return true;

}


/*
*
*/
eVe.hideNseekThat = function (elid) {
    let el = document.getElementById(elid);
    if (el.style.display == 'block') {
        el.style.display = 'none';
    }
    else if (el.style.display == 'none') {
        el.style.display = 'block';
    }
    else {
        el.style.display = 'none';
    }

    return true;
}


/* 
	Applies to next 1 sibling of el only
*/
eVe.hideNseekNext = function (el) {
    let index1 = eVe.findIndex(el);
    let next1 = el.parentNode.children[index1 + 1];
    if (!next1) {
        return false;
    }

    if (el.innerHTML.substring(0, 3) == ' + ') {
        next1.style.display = 'block';
        el.innerHTML = ' - ' + el.innerHTML.substring(3);
    }
    else {
        next1.style.display = 'none';
        el.innerHTML = ' + ' + el.innerHTML.substring(3);
    }

    return true;

}



/* 
	This is very spesific hideNseek. Example usage is part 1 of register1_form
	hideNseek applies to element id='inlinekids' 
	el is hideNseek button element (which is clicked to expand or collapse all next siblings).
	el.innerHTML.substr(1) is either + or -

*/
eVe.hideNseekSiblings = function (el, parent1) {

    if (parent1) {
        el = parent1.children[0].children[0];
    }
    else {
        parent1 = el.parentNode.parentNode;
    }
    let kids = parent1.children;

    if (!kids) {
        return false;
    }

    let kid, action;

    if (el.innerHTML.substring(0, 3) == ' + ') {
        action = 'expand';
        el.innerHTML = ' - ' + el.innerHTML.substring(3);
    }
    else {
        action = 'collapse';
        el.innerHTML = ' + ' + el.innerHTML.substring(3);
    }


    let len1, width1;
    // kids[0] is hideNseek div
    for (i = 1; i < kids.length; i++) {
        kid = kids[i];

        if (action == 'expand') {
            kid.style.display = 'block';
        }
        else {
            kid.style.display = 'none';
        }
    }

    return true;
}


/**
* 
*/
eVe.findIndex = function (el) {
    let parent1 = el.parentNode;
    let kids = parent1.children;
    let index1 = -1;
    for (i = 0; i < kids.length; i++) {
        if (kids[i] == el) {
            index1 = i;
            break;
        }
    }

    return index1;

}



//--------------------  end: Tools ------------------------------

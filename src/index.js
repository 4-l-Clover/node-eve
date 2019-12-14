import 'babel-polyfill';

if (typeof window.eVe !== 'object') {
  window.eVe = {};
}

eVe.caches = {};
eVe.mode = 'tests';
eVe.testStarted = '';
eVe.countTests = 0;
eVe.testsNotCompleted = [];
eVe.FailedTests = {};
eVe.countSuccessfulTests = 0;
eVe.CountFailedTests = 0;
eVe.testsToRun = {};

import './test-module.js';
import './scenarios-module.js';
import './running-module.js';

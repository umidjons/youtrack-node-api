'use strict';

const config = require('./config.json');
const Issue = require('./src/Issue');

let issue = new Issue(config);
//issue.getAccessToken();
issue.login();
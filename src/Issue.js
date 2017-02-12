'use strict';

const request = require('request-promise');
const debug = require('debug')('youtrack:Issue');
const moment = require('moment');
const qs = require('querystring');
const Base = require('./Base');

debug.log = console.log.bind(console);

class Issue extends Base {
    constructor(config) {
        super(config);
    }

    create(params = {project: '', summary: '', description: '', attachments: [], permittedGroup: ''}) {

    }
}

module.exports = Issue;
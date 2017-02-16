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

    async create(params = {project: '', summary: '', description: '', attachments: [], permittedGroup: ''}) {
        let opts = {
            method: 'PUT',
            url: this._getUrl('issue', params),
            jar: this.jar,
            headers: this._getHeaders(),
            resolveWithFullResponse: true
        };

        //debug('create() opts=', opts);

        let response = null;
        try {
            response = await this.request(opts);
        } catch (err) {
            debug('create() err=', err);
            return false;
        }

        debug('create() response=', response.statusCode, response.statusMessage);

        return response && response.statusCode == 201 && response.statusMessage == 'Created';
    }
}

module.exports = Issue;
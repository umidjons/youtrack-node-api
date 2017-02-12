'use strict';

const request = require('request-promise');
const debug = require('debug')('youtrack:Base');
const moment = require('moment');
const qs = require('querystring');

debug.log = console.log.bind(console);

class Base {
    constructor(config) {
        this.config = config;
        this.baseUrl = this.config.baseUrl;
        this.accessToken = null;
        this.tokenType = null;
        this.request = request.defaults({jar: true});
        this.jar = this.request.jar();
    }

    async login() {
        let params = {
            url: this._getUrl('user/login'),
            jar: this.jar,
            form: this.config.credentials
        };

        let response = await this.request.post(params);
        debug('login() response=', response);

        this.authCookie = this.jar.getCookieString(params.url);
        debug('login() authCookie=', this.authCookie);

        return response === '<login>ok</login>';
    }

    /**
     * Gets access token by Client Service ID and Client Service Secret values.
     */
    async getAccessToken() {
        // generate Base64(CLIENT_SERVICE_ID:CLIENT_SERVICE_SECRET) Authorization value
        let authValue = (new Buffer(`${this.config.oauth2.clientServiceId}:${this.config.oauth2.clientServiceSecret}`))
            .toString('base64');

        let params = {
            url: this.config.oauth2.url,
            headers: {
                Accept: 'application/json',
                Authorization: 'Basic ' + authValue
            },
            form: {grant_type: 'client_credentials', scope: this.config.oauth2.scope}
        };

        let response = await this.request.post(params);
        debug('getAccessToken() response=%O', response);

        response = JSON.parse(response);

        this.tokenType = response.token_type;
        this.accessToken = response.access_token;

        return response;
    }

    _getHeaders() {
        let headers = {Accept: 'application/json'};

        // set access token if exists
        if (this.accessToken)
            headers.Authorization = this.tokenType + ' ' + this.accessToken;

        return headers;
    }

    _getUrl(path, params = null) {
        let _path = path.startsWith('/') ? path : `/${path}`;
        let _url = `${this.baseUrl}/rest${_path}`;
        if (params) {
            params = qs.stringify(params);
            _url += '?' + params;
        }
        return _url;
    }
}

module.exports = Base;
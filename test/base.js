'use strict';

const chai = require('chai');
const promised = require('chai-as-promised');
chai.use(promised);
const expect = chai.expect;
const sinon = require('sinon');

const Base = require('../src/Base');

describe('Base class', function () {
    let base = null;
    let config = {
        baseUrl: 'my-base-url',
        oauth2: {
            url: "https://hope.myjetbrains.com/hub/api/rest/oauth2/token",
            clientServiceId: "6feb3de5-0040-43c9-bf3e-3c4a2250ba02",
            clientServiceSecret: "73f1de66-9ece-4408-84d3-cf683a0a614e",
            scope: "6feb3de5-0040-43c9-bf3e-3c4a2250ba02"
        }
    };

    beforeEach(function () {
        base = new Base(config);
    });

    it('Base.constructor() with valid configuration', function () {
        expect(base.config).to.equal(config);
        expect(base.baseUrl).to.equal(config.baseUrl);
        expect(base.accessToken).to.be.a('null');
        expect(base.tokenType).to.be.a('null');
    });

    it('Base._getUrl() starts without slash - issue', function () {
        expect(base._getUrl('issue')).to.equal(config.baseUrl + '/rest/issue');
    });

    it('Base._getUrl() starts with slash - /issue', function () {
        expect(base._getUrl('/issue')).to.equal(config.baseUrl + '/rest/issue');
    });

    it('Base._getUrl() /issue with parameters', function () {
        expect(base._getUrl('/issue', {a: 'b', c: 'd'})).to.equal(config.baseUrl + '/rest/issue?a=b&c=d');
    });

    it('Base._getUrl() /issue with parameters with null value', function () {
        expect(base._getUrl('/issue', {a: 'b', c: 'd', e: null})).to.equal(config.baseUrl + '/rest/issue?a=b&c=d&e=');
    });

    it('Base._getHeaders() should return Accept header', function () {
        let headers = base._getHeaders();
        expect(headers).to.be.an('object');
        expect(headers).to.have.property('Accept', 'application/json');
    });

    it('Base._getHeaders() should not return Authorization header when accessToken=null', function () {
        let headers = base._getHeaders();
        expect(headers).to.be.an('object');
        expect(headers).to.not.have.property('Authorization');
    });

    it('Base._getHeaders() should return Authorization header when accessToken=value', function () {
        base.accessToken = 'foo';
        base.tokenType = 'bar';
        let headers = base._getHeaders();
        expect(headers).to.be.an('object');
        expect(headers).to.have.property('Authorization', 'bar foo');
    });

    it('Base.getAccessToken() should return response object', async function () {
        let returnValue = '{"access_token":"1486889760217.6feb3de5-0040-43c9-bf3e-3c4a2250ba02..6feb3de5-0040-43c9-bf3e-3c4a2250ba02;1.MC0CFQCPfqXphP7Rlm1VYd5olf08W33qowIUSnXsq/hfyydfnuwrOYXoVB8z12g=","token_type":"Bearer","expires_in":3600,"scope":"6feb3de5-0040-43c9-bf3e-3c4a2250ba02"}';
        let stub = sinon.stub(base.request, 'post').returns(returnValue);

        let response = await base.getAccessToken();
        expect(response).to.be.an('object');
        expect(response).to.have.property('access_token');
        expect(base.tokenType).to.equal('Bearer');
        expect(base.accessToken).to.equal('1486889760217.6feb3de5-0040-43c9-bf3e-3c4a2250ba02..6feb3de5-0040-43c9-bf3e-3c4a2250ba02;1.MC0CFQCPfqXphP7Rlm1VYd5olf08W33qowIUSnXsq/hfyydfnuwrOYXoVB8z12g=');

        stub.restore();
    });

    it('Base.login() with valid credentials should return true', async function () {
        let cookie = 'JSESSIONID=19x1ypkn5s33c1rttq2wx4q7ne; jetbrains.charisma.main.security.PRINCIPAL=NGJhMDgzMzY4NTYzMjhhZDM2YWQ0MzMzNTNmYWFkZmJmM2FlYjg4ZGE2Yzc1NjM0ODczOTk1ZDZiYzY1NTNjZDpyb290';
        let returnValue = '<login>ok</login>';
        let stub = sinon.stub(base.request, 'post').returns(returnValue);
        let stubCookie = sinon.stub(base.jar, 'getCookieString').returns(cookie);

        let response = await base.login();
        expect(response).to.be.true;
        expect(base.authCookie).to.equal(cookie);

        stubCookie.restore();
        stub.restore();
    });

    it('Base.login() with invalid credentials should throw error', async function () {
        let returnValue = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><error>Incorrect login or password.</error>';
        let stub = sinon.stub(base.request, 'post').returns(returnValue);

        expect(base.login()).to.be.rejectedWith(Error, 'Incorrect login or password.');

        stub.restore();
    });

    it('Base.login() with unexpected response should throw error', async function () {
        let returnValue = 'something unexpected';
        let stub = sinon.stub(base.request, 'post').returns(returnValue);

        expect(base.login()).to.be.rejectedWith(Error, 'Got unexpected response.');

        stub.restore();
    });
});
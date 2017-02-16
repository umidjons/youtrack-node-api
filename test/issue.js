'use strict';

const chai = require('chai');
const promised = require('chai-as-promised');
chai.use(promised);
const expect = chai.expect;
const sinon = require('sinon');

const Issue = require('../src/Issue');

describe('Issue class', function () {
    let issue = null;
    let config = require('../config.json');

    beforeEach(function () {
        issue = new Issue(config);
    });

    it('Issue.create() creating issue without login will throw error and will return false', async function () {
        let stub = sinon.stub(issue, 'request').returns(Promise.reject(new Error('{"value":"You are not logged in."}')));

        let response = await issue.create({
            project: 'SP',
            summary: 'This is summary',
            description: 'This is description'
        });

        expect(issue.authCookie).to.be.undefined;
        expect(response).to.be.false;

        stub.restore();
    });

    it('Issue.create() creating issue after login won`t throw error and will return true', async function () {
        let stub = sinon.stub(issue, 'request').returns(Promise.resolve({statusCode: 201, statusMessage: 'Created'}));

        let response = await issue.create({
            project: 'SP',
            summary: 'This is summary',
            description: 'This is description'
        });

        expect(response).to.be.true;

        stub.restore();
    });
});
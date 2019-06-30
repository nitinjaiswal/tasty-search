/*
  Author: Deepak Sharma
  github: https://github.com/deepaksharma2491
*/

'use strict';
const fs = require('fs');

var should = require('chai').should(),
  expect = require('chai').expect,
  supertest = require('supertest'),
  api = supertest('http://localhost:3000');
 
var testFiles = fs.readdirSync(__dirname);

var exceptFiles = ['init.js', 'auth.js'];

describe('/Post User Auth', () => {
	var userData = {
		token: ""
	};

	before((done) => {
		require('./auth.js').authenticate(done, userData)		
	})

	it('intiate testing', () => {
		console.log("-----------", userData)
		testFiles.forEach(function (file) {
			if (exceptFiles.indexOf(file) == -1) {
				console.log(file);
				describe("file currently being tested: " + file, () => {
					console.log("-------------")
				  require('./'+ file)(userData);
				})
			}
		})
	})
})

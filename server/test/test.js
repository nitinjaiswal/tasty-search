/*
  Author: Deepak Sharma
  github: https://github.com/deepaksharma2491
*/

var should = require('chai').should(),
  expect = require('chai').expect,
  supertest = require('supertest'),
  api = supertest('http://localhost:3000');

module.exports = (userData) => {
	describe('testUser Login', function () {

	  it('should return a 200 response', function (done) {
	    api.get('/v1/cropNotifications/cropNotifications/sssyList')
	        .set("Token", userData.token)
	        .query({
	        	"sssyID": "04012118"
	        })
	        .expect(200, done);
	  });

	  it('should be an object with keys and values', function (done) {

	  	api.get('/v1/cropNotifications/cropNotifications/sssyList')
	  	    .set("Token", userData.token)
	  	    .query({
	  	    	"sssyID": "04012118"
	  	    })
	  	    .expect(200)
	  	    .end((err, res) => {
	  	    	expect(res).to.have.property("body");
	  	    	expect(res.body).to.not.equal(undefined);
	  	    	expect(res.body.status).to.not.equal(false);
	  	    	expect(res.body.data).to.be.an('array').to.not.be.empty;

	  	    	done();
	  	    });
	  });

	});
}
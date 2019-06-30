/*
  Author: Deepak Sharma
  github: https://github.com/deepaksharma2491
*/

var should = require('chai').should(),
  expect = require('chai').expect,
  supertest = require('supertest'),
  api = supertest('http://localhost:3000');

module.exports = {
	authenticate: (done, userData) => {
		var userName = "9000000176";
		var password = "e7c9cf611ced90a8cd2584cd51765de1b4020a3dbf2864ec00405fb7b62a4d8644a3c84cb3bccfe17a515e43c4a9be888e97b25d78fe05efbcc772f0a175ae21";

		return api.post('/v1/user/user/sendUserOtp')
		.set("content-type", "application/json")
		.set("cache-control", "no-cache")
		.send({ 
			username: userName, 
			password: password,
			otpType: 'SMS' })
		.expect(200)
		.end((err, res) => {
			expect(res).to.have.property("body");
			expect(res.body).to.not.equal(undefined);
			expect(res.body).to.have.property("data");
			expect(res.body.data).to.not.equal(null);
			expect(res.body.data).to.have.property("otp");

			return api.post("/v1/user/user/login")
				.set("content-type", "application/json")
				.set("cache-control", "no-cache")
				.send({
					mobile: userName,
					password: password,
					otp: res.body.data.otp,
					deviceType: 'web'
				})
				.expect(200)
				.end((err, res) => {
					expect(res).to.have.property("body");
					expect(res.body).to.not.equal(undefined);
					expect(res.body).to.have.property("data");
					expect(res.body.data).to.not.equal(null);
					expect(res.body.data).to.have.property("token");

					userData.token = res.body.data.token

					done();
				})
		})
	}
}

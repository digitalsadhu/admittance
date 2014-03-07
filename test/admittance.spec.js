'use strict';

var expect      = require('chai').expect
  , admittance  = require('../admittance.js')

//do a permissions check
describe('admittance', function () {

  it('should return true when a user has a given permission', function () {
    admittance.load({1:'admin'});
    var userid = 1;
    expect(admittance(userid).is('admin')).to.equal(true);
  })

  it('should return false when a user does not have a given permission', function () {
    admittance.load({1: 'admin'});
    var userid = 1;
    expect(admittance(userid).is('monkey')).to.equal(false);
  })

  it('should return true when a user has several permissions assigned', function () {
    admittance.load({1: ['admin', 'subscriber']});
    var userid = 1;
    expect(admittance(userid).is('admin')).to.equal(true);
    expect(admittance(userid).is('subscriber')).to.equal(true);
    expect(admittance(userid).is('monkey')).to.equal(false);
  })

})

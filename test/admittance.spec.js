'use strict';

var expect      = require('chai').expect
  , admittance  = require('../admittance.js')
  , rewire      = require('rewire')
  , admitRewire = rewire('../admittance.js')

//do a permissions check
describe('admittance', function () {

  describe('checking permissions', function () {

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

    it('should return false if userid is undefined or null', function () {
      admittance.load({1: ['admin', 'subscriber']});
      var userid;
      expect(admittance(userid).is('admin')).to.equal(false);
      userid = null;
      expect(admittance(userid).is('admin')).to.equal(false);
    })

    it('should return false if permission is empty', function () {
      admittance.load({1: ['admin', 'subscriber']});
      var userid = 1;
      expect(admittance(userid).is('')).to.equal(false);
    })

    it('should return false if is is called with no parameter', function () {
      admittance.load({1: ['admin', 'subscriber']});
      var userid = 1;
      expect(admittance(userid).is()).to.equal(false);
    })

  })

  describe('nested permissions hierarchies', function () {

    it('should return true if a user has been assigned a parent permission of a checked permission', function () {
      var permissions = {
        'admin': 'subscriber',
        1: 'admin'
      }
      admittance.load(permissions);
      var userid = 1;
      expect(admittance(userid).is('subscriber')).to.equal(true);
    })

  })

  describe('#getAllChildren method', function () {

    it('should get all children from a permissions tree', function () {
      var getAllChildren  = admitRewire.__get__('getAllChildren')
        , permissions     = {
        'admin': 'editor',
        'editor': 'subscriber',
        'superadmin': ['admin', 'user']
      }

      admitRewire.load(permissions)

      var allChildren = getAllChildren('superadmin')

      expect(allChildren[0]).to.equal('admin')
      expect(allChildren[1]).to.equal('user')
      expect(allChildren[2]).to.equal('editor')
      expect(allChildren[3]).to.equal('subscriber')

    })

  })

  describe('#checkIsParent method', function () {

    it('should return true if a permission is a child of a given parent', function () {

      var checkIsParent   = admitRewire.__get__('checkIsParent')
        , permissions     = {
        'admin': 'editor',
        'editor': 'subscriber',
        'superadmin': ['admin', 'user']
      }

      admitRewire.load(permissions)

      expect(checkIsParent('admin', 'admin')).to.equal(false)
      expect(checkIsParent('admin', 'editor')).to.equal(true)
      expect(checkIsParent('admin', 'subscriber')).to.equal(true)
      expect(checkIsParent('superadmin', 'subscriber')).to.equal(true)
      expect(checkIsParent('user', 'editor')).to.equal(false)

    })

  })

  describe('#getDirectChildren method', function () {

    it('should return immediate children for given parent', function () {

      var getDirectChildren   = admitRewire.__get__('getDirectChildren')
        , children
        , permissions         = {
        'admin': 'editor',
        'editor': 'subscriber',
        'superadmin': ['admin', 'user']
      }

      admitRewire.load(permissions)

      children = getDirectChildren('superadmin')
      expect(children[0]).to.equal('admin')
      expect(children[1]).to.equal('user')
      expect(children.length).to.equal(2)

      children = getDirectChildren('admin')
      expect(children[0]).to.equal('editor')
      expect(children.length).to.equal(1)

    })

  })

  describe('#getUserPermissions method', function () {

    it('should return given users permissions', function () {

      var getUserPermissions  = admitRewire.__get__('getUserPermissions')
        , userPermissions
        , permissions         = {
        'admin': 'editor',
        'editor': 'subscriber',
        'superadmin': ['admin', 'user'],
        1: 'editor',
        2: 'superadmin'
      }

      admitRewire.load(permissions)

      userPermissions = getUserPermissions(1)
      expect(userPermissions).to.contain('editor');
      expect(userPermissions).not.to.contain('admin');

      userPermissions = getUserPermissions(2)
      expect(userPermissions).to.contain('superadmin');

    })

  })

  describe('#getDirectPermissionChildren method', function () {

    it('should return immediate children for given permission', function () {

      var getDirectPermissionChildren = admitRewire.__get__('getDirectPermissionChildren')
        , directPermissions
        , permissions                 = {
        'admin': 'editor',
        'editor': 'subscriber',
        'superadmin': ['admin', 'user']
      }

      admitRewire.load(permissions)

      directPermissions = getDirectPermissionChildren('superadmin')
      expect(directPermissions).to.contain('admin');
      expect(directPermissions).to.contain('user');
      expect(directPermissions).not.to.contain('editor');

    })

  })

  describe('#checkAccess method', function () {

    it('should return true if a given user has (directly or indirectly) a given permission', function () {

      var checkAccess   = admitRewire.__get__('checkAccess')
        , permissions   = {
        'admin': 'editor',
        'editor': 'subscriber',
        'superadmin': ['admin', 'user'],
        1: 'editor',
        2: 'superadmin'
      }

      admitRewire.load(permissions)

      expect(checkAccess(2, 'superadmin')).to.equal(true)

    })

  })

  describe('#isnt method', function () {

    it('should return true if a given user does not have a given permission',
      function () {
      admitRewire.load({1: 'admin'})
      expect(admittance(1).isnt('editor')).to.equal(true)
    })

  })

  describe('#can method', function () {
    it('should return true when a user has a given permission', function () {
      admittance.load({1:'edit'});
      var userid = 1;
      expect(admittance(userid).can('edit')).to.equal(true);
    })
  })

  describe('#cant method', function () {

    it('should return true if a given user does not have a given permission',
      function () {
      admitRewire.load({1: 'admin'})
      expect(admittance(1).cant('editor')).to.equal(true)
    })

  })

  describe('#load method', function () {

    it('should load a permissions object',
      function () {
      admitRewire.load({1: 'admin'})
      expect(admitRewire.__get__('permissions')).to.be.an('object')
      expect(admitRewire.__get__('permissions')['1']).to.equal('admin')
    })

  })

})


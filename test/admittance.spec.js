'use strict';

var expect      = require('chai').expect
  , admittance  = require('../admittance.js')
  , rewire      = require('rewire')
  , admitRewire = rewire('../admittance.js')

//do a permissions check
describe('admittance', function () {

  describe('checking permissions', function () {

    it('should return true when a user has a given permission', function () {
      var user = admittance({}, {1:'admin'})
      var userid = 1
      expect(user(userid).is('admin')).to.equal(true)
    })

    it('should return false when a user does not have a given permission', function () {
      var user = admittance({}, {1: 'admin'})
      var userid = 1
      expect(user(userid).is('monkey')).to.equal(false)
    })

    it('should return true when a user has several permissions assigned', function () {
      var user = admittance({}, {1: ['admin', 'subscriber']})
      var userid = 1
      expect(user(userid).is('admin')).to.equal(true)
      expect(user(userid).is('subscriber')).to.equal(true)
      expect(user(userid).is('monkey')).to.equal(false)
    })

    it('should return false if userid is undefined or null', function () {
      var user = admittance({}, {1: ['admin', 'subscriber']})
      var userid
      expect(user(userid).is('admin')).to.equal(false)
      userid = null
      expect(user(userid).is('admin')).to.equal(false)
    })

    it('should return false if permission is empty', function () {
      var user = admittance({}, {1: ['admin', 'subscriber']})
      var userid = 1
      expect(user(userid).is('')).to.equal(false)
    })

    it('should return false if is is called with no parameter', function () {
      var user = admittance({}, {1: ['admin', 'subscriber']})
      var userid = 1
      expect(user(userid).is()).to.equal(false)
    })

  })

  describe('nested permissions hierarchies', function () {

    it('should return true if a user has been assigned a parent permission of a checked permission', function () {
      var permissions = {
        'admin': 'subscriber'
      }
      var user = admittance(permissions, {1: 'admin'})
      var userid = 1
      expect(user(userid).is('subscriber')).to.equal(true)
    })

  })

  describe('#getDirectChildren method', function () {

    it('should return immediate children for given parent', function () {

      var getDirectChildren   = admitRewire.__get__('getDirectChildren')
        , children

      var permissions = {
        'admin': 'editor',
        'editor': 'subscriber',
        'superadmin': ['admin', 'user']
      }

      children = getDirectChildren(permissions, 'superadmin')
      expect(children[0]).to.equal('admin')
      expect(children[1]).to.equal('user')
      expect(children.length).to.equal(2)

      children = getDirectChildren(permissions, 'admin')
      expect(children[0]).to.equal('editor')
      expect(children.length).to.equal(1)

    })

  })

  describe('#getUserPermissions method', function () {

    it('should return given users permissions', function () {

      var getUserPermissions  = admitRewire.__get__('getUserPermissions')
        , userPermissions

      var assignments = {
        1: 'editor',
        2: 'superadmin'
      }

      userPermissions = getUserPermissions(assignments, 1)
      expect(userPermissions).to.contain('editor')
      expect(userPermissions).not.to.contain('admin')

      userPermissions = getUserPermissions(assignments, 2)
      expect(userPermissions).to.contain('superadmin')

    })

  })

  describe('#getDirectPermissionChildren method', function () {

    it('should return immediate children for given permission', function () {

      var getDirectPermissionChildren = admitRewire.__get__('getDirectPermissionChildren')
        , directPermissions

      var permissions = {
        'admin': 'editor',
        'editor': 'subscriber',
        'superadmin': ['admin', 'user']
      }

      directPermissions = getDirectPermissionChildren(permissions, 'superadmin')
      expect(directPermissions).to.contain('admin')
      expect(directPermissions).to.contain('user')
      expect(directPermissions).not.to.contain('editor')

    })

  })

  describe('#getAllChildren method', function () {

    it('should get all children from a permissions tree', function () {
      var getAllChildren  = admitRewire.__get__('getAllChildren')

      var permissions = {
        'admin': 'editor',
        'editor': 'subscriber',
        'superadmin': ['admin', 'user']
      }

      var allChildren = getAllChildren(permissions, 'superadmin')

      expect(allChildren[0]).to.equal('admin')
      expect(allChildren[1]).to.equal('user')

      expect(allChildren[2]).to.equal('editor')
      expect(allChildren[3]).to.equal('subscriber')

    })

  })

  describe('#checkIsParent method', function () {

    it('should return true if a permission is a child of a given parent', function () {

      var checkIsParent = admitRewire.__get__('checkIsParent')

      var permissions = {
        'admin': 'editor',
        'editor': 'subscriber',
        'superadmin': ['admin', 'user']
      }

      expect(checkIsParent(permissions, 'admin', 'admin')).to.equal(false)
      expect(checkIsParent(permissions, 'admin', 'editor')).to.equal(true)
      expect(checkIsParent(permissions, 'admin', 'subscriber')).to.equal(true)
      expect(checkIsParent(permissions, 'superadmin', 'subscriber')).to.equal(true)
      expect(checkIsParent(permissions, 'user', 'editor')).to.equal(false)

    })

  })

  describe('#checkAccess method', function () {

    it('should return true if a given user has (directly or indirectly) a given permission', function () {

      var checkAccess = admitRewire.__get__('checkAccess')

      var permissions = {
        'admin': 'editor',
        'editor': 'subscriber',
        'superadmin': ['admin', 'user']
      }

      var assignments = {
        1: 'editor',
        2: 'superadmin'
      }

      expect(checkAccess(permissions, assignments, 2, 'superadmin')).to.equal(true)

    })

  })

  describe('#isnt method', function () {

    it('should return true if a given user does not have a given permission',
      function () {
      var user = admittance({}, {1: 'admin'})
      expect(user(1).isnt('editor')).to.equal(true)
      expect(user(1).isnt('admin', 2)).to.equal(true)
      expect(user(1).isnt('admin', 1)).to.equal(false)
    })

  })

  describe('#can method', function () {
    it('should return true when a user has a given permission', function () {
      var user = admittance({}, {1:'edit'})
      var userid = 1
      expect(user(userid).can('edit')).to.equal(true)
    })
  })

  describe('#cant method', function () {

    it('should return true if a given user does not have a given permission',
      function () {
      var user = admittance({}, {1: 'admin'})
      expect(user(1).cant('editor')).to.equal(true)
      expect(user(1).cant('admin', 2)).to.equal(true)
      expect(user(1).cant('admin', 1)).to.equal(false)
    })

  })

  describe('#checkExpression function', function () {

    describe('passing an id to verify', function () {

      it('should return true if id matches userid', function () {
        var checkExpression = admitRewire.__get__('checkExpression')
        expect(checkExpression(1, 1)).to.equal(true)
      })

      it('should return false if id doesnt match userid', function () {
        var checkExpression = admitRewire.__get__('checkExpression')
        expect(checkExpression(1, 2)).to.equal(false)
      })

    })

    describe('passing nothing as second parameter', function () {

      it('should return true', function () {
        var checkExpression = admitRewire.__get__('checkExpression')
        expect(checkExpression(1)).to.equal(true)
      })

    })

    describe('passing an expression to verify', function () {

      it('should return true if the expression resolves to true', function () {
        var checkExpression = admitRewire.__get__('checkExpression')
        expect(checkExpression(1, 1 === 1)).to.equal(true)
      })

      it('should return false if the expression resolves to false', function () {
        var checkExpression = admitRewire.__get__('checkExpression')
        expect(checkExpression(1, 1 === 2)).to.equal(false)
      })

    })

  })

  describe('multiple admittance instances', function () {
    it('can be created at one time', function () {

      var user1 = admittance({}, {1: 'admin'})
      expect(user1(1).is('admin')).to.equal(true)

      var user2 = admittance({}, {1: 'user'})
      expect(user2(1).is('user')).to.equal(true)
    })
  })

  describe('business rule checking', function () {

    describe('id match checking', function () {

      it('should behave as normal if no matchingId param is provided', function () {
        var user = admittance({}, {1: 'admin'})
        expect(user(1).is('admin')).to.equal(true)
      })

      it('should verify that ids match if matchingId param is provided', function () {

        var user = admittance({}, {1: 'admin'})
        expect(user(1).is('admin', 1)).to.equal(true)
        expect(user(1).is('admin', 2)).to.equal(false)
      })

    })

    describe('expression checking', function () {
      it('should return false if the given expression returns false', function () {
        var user = admittance({}, {1: 'admin'})
        expect(user(1).is('admin', 1 === 2)).to.equal(false)
      })
      it('should return true if the given expression returns true', function () {
        var user = admittance({}, {1: 'admin'})
        expect(user(1).is('admin', 1 === 1)).to.equal(true)
        expect(user(1).is('editor', 1 === 1)).to.equal(false)
      })
    })

  })

})


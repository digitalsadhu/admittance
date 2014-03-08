'use strict';

var util = require('util')

var permissions = {}

var getDirectChildren = function (parent) {

  var perm = permissions[parent]

  if (typeof perm === 'undefined' || perm === null) perm = []

  if (!util.isArray(perm)) perm = [perm]

  return perm
}

var getUserPermissions = function (userid) {

  return getDirectChildren(userid)

}

var getDirectPermissionChildren = function (parentPermission) {

  return getDirectChildren(parentPermission)

}

var getAllChildren = function (parentPermission) {

  var directChildren = getDirectPermissionChildren(parentPermission)

  if (directChildren.length === 0) return []

  var childrensChildren = directChildren.reduce(
    function (prevDirectChild, currDirectChild) {
      return prevDirectChild.concat(getAllChildren(currDirectChild))
    },
    []
  )

  return directChildren.concat(childrensChildren)

}

var checkIsParent = function (parentPermission, childPermission) {

  if (parentPermission === childPermission)
    return false

  var children = getAllChildren(parentPermission)

  for (var i = 0; i < children.length; i++) {
    if (children[i] === childPermission)
      return true
  }

  return false
}

var checkAccess = function (userid, permission) {

  var userPermissions = getUserPermissions(userid)

  for (var i = 0; i < userPermissions.length; i++) {

    if (userPermissions[i] === permission)
      return true

    if (checkIsParent(userPermissions[i], permission))
      return true
  }

  return false
}

var admittance = function (userid) {
  return {
    is: function (permission) {
      return checkAccess(userid, permission)
    },
    isnt: function (permission) {
      return !checkAccess(userid, permission)
    },
    can: function (permission) {
      return checkAccess(userid, permission)
    },
    cant: function (permission) {
      return !checkAccess(userid, permission)
    }
  }
}

admittance.load = function (permissionData) {
  permissions = permissionData
}

module.exports = admittance

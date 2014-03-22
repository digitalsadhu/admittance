'use strict';

var util = require('util')

var getDirectChildren = function (permissions, parent) {
  var perm = permissions[parent]
  if (typeof perm === 'undefined' || perm === null) perm = []
  if (!util.isArray(perm)) perm = [perm]
  return perm
}

var getUserPermissions = function (assignments, userid) {
  var assigns = assignments[userid]
  if (typeof assigns === 'undefined' || assigns === null) assigns = []
  if (!util.isArray(assigns)) assigns = [assigns]
  return assigns
}

var getDirectPermissionChildren = function (permissions, parentPermission) {
  return getDirectChildren(permissions, parentPermission)
}

var getAllChildren = function (permissions, parentPermission) {
  var directChildren = getDirectPermissionChildren(permissions, parentPermission)
  if (directChildren.length === 0) return []
  var childrensChildren = directChildren.reduce(
    function (prevDirectChild, currDirectChild) {
      return prevDirectChild.concat(getAllChildren(permissions, currDirectChild))
    },
    []
  )
  return directChildren.concat(childrensChildren)
}

var checkIsParent = function (permissions, parentPermission, childPermission) {
  if (parentPermission === childPermission)
    return false
  var children = getAllChildren(permissions, parentPermission)
  for (var i = 0; i < children.length; i++) {
    if (children[i] === childPermission)
      return true
  }
  return false
}

var checkAccess = function (permissions, assignments, userid, permission) {
  var userPermissions = getUserPermissions(assignments, userid)
  for (var i = 0; i < userPermissions.length; i++) {
    if (userPermissions[i] === permission)
      return true
    if (checkIsParent(permissions, userPermissions[i], permission))
      return true
  }
  return false
}

var admittance = function (permissions, assignments) {
  return function (userid) {
    return {
      is: function (permission) {
        return checkAccess(permissions, assignments, userid, permission)
      },
      isnt: function (permission) {
        return !checkAccess(permissions, assignments, userid, permission)
      },
      can: function (permission) {
        return checkAccess(permissions, assignments, userid, permission)
      },
      cant: function (permission) {
        return !checkAccess(permissions, assignments, userid, permission)
      }
    }
  }
}

module.exports = admittance

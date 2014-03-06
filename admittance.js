'use strict';

var util = require('util')

var permissions = {}

var admittance = function (userid) {
  return {
    is: function (permission) {

      if (util.isArray(permissions[userid]))
        if (permissions[userid].indexOf(permission) !== -1) return true

      return permissions[userid] === permission
    }
  }
}

admittance.load = function (permissionData) {
  permissions = permissionData
}

module.exports = admittance

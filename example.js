'use strict';

var permissionData  = require('./permissions.json')
  , admittance      = require('./admittance.js')
 
admittance.load(permissionData);

var userid = 1;

//do a permissions check
if (admittance(userid).is('admin')) {
    //yay, user is admin!
}

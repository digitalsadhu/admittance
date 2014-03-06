'use strict';

var fs              = require('fs')
  , admittance      = require('admittance')
 
//read from the text file where we store pairs of user ids and permissions
var storeR = fs.createReadStream(__dirname + '/my-store.txt')
 
//read in permissions
storeR.pipe(admittance)
 
var userid = 1;

//do a permissions check
if (admittance(userid).is('admin')) {
    //yay, user is admin!
}
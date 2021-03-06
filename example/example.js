'use strict';

//require admittance and example json permissions file
var permissionData  = require('./example-permissions.json')
  , assignmentData  = require('./example-assignments.json')
  , admittance      = require('../admittance.js')

//load in permissions from json permissions file. This could easily be loaded
//from a db instead
var user = admittance(permissionData, assignmentData)

//do permissions checks

if (user(1).is('admin'))
  console.log('user 1 is an admin')

if (user(1).is('reportViewer'))
  console.log('user 1 is a report viewer')

if (user(1).is('editor'))
  console.log('user 1 is an editor since admin is a parent of editor')

if (user(1).is('user'))
  console.log('user 1 passes a user check since admin is a parent of user')

if (user(1).isnt('superadmin'))
  console.log('user 1 isnt a superadmin since superadmin is a parent of admin')

if (user(1).can('readPosts'))
  console.log('user 1 can read posts')

if (user(1).can('listPosts'))
  console.log('user 1 can list posts')

var post = {
  creator: 1
}

if (user(1).can('editPosts', post.creator))
  console.log('user 1 can edit the post because he/she created it')

if (user(1).can('editPosts', post.creator === 1))
  console.log('user 1 can edit the post because the given business rule passed')

if (user(1).can('deletePosts'))
  console.log('user 1 can delete posts')

if (user(1).can('manageUsers'))
  console.log('user 1 can manage users')

if (user(1).can('readReports'))
  console.log('user 1 can read reports')

if (user(1).can('listReports'))
  console.log('user 1 can list reports')

if (user(1).cant('eatCake'))
  console.log('user 1 cant eat cake since the cake is a lie')

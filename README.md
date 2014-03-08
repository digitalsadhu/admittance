[![Build Status](https://travis-ci.org/digitalsadhu/admittance.png?branch=master)](https://travis-ci.org/digitalsadhu/admittance) [![Coverage Status](https://coveralls.io/repos/digitalsadhu/admittance/badge.png)](https://coveralls.io/r/digitalsadhu/admittance)

[![NPM](https://nodei.co/npm/admittance.png?compact=true)](https://nodei.co/npm/admittance/)

# Admittance (Version 2)

* <a href="#intro">Intro</a>
* <a href="#usage">Usage</a>
* <a href="#writing-permissions">Writing permissions</a>
* <a href="#api">API</a>
* <a href="#tests">Tests</a>
* <a href="#example">Example</a>

<a name="intro"></a>
## Intro

This is a rewrite of the original incomplete V1 version of admittance. I decided that V1 was trying to do too much and that V2 should be as simple as possible, both in API and in what it actually does under the hood.

Admittance now reads permissions from plain old javascript objects. This, I think helps to keep the module doing just one thing. To load data you just need create javascript objects and store them somewhere. You could simply require a json file and load it. This also makes it very easy to work with a nosql db. Just get and set your permissions to the db.

<a name="usage"></a>
## Usage

### Super basic usage

```js
var admittance = require('admittance')

var permissions = {
  1: 'admin'
}

admittance.load(permissions)

admittance(1).is('admin') //true
admittance(1).isnt('admin') //false
```

### Full featured usage

```js
//require admittance and example json permissions file
var permissionData  = require('/some/example/permissions.json')
  , admittance      = require('admittance')

//load in permissions from json permissions file. This could easily be loaded
//from a db instead
admittance.load(permissionData);

//alias admittance as user for readability
var user = admittance;

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

if (user(1).can('editPosts'))
  console.log('user 1 can edit posts')

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
```

<a name="writing-permissions"></a>
## Writing permissions

Admittance expects a simple map from userids to permissions. Permissions are strings or array of strings. The strings are simply permission names that make sense for your application context.

example:

```js
{
  //Permissions structure. This is simple a key for a parent permission and
  //a value (either string or array) representing children permission(s)

  //"user" has children "readPosts" and "listPosts" which means a user can read
  //and list posts
  "user": [
    "readPosts",
    "listPosts"
  ],

  //"editor" has children "editPosts" and "deletePosts" and "user".
  //An editor can edit and delete posts as well as do anything a user can.
  //(In this case can read and list posts)
  "editor": [
    "user",
    "editPosts",
    "deletePosts"
  ],

  //"admin" is the parent of "editor" with the extra permission "manageUsers"
  "admin": [
    "manageUsers",
    "editor"
  ],

  //"superadmin" is an alias for admin since they essentially have the exact
  //same permissions
  "superadmin": "admin",

  //"reportViewer" is a separate permission with no direct relationship to
  //the other permissions
  "reportViewer": [
    "readReports",
    "listReports"
  ],

  //Assigning permissions to users.
  //Based on the above hierarchy we can assign permissions to given user ids

  //userid "1" is an "admin" and a "reportViewer"
  "1": ["admin", "reportViewer"],

  //userid "2" is an "editor"
  "2": "admin",

  //userid "3" is a "user"
  "3": "user"
}
```

<a name="api"></a>
## API

`admittance.load(object)`

Load permissions from a js object. See the "Writing permissions" section above
for how to write a permissions object

`admittance(id).is(permission)`

Test if a given 'id' can be matched with given 'permission'

`admittance(id).isnt(permission)`

Opposite of is. Equivalent of writing `!admittance(id).is(permission)`

`admittance(id).can(permission)`

Alias for is

`admittance(id).cant(permission)`

Alias for isnt

<a name="tests"></a>
## Tests

```js
npm install
npm test
```

<a name="example"></a>
## Example (see it in action by running the example)

```js
npm install
npm run example
```

[![Build Status](https://travis-ci.org/digitalsadhu/admittance.png?branch=master)](https://travis-ci.org/digitalsadhu/admittance) [![Coverage Status](https://coveralls.io/repos/digitalsadhu/admittance/badge.png)](https://coveralls.io/r/digitalsadhu/admittance)

[![NPM](https://nodei.co/npm/admittance.png?compact=true)](https://nodei.co/npm/admittance/)

# Admittance

* <a href="#intro">Intro</a>
* <a href="#usage">Usage</a>
* <a href="#writing-permissions">Writing permissions</a>
* <a href="#writing-assignments">Writing assignments</a>
* <a href="#business-rules">Business rules</a>
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
  'admin': 'subscriber'
}

var assignments = {
  1: 'admin'
}

var user = admittance(permissions, assignments)

user(1).is('admin') //true
user(1).isnt('admin') //false
```

### Full featured usage

```js
//require admittance and example json permissions file
var permissionData  = require('/some/example/permissions.json')
  , assignmentData  = require('/some/example/assignments.json')
  , admittance      = require('admittance')

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
```

<a name="writing-permissions"></a>
## Writing permissions

Permissions are strings or an array of strings. The strings are simply permission names that make sense for your application context. Permissions can be parents for other permissions and they in turn
can be parents to further permissions etc. Define these hierarchies however you see fit.
When it comes time to check, admittance with traverse your permission hierarchy to determine
if a given user has a given permission.

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
  ]

}
```

<a name="writing-assignments"></a>
## Writing assignments

Admittance expects a simple map from userids to permissions (defined in permissions map)
A userid can be assigned a single permission string or an array of permissions strings.

example:

```js
{
  //Assigning permissions to users.
  //Based on the permissions hierarchy we can assign permissions to given user ids

  //userid "1" is an "admin" and a "reportViewer"
  "1": ["admin", "reportViewer"],

  //userid "2" is an "editor"
  "2": "admin",

  //userid "3" is a "user"
  "3": "user"

}
```

<a name="business-rules"></a>
## Business rules

Business rules are extra tests relevant to your application that go along side
permission checks. An example of this is when you have a user that is allowed
to edit posts ONLY if he or she is the owner (creator) of that post.
Business rules allow you to provide such tests along side permissions checks.

### Simple id matching

A simple and useful way to solve the example above in admittance is to simply
pass a matching id as a second parameter to your check. Admittance will then
verify that this id matches the user id.

Heres an example of how that might look:

```js
var permissions = {
  'editPosts'
}

var assignments = {
  2: 'editPosts'
}

var check = admittance(permissions, assignments)

var user = {
  id: 2,
  name: 'Mr Banana'
}

var post = {
  id: 1
  owner: 2
}

check(user.id).can('editPosts', post.owner) //true

``` 

### Expression checking

Another simple way to add custom checks to specific checks is to pass an
expression that evaluates to true or false as a second parameter to `is`,
`can`, `isnt` or `cant`

Example:

```js
var permissions = {
  'editPosts'
}

var assignments = {
  2: 'editPosts'
}

var check = admittance(permissions, assignments)

var user = {
  id: 2,
  name: 'Mr Banana'
}

var post = {
  id: 1
  owner: 2
}

check(user.id).can('editPosts', post.owner === user.id) //true
```

<a name="api"></a>
## API

### admittanceModule(permissions, assignments)

Load permissions and assignments from js objects and return an admittance instance. See <a href="#writing-permissions">Writing permissions</a> and <a href="#writing-assignments">Writing assignments</a> for how to write permissions and assignments objects

Parameters:

- permissions `<object>`
- assignments `<object>`

Returns:

- admittance `<object>` - An `admittance` function that can be used to check permissions

Example:

```js
var admittanceModule = require('admittance')

var permissions = {
  'admin'
}

var assignments = {
  1: 'admin'
}

var admittance = admittanceModule(permissions, assignments)
```

### admittance(userid)

Parameters:

- userid `<string|int>`

Returns:

- `<object>` - An object with properties `is`, `isnt`, `can` and `cant`

Example:

```js
var userId = 1
admittance(userId) // object
```

#### .is(permission, [expression])

Test if an 'id' given as a parameter to `admittance` can be matched with given 'permission'
performing optional additional checks via a given `expression` or id

Parameters:

- permission `<string>` - the permission to check (eg. 'admin')
- [expression] `<string|int|bool>` - optionally, supply one of the following:
    - An expression that resolves to a boolean. eg. `user.id === post.owner`
    - A numeric string to match against `userid` eg. '1' (will internally be checked against userid)
    - A number to match against `userid` eg. 1 (will internally be checked against userid)

Returns:

- `<boolean>` - true if the given userid is said to have given permission and optionally the userid matches the given matchingid

Example:

```js
admittance(userid).is('admin') //true if user is an admin
admittance(userid).is('admin', 2) //true if user is an admin and userid === 2
admittance(userid).is('admin', '2') //true if user is an admin and userid === 2
admittance(userid).is('admin', 1 === 1) //true if user is an admin
admittance(userid).is('admin', 1 === 2) //false
```

#### .isnt(permission, [expression])

Opposite of `is`. Equivalent to negating a call to `is` 

Parameters:

- permission `<string>`
- [expression] `<string|int|bool>` - optionally, supply one of the following:
    - An expression that resolves to a boolean. eg. `user.id === post.owner`
    - A numeric string to match against `userid` eg. '1' (will internally be checked against userid)
    - A number to match against `userid` eg. 1 (will internally be checked against userid)

Returns:

- `<boolean>`

Example:

```js
admittance(userid).isnt('admin') //true if user isnt an admin
admittance(userid).isnt('admin', 2) //false if userid === 2 and user is admin
admittance(userid).isnt('admin', '2') //false if userid === 2 and user is admin
admittance(userid).isnt('admin', 1 === 1) //false if user is admin
admittance(userid).isnt('admin', 1 === 2) //true
```

#### .can(permission, [expression])

Alias for `is`

Parameters:

- permission `<string>`
- [expression] `<string|int|bool>` - optionally, supply one of the following:
    - An expression that resolves to a boolean. eg. `user.id === post.owner`
    - A numeric string to match against `userid` eg. '1' (will internally be checked against userid)
    - A number to match against `userid` eg. 1 (will internally be checked against userid)

Returns:

- `<boolean>`

Example:

```js
admittance(userid).can('editPosts') //true if user can editPosts
admittance(userid).can('editPosts', 2) //true if user can editPosts and userid === 2
admittance(userid).can('editPosts', '2') //true if user can editPosts and userid === 2
admittance(userid).can('editPosts', 1 === 1) //true if user can editPosts
admittance(userid).can('editPosts', 1 === 2) //false
```

#### .cant(permission, [expression])

Alias for `isnt`

Parameters:

- permission `<string>`
- [expression] `<string|int|bool>` - optionally, supply one of the following:
    - An expression that resolves to a boolean. eg. `user.id === post.owner`
    - A numeric string to match against `userid` eg. '1' (will internally be checked against userid)
    - A number to match against `userid` eg. 1 (will internally be checked against userid)

Returns:

- `<boolean>`

Example:

```js
admittance(userid).cant('editPosts') //true if user cant editPosts
admittance(userid).cant('editPosts', 2) //false if userid === 2 and user can editPosts
admittance(userid).cant('editPosts', '2') //false if userid === 2 and user can editPosts
admittance(userid).cant('editPosts', 1 === 1) //false if user can editPosts
admittance(userid).cant('editPosts', 1 === 2) //true
```

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

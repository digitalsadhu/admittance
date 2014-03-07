# Admittance (Version 2)

This is a rewrite of the original incomplete V1 version of admittance. I decided that V1 was trying to do too much and that V2 should be as simple as possible, both in API and in what it actually does under the hood.

Admittance now reads permissions from plain old javascript objects. This, I think helps to keep the module doing just one thing. To load data you just need create javascript objects and store them somewhere. You could simply require a json file and load it. This also makes it very easy to work with a nosql db. Just get and set your permissions to the db.

## Usage

```js
var admittance = require('admittance')

admittance.load({1: ['admin', 'subscriber'], 2: 'subscriber'})

admittance(1).is('admin') //true!

admittance(1).is('subscriber') //true!

admittance(2).is('subscriber') //true!

admittance(2).is('admin') //false!

```

## Permissions format

Admittance expects a simple map from userids to permissions. Permissions are strings or array of strings. The strings are simply permission names that make sense for your application context.

example:

```js
var permissions = {
  1: 'admin',
  2: ['admin', 'subscriber', 'editor'],
  3: 'editor'
}
```

## Tests

```
npm test
```

## Next steps

The permissions format needs to accept parent/child entries, and admittance checking needs to then handle those changes eg:

```js
var permissions = {
  'admin': ['subscriber', 'editor'], //any userid assigned admin will also pass a subscriber or editor check
  'editor': 'blogger', //any userid assigned editor will also pass a blogger check
  1: 'admin'
}

```

```js
admittance(1).is('admin') //true

admittance(1).is('subscriber') //true

admittance(1).is('editor') //true

admittance(1).is('blogger') //true
```

Admittance
==========

Role based access control module for node. The interface is based off the Yii php framework's RBAC interface. The implementation is written in coffee script and is entirely original

## Usage

### include in your node project with npm

npm install admittance

am = require('admittance')

am = new Admittance(new FileAdaptor());
am.on('load', function () {
   //perform operations here 
});

### define roles and operations

eg.
am.createAuthItem('admin', 2, 'System admin user'); //role
am.createAuthItem('editPosts', 0, 'Allows editing of posts'); //operation

### build permissions. 

A role could contain a series of operations (or can be used alone)

eg.
am.addItemChild('admin', 'editPosts');

### Assign roles or operations

Assign roles or operations to your existing users

eg.
am.assign('admin', 43); // 43 = some existing system user id

### Check access

You will then be able to check user access in your application

eg.
am.checkAccess('admin', 43) // true
am.checkAccess('editPosts', 43) // true

## Other methods

### clearAll
### clearAuthAssignments
### executeBizRule
### getAuthAssignment
### getAuthAssignments
### getAuthItem
### getAuthItems
### hasItemChild
### isAssigned
### removeAuthItem
### removeItemChild
### revoke
### save
### saveAuthAssignment
### saveAuthItem

## Events

### load
### save
### empty
### error

## Adaptor

Admittance comes with an in file storage adaptor. It should be pretty easy to implement new adpators if you prefer to use database engines to store access control data.

Take a look at file-adaptor.coffee, implement the load, save, saveAuthItem and saveAuthAssignment methods and pass an instance of your adaptor in to Admittance when you start it up.

eg. 
am = new Admittance(new myAdaptor)

The adaptor must load and save data in the following form:

eg.

//defines assignments between user Ids and auth items with additional
//data and business rules

assignments: {
    '501': { //user id
        'admin': {
            'itemName': 'admin',
            'id': '501', //user id
            'bizRule': null,
            'data': 'N;'
        },
        'tmc': {
            'itemName': 'tmc',
            'id': '501',
            'bizRule': null,
            'data': 'N;'
        }
    },
    '12': {
        'tmc': {
            'itemName': 'tmc',
            'id': '12',
            'bizRule': null,
            'data': 'N;'
        }
    }
 }

//defines all auth items, each item is unique
//name is the unique id for each auth item. Type corresponds
//to 1 of 3 values 0: operation, 1: task, 2: role
//description is purely for reference
//business rules can be defined
//data can be defined

items = {
    'admin': {
        'name': 'admin',
        'type': 2,
        'description': 'Admin user',
        'bizRule': null,
        'data': 'N;'
    },
    'tmc': {
        'name': 'tmc',
        'type': 2,
        'description': 'TMC user',
        'bizRule': null,
        'data': 'N;'
    },
    'acceptTMP': {
        'name': 'acceptTMP',
        'type': 0,
        'description': 'Accept TMPs',
        'bizRule': null,
        'data': 'N;'  
    }
}

//maps parent auth items to child auth items

children = {
    'admin': ['acceptTMP', 'tmc'],
    'tmc': ['acceptTMP']
}
_ = require 'underscore'
EventEmitter = require("events").EventEmitter
util = require "util"

class Admittance extends EventEmitter

    _this = null

    # Internal data structures to hold data
    # about auth items (roles, operations, etc)
    items = {}
    assignments = {}
    children = {}

    constructor: (@adaptor) ->

        _this = this

        @adaptor.load (err, pItems, pAssignments, pChildren) ->
            items = pItems
            assignments = pAssignments
            children = pChildren
            _this.emit "load"

    ###
        Adds an auth item to another auth item as a child
        This stored as an id reference.
        eg. 'parent' = ['child1', 'child2']
        An error event is triggered if either the item or the
        child being referenced do not exist
        @param {string} itemName
        @param {string} childName
    ###
    addItemChild: (itemName, childName) ->
        if items[childName] and items[itemName]
            children[itemName] = children[itemName] or []
            children[itemName].push childName
        else
            # @emit "error", "parent or child do not exist"

    ###
        Assigns a auth item (given by id) to a user (given by id)
        @param {string} itemName - name of auth item
        @param {string} userId   - id of user
        @param {string} bizRule  - expression
    ###
    assign: (itemName, userId, bizRule, data) ->
        item = 
            itemName: itemName
            userId: userId
            bizRule: bizRule
            data: data

        assignments[userId] = assignments[userId] or {}
        assignments[userId][itemName] = item

    ###
        Checks if a user (give by id) has the requested
        permission (specified by id)
        if the requested permission is in any of the 
        assigned auth item trees that have been assigned
        to the user, this method will return true
        @param {string} itemName - auth item
        @param {string} userId   - user id
        @param {array} params    - 
        @return {boolean}        - true if the user has the
        appropriate permissions
    ###
    checkAccess: (itemName, userId, params = []) ->
        #get assignments
        userAssignments = []
        userItems = @getAuthItems(null, userId)
        for own key, item of userItems
            userAssignments.push item.name

        _.contains userAssignments, itemName

    ###
        Clears all permissions. The save method must be called
        after calling clearAll if you want the wipe to be
        persisted. If you dont call save after clearAll, when you
        next load the application, permissions will be restored
        via the adaptor
    ###
    clearAll: ->
        items = {}
        assignments = {}
        children = {}
        # @emit "empty"
    ###
        Clears all auth assignment. The save method must be called
        after calling clearAuthAssignments if you want the wipe to be
        persisted. If you dont call save after clearAuthAssignments,
        when you next load the application, permissions will be restored
        via the adaptor
    ###
    clearAuthAssignments: ->
        assignments = {}

    ###
        Creates an auth item with a given name, type and description
        You may also specify a business rule expression and any
        data
        @param {string} name       - name for the auth item eg. admin
        @param {int}    type       - type int, either 0, 1, or 2
            0: operation, 1: task, 2: role
        @param {string} descrition - information about the auth item
        @param {string} bizRule    - expression to evaluate
        @param {string} data       - 
    ###
    createAuthItem: (name, type, description = "", bizRule, data) ->
        item =
            name: name
            type: type
            description: description
            bizRule: bizRule
            data: data
        items[name] = item

    ###
        Evaluates and checks give business rule
    ###
    executeBizRule: (bizRule, params, data) ->

    ###
        Corresponds to directly assigned auth items
        for a user. ie, child items not directly 
        assigned to a user will not be returned
        @param {string} itemName - name of auth item eg. admin
        @param {string} userId   - user id to return against
        @return {object} - assignment data in an object
    ###
    getAuthAssignment: (itemName, userId) ->
        if assignments[userId] and assignments[userId][itemName]
            assignments[userId][itemName]
        

    ###
        Returns directly assigned user auth items
        ie, implied auth assignments are not returned
        @param {string} userId - id of user
        @return {object} - object where each key is an
        assignment for the given user
    ###
    getAuthAssignments: (userId) ->
        assignments[userId]
        
    getAuthItem: (name) ->
        items[name]

    getAuthItems: (type = null, userId) ->
        authItems = []
        # get all item keys for user recursively
        userItems = @traverseItems(assignments[userId])
        
        # for each item, index into items
        for own key, value of userItems
            authItems.push items[key]

        authItems

    hasItemChild: (itemName, childName) ->
        if children[itemName] and _.contains(children[itemName], childName)
            true
        else false

    isAssigned: (itemName, userId) ->
        if assignments[userId] and assignments[userId][itemName]
            true
        else false

    removeAuthItem: (name) ->
        if items[name]
            items[name] = null

    removeItemChild: (itemName, childName) ->
        if children[itemName] and children[itemName][childName]
            children[itemName][childName] = null

    revoke: (itemName, userId) ->
        if assignments[userId] and assignments[userId][itemName]
            assignments[userId][itemName] = null

    save: (cb) ->
        @adaptor.save @items, @assignments, @children, ->
            # @emit "save"
            cb()

    # saveAuthAssignment: (assignment, cb) ->
    #     @adaptor.saveAssignment assignment, cb

    # saveAuthItem: (item, oldName, cb) ->
    #     @adaptor.saveAuthItem item, oldName, cb

    ###
     Recursively traverse items into a flat array
     @param  {object} items - map of items
     @return {array}       - flattened array of all children
    ###
    traverseItems: (assignedItems) ->
        collection = {}
        for own key, item of assignedItems
            collection[key] = item
            if children[key] and children[key].length > 0
                recurseResult = @traverseItems(@getItemChildren key)
                collection = _.extend collection, recurseResult
            
        collection

    getItemChildren: (itemName) ->
        childItemNames = children[itemName]
        childItems = {}
        for own key, name of childItemNames
            childItems[name] = items[name]
        childItems

module.exports = Admittance

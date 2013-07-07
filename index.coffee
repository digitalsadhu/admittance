_ = require('underscore')

#types:
    # 0: operation, 1: task, 2: role

    # assignments: {
    #     '501': {
    #         'admin': {
    #             'itemName': 'admin',
    #             'id': '501',
    #             'bizRule': null,
    #             'data': 'N;'
    #         },
    #         'tmc': {
    #             'itemName': 'tmc',
    #             'id': '501',
    #             'bizRule': null,
    #             'data': 'N;'
    #         }
    #     },
    #     '12': {
    #         'tmc': {
    #             'itemName': 'tmc',
    #             'id': '12',
    #             'bizRule': null,
    #             'data': 'N;'
    #         }
    #     }
    # }

    # items = {
    #     'admin': {
    #         'name': 'admin',
    #         'type': 2,
    #         'description': 'Admin user',
    #         'bizRule': null,
    #         'data': 'N;'
    #     },
    #     'tmc': {
    #         'name': 'tmc',
    #         'type': 2,
    #         'description': 'TMC user',
    #         'bizRule': null,
    #         'data': 'N;'
    #     },
    #     'acceptTMP': {
    #         'name': 'acceptTMP',
    #         'type': 0,
    #         'description': 'Accept TMPs',
    #         'bizRule': null,
    #         'data': 'N;'  
    #     }
    # }

    # children = {
    #     'admin': ['acceptTMP', 'tmc'],
    #     'tmc': ['acceptTMP']
    # }

class Admittance

    constructor (@adaptor) ->
        @adaptor.load()

    items = {}
    assignments = {}
    children = {}

    addItemChild: (itemName, childName) ->
        if items[childName] and items[itemName]
            children[itemName] = children[itemName] or []
            children[itemName].push childName
        else
            throw "parent or child do not exist"

    assign: (itemName, userId, bizRule, data) ->
        item = 
            itemName: itemName
            userId: userId
            bizRule: bizRule
            data: data

        assignments[userId] = assignments[userId] or {}
        assignments[userId][itemName] = item

    checkAccess: (itemName, userId, params = []) ->
        #get assignments
        userAssignments = []
        userItems = @getAuthItems(null, userId)
        for own key, item of userItems
            userAssignments.push item.name

        _.contains userAssignments, itemName

    clearAll: ->
        items = {}
        assignments = {}
        children = {}

    clearAuthAssignments: ->
        assignments = {}

    createAuthItem: (name, type, description = "", bizRule, data) ->
        item =
            name: name
            type: type
            description: description
            bizRule: bizRule
            data: data
        items[name] = item

    executeBizRule: (bizRule, params, data) ->

    ###
        Corresponds to directly assigned auth items
        for a user. ie, child items not directly 
        assigned to a user will not be returned
    ###
    getAuthAssignment: (itemName, userId) ->
        if assignments[userId] and assignments[userId][itemName]
            assignments[userId][itemName]
        

    ###
        Returns directly assigned user auth items
        ie, implied auth assignments are not returned
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
        @adaptor.save cb

    saveAuthAssignment: (assignment, cb) ->
        @adaptor.saveAssignment assignment, cb

    saveAuthItem: (item, oldName, cb) ->
        @adaptor.saveAuthItem item, oldName, cb

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

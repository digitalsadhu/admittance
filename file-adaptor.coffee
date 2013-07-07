fs = require "fs"
util = require "util"

class FileAdaptor

    constructor: (@fileName) ->

    load: (cb) ->
        #load up items, assignments and childrena and
        #send them through callback
        fs.readFile @fileName, 'utf8', (err, data) ->
            if err 
                cb err
            else
                json = JSON.parse data
                cb null, json.items, json.assignments, json.children

    save: (items, assignments, children, cb) ->
        json = 
            items: items,
            assignments: assignments,
            children: children

        data = JSON.stringify json
        #when save is done call callback
        fs.writeFile @fileName, 'utf8', data, (err, data) ->
            if err then cb err else cb()

    # saveAuthItem: (item, oldName, cb) ->
    #     cb()

    # saveAuthAssignment: (assignment, cb) ->
    #     cb()

module.exports = FileAdaptor
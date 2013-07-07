fs = require "fs"

class FileAdaptor

    load: (cb) ->
        #load up items, assignments and childrena and
        #send them through callback
        cb items, assignments, children

    save: (items, assignments, children, cb) ->
        #when save is done call callback
        cb()

    saveAuthItem: (item, oldName, cb) ->
        cb()

    saveAuthAssignment: (assignment, cb) ->
        cb()

module.exports = FileAdaptor
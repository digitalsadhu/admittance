chai = require 'chai'
chai.should()

AdmittanceModule = require '../index'
Admittance = AdmittanceModule.Admittance
FileAdaptor = AdmittanceModule.FileAdaptor
fs = require 'fs'


am = new Admittance(new FileAdaptor('tests/rights.json'))

describe 'The Admittance class', ->

    afterEach (done) ->
        am.clearAll()
        done()

    describe 'createAuthItem method', ->

        it 'should add an item to the auth collection', ->
            am.createAuthItem 'admin', 2, 'Admin user', '', 'N;'
            am.getAuthItem('admin').name.should.equal('admin')

    describe 'assign method', ->

        it 'should assign an item to a user id', ->
            am.checkAccess('admin', 1).should.equal(false)
            am.createAuthItem 'admin', 2, 'Admin user', '', 'N;'
            am.assign 'admin', 1, '', 'N;'
            am.checkAccess('admin', 1).should.equal(true)

    describe 'addItemChild method', ->

        it 'should add an item child to an item', ->
            am.checkAccess('admin', 1).should.equal(false)
            am.checkAccess('retard', 1).should.equal(false)
            am.createAuthItem 'admin', 2, 'Admin user', '', 'N;'
            am.createAuthItem 'retard', 2, 'Retarded user', '', 'N;'
            am.addItemChild 'admin', 'retard'
            am.assign 'admin', 1, '', 'N;'
            am.checkAccess('admin', 1).should.equal(true)
            am.checkAccess('retard', 1).should.equal(true)    

    describe 'hasItemChild method', ->

        it 'should return true if item has a child', ->
            am.hasItemChild('admin', 'retard').should.equal(false)
            am.createAuthItem 'admin', 2, 'Admin user', '', 'N;'
            am.createAuthItem 'retard', 2, 'Retarded user', '', 'N;'
            am.addItemChild 'admin', 'retard'
            am.hasItemChild('admin', 'retard').should.equal(true)

    describe 'isAssigned method', ->

        it 'should return true if user has a given item assigned', ->
            am.isAssigned('admin', 1).should.equal(false)
            am.createAuthItem 'admin', 2, 'Admin user', '', 'N;'
            am.assign 'admin', 1, '', 'N;'
            am.isAssigned('admin', 1).should.equal(true)

    describe 'getAuthAssignment method', ->

        it 'should return auth assignment for a given user by itemname', ->
            am.createAuthItem 'admin', 2, 'Admin user', '', 'N;'
            am.assign 'admin', 1, '', 'N;'
            am.getAuthAssignment('admin', 1).itemName.should.equal('admin')

    describe 'getAuthAssignments method', ->

        it 'should return auth assignments for a given user', ->
            am.createAuthItem 'admin', 2, 'Admin user', '', 'N;'
            am.createAuthItem 'monkey', 2, 'Admin user', '', 'N;'
            am.assign 'admin', 1, '', 'N;'
            am.assign 'monkey', 1, '', 'N;'
            am.getAuthAssignments(1).should.be.an('object')
            am.getAuthAssignments(1)['admin']['itemName'].should.equal('admin')
            am.getAuthAssignments(1)['monkey']['itemName'].should.equal('monkey')

    describe 'getAuthItem method', ->

        it 'should return auth item for a given auth item name', ->
            am.createAuthItem 'admin', 2, 'Admin user', '', 'N;'
            am.getAuthItem('admin').should.be.an('object')
            am.getAuthItem('admin').name.should.equal('admin')

    describe 'clearAll method', ->

        it 'should clear all items from memory', ->
            # am.createAuthItem 'admin', 2, 'Admin user', '', 'N;'
            # am.assign 'admin', 1, '', 'N;'

###
    FileAdaptor Tests
###
describe 'The FileAdaptor class', ->

    beforeEach (done) ->
        am = new Admittance(new FileAdaptor('tests/rights.json'))
        done()

    afterEach (done) ->
        am.clearAll()
        fs.readFile 'tests/rights-src.json', 'utf8', (err, data) ->
            fs.writeFile 'tests/rights.json', data, () ->
        done()

    describe 'load method', () ->

        it 'should load existing rights file', (done) ->
            am.on 'load', () ->
                am.getAuthItem('admin').should.be.an('object')
                am.getAuthItem('admin').name.should.equal('admin')
                done()

    describe 'save method', ->
        it 'should save rights to file', (done) ->
            am.on 'load', () ->
                am.createAuthItem 'my-test', 2, 'this is a test'
                am.save () ->
                    aam = new Admittance(new FileAdaptor('tests/rights.json'))
                    aam.getAuthItem('my-test').should.be.an('object')
                    done()

                



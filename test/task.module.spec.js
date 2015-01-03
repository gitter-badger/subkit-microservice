'use strict';

var path = require('path'),
    assert = require('assert'),
    store,
    sut;

describe('Module: Task', function(){
  before(function(done) {
    store = require('../lib/store.module.js').init({
      dbPath:'./taskspecdb',
      backupPath:'./backups'
    });
    var event = require('../lib/event.module.js').init({pollInterval: 1});
    var eventsource = require('../lib/eventsource.module.js').init(store, event);
    var template = require('../lib/template.module.js').init({templatesPath:'./test/template_mock'});
    var file = require('../lib/file.module.js').init({templatesPath:'./test/statics_mock'});

    sut = require('../lib/task.module.js').init({
      tasksPath: path.join(__dirname, './task_mock'),
      backupPath: './backups'
    }, store, event, eventsource, template, file);
    done();
  });
  after(function(done){
    store.destroy(done);
  });

  describe('on simple tasks', function(){
    it('should create a task',function(done){
      var newTask = new sut.Task('success', []);
      newTask.taskScript = 'log("Hello!"); response(null,{Message:"Hello world!"});';
      sut.set(newTask.name, newTask, function(error, data){
        assert.ifError(error);
        done();
      });
    });
    it('should run a task and success',function(done){
      sut.run('success', [], null, function(error, data, contentType, log){
        assert.ifError(error);
        assert.notEqual(data, null);
        assert.equal(data.Message, 'Hello world!');
        assert.equal(log.length, 1);
        assert.equal(log[0], 'Hello!');
        done();
      });
    });
    it('should remove a task',function(done){
      sut.remove('success', function(error, data){
        assert.ifError(error);
        done();
      });
    });
  });

  describe('on long running tasks', function(){
    it('should create a task with parameters',function(done){
      var newTask = new sut.Task('longrunningsuccess', {Msg:'Hello!!!'});
      newTask.taskScript = 'setTimeout(function(){log(params.Msg);},1000); setTimeout(response,5500);';
      sut.set(newTask.name, newTask, function(error, data){
        assert.ifError(error);
        done();
      });
    });
    it('should run long running tasks in parallel and success',function(done){
      sut.run('longrunningsuccess', {Msg:'Hello--1'}, null, function(error, data, contentType, log){
        assert.ifError(error);
        assert.equal(log.length, 1);
        assert.equal(log[0], 'Hello--1');
      });

      sut.run('longrunningsuccess', {Msg:'Hello--2'}, null, function(error, data, contentType, log){
        assert.ifError(error);
        assert.equal(log.length, 1);
        assert.equal(log[0], 'Hello--2');
        done();
      });
    });
    it('should remove task',function(done){
      sut.remove('longrunningsuccess', function(error, data){
        assert.ifError(error);
        done();
      });
    });
  });

  describe.skip('on scheduled endless tasks', function(){
    it('should create scheduled endless task with parameters',function(done){
      
      var newTask = new sut.Task('scheduledendlesssuccess', {Msg:'Endless-Scheduled'});
      newTask.taskScript = 'setTimeout(function(){debug(params.Msg);}, 500); response();';
      newTask.schedule = '* * * * * *';
      sut.set(newTask.name, newTask, function(error, data){
        assert.ifError(error);
      });

    });
    it('should remove endless scheduled tasks',function(done){
      
      sut.remove('scheduledendlesssuccess', function(error, data){
        assert.ifError(error);
      });

    });
  });

  describe('on continuous tasks', function(){
    it('should create continuous task with parameters in parallel',function(done){
      
      var newTask = new sut.Task('continuoussuccess', {Msg:'Continuous-1-'});
      newTask.taskScript = 'var count = 0; setTimeout(function(){debug(params.Msg+count++);}, 1000); response();';
      newTask.continuous = true;
      sut.set(newTask.name, newTask, function(error, data){
        assert.ifError(error);
      });

      var newTask2 = new sut.Task('continuous2success', {Msg:'Continuous-2-'});
      newTask2.taskScript = 'var count = 0; setTimeout(function(){debug(params.Msg+count++);}, 2000); response();';
      newTask2.continuous = true;
      sut.set(newTask2.name, newTask2, function(error, data){
        assert.ifError(error);
        setTimeout(done, 6500);
      });

    });
    it('should remove parallel continuous tasks',function(done){
      
      sut.remove('continuoussuccess', function(error, data){
        assert.ifError(error);
      });

      sut.remove('continuous2success', function(error, data){
        assert.ifError(error);
        done();
      });

    });
  });

  describe('on scheduled tasks', function(){
    it('should create scheduled task with parameters in parallel',function(done){
      
      var newTask = new sut.Task('scheduledsuccess', {Msg:'Scheduled-1'});
      newTask.taskScript = 'debug(params.Msg); response();';
      newTask.schedule = '* * * * * *';
      sut.set(newTask.name, newTask, function(error, data){
        assert.ifError(error);
      });

      var newTask2 = new sut.Task('scheduled2success', {Msg:'Scheduled-2'});
      newTask2.taskScript = 'debug(params.Msg); response();';
      newTask2.schedule = '*/2 * * * * *';
      sut.set(newTask2.name, newTask2, function(error, data){
        assert.ifError(error);
        setTimeout(done, 1000);
      });

    });
    it('should remove parallel scheduled tasks',function(done){
      
      sut.remove('scheduledsuccess', function(error, data){
        assert.ifError(error);
      });

      sut.remove('scheduled2success', function(error, data){
        assert.ifError(error);
        done();
      });

    });
  });

});
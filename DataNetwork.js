
var print = console.log;

const _ = require('underscore');
const assert = require('assert');

var mp64 = require('./mp64.js');
var FilePipe = require('./filepipe.js');

var EventEmitter = require('events').EventEmitter;
var util = require('util');


//----------------------------------------------------------
// config
//----------------------------------------------------------
const delimiter = "\n"


//----------------------------------------------------------
// func
//----------------------------------------------------------
// path example
// ./data/server_forest.in
// ./data/server_forest.out

function obj_set(obj, k, v) {
// print(888, obj, k, v)    
  if (v != null) {
    obj[k] = v
  }
}

function do_nothing() {
  // body...
}

//----------------------------------------------------------
// class
//----------------------------------------------------------

function DataNetwork(options) {
  var input_path  = options.input_path;
  var output_path = options.output_path;


  this.request_count = 0;
  this.request_fns = [];

  this.cmd_em     = new EventEmitter();
  this.request_em = new EventEmitter();

  var fp = new FilePipe({
    encoder   : mp64.encode,
    decoder   : mp64.decode,
    delimiter : delimiter,
  });
  this.fp = fp

  fp.open(output_path);
  fp.listen(input_path);

  var _this = this;
  fp.on("data", (data)=>{
    var cmd = data.cmd;
    _this.cmd_em.emit(cmd, data);
  })


  this.cmd_em.on("[request]", (data)=>{
    var cmd     = data.cmd;
    var id      = data.id;
    var options = data.options;

    var event = options;
    var params = {}
    if (typeof(options) == 'object') {
      event  = options.event
      params = options
    }

    if (typeof(event) == 'string') {
      // _this.request_em.emit("*", event, id, params)
      _this.request_em.emit(event, id, params)
    }
  })

  this.cmd_em.on("[callback]", (data)=>{
    var cmd = data.cmd;
    var id  = data.id;
    var res = data.res;
    var err = data.error;

    if (err) {
      print("[error] request remote listen fn :", cmd, err)
      return 
    }

    // todo process nil func, no init do_nothing
    var fn = _this.request_fns[id];
    if (typeof(fn) == "function") {
      // todo catch error when res is no array
      fn(...res);
      delete _this.request_fns[id];
    }
  })



};

module.exports = exports = DataNetwork;

//----------------------------------------------------------
// methods
//----------------------------------------------------------

DataNetwork.prototype.listen = function (event, fn) {
  this.request_em.on(event, (id, options)=>{
    var res = []
    var err
  try {
    res = [ fn(options) ];
  } catch (err2) {
    err = err2
    print("[error] DataNetwork.listen fn execute failed", err2)
  }
    var data = {}
    obj_set(data, "cmd", "[callback]")
    obj_set(data, "id", id)
    obj_set(data, "error", err)
// print(999, error)
    obj_set(data, "res", res)

    this.fp.send(data);
  })
}



DataNetwork.prototype.request = function (options, callback) {
  var event = options;
  var params = {}
  if (typeof(options) == 'object') {
    event  = options.event
    params = options
  }

  if (typeof(event) !== 'string') {
    print(options)
    error("[error] DataNetwork.request invalid options")
  }


  var id = this.request_count;
  this.request_fns[id] = callback || do_nothing;
  this.request_count++;

  var data = {}
  obj_set(data, "cmd", "[request]")
  obj_set(data, "id", id)
  obj_set(data, "options", options)

  this.fp.send(data);
}

DataNetwork.prototype.on = DataNetwork.prototype.listen;
DataNetwork.prototype.emit = DataNetwork.prototype.request;
DataNetwork.prototype.send = DataNetwork.prototype.send;


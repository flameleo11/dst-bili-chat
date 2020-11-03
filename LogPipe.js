
var print = console.log;

const _ = require('underscore');
const assert = require('assert');


var EventEmitter = require('events').EventEmitter;
var util = require('util');

const { spawn } = require('child_process');

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

function LogPipe(log_path) {
  this.path = log_path;
  this.fs = spawn('tail', ['-f', log_path]);
  // fs.stdout.pipe(process.stdout)

  this.em = new EventEmitter();
};

module.exports = exports = LogPipe;

//----------------------------------------------------------
// methods
//----------------------------------------------------------

LogPipe.prototype.toggle = function () {
  var _this = this;
  this.fs.stdout.on('data', function (buf) {
    var str = buf.toString();
    // print(typeof str, str)
    var line = str.trim();

    _this.em.emit("data", line);
  });
}


LogPipe.prototype.listen = function (event, fn) {
  this.em.on('data', (line)=>{
    // print(222, line)
    var res = []
    try {
      res = [ fn(line) ];
    } catch (err) {
      print("[error] LogPipe.listen fn execute failed", err)
    }
  })
}

LogPipe.prototype.on = LogPipe.prototype.listen;



//----------------------------------------------------------
// config
//----------------------------------------------------------

var cluster_name = "ds1"

var cfg_master_chat_log = `/drive_d/game/dstserver/klei/${cluster_name}/Master/server_chat_log.txt`
var cfg_cave_chat_log = `/drive_d/game/dstserver/klei/${cluster_name}/Caves/server_chat_log.txt`
var client_chat_log = "/drive_d/game/dstserver/klei/client_chat_log.txt"




function dst_log_listen_toggle() {
  var log_path = cfg_master_chat_log;

  var lp = new LogPipe(log_path)
  lp.toggle()
  lp.listen("data", (line)=>{
    print(line)
  })


  return lp;
}

// dst_log_listen_toggle()

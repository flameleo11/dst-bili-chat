
var print = console.log;

const _ = require('underscore');
const assert = require('assert');


var EventEmitter = require('events').EventEmitter;
var util = require('util');

const { spawn } = require('child_process');

var LogPipe = require('./LogPipe.js');

//----------------------------------------------------------
// func
//----------------------------------------------------------

function do_nothing() {
  // body...
}

// [00:00:40]: [Join Announcement] Leo
// [00:00:50]: [Say] (KU__9qL15UL) Leo: 1111
// [00:00:41]: [Join Announcement] Leo
// [00:29:12]: [Leave Announcement] Leo
function parse_dst_log_pattern(line) {
  var str = line.trim();
  var p1 = /^\[(\d\d:\d\d:\d\d)\]:\s*\[([\w ]+)\]\s*(.*)/;
  var p2 = /\(([\w ]+)\)\s*([^:]+):(.*)/;

  var timeline = "";
  var action = "";
  var data   = "";
  var uid    = "";
  var name   = "";
  var msg    = "";


  var ret = str.match(p1);
  if (ret && ret[1]) {
    timeline = ret[1];
    action = ret[2];
    data = ret[3];
    name = data;
    msg = ""
    if (action == "Say") {
      var ret2 = data.match(p2);
      uid  = ret2[1];
      name = ret2[2];
      msg  = ret2[3];
    }
  }

  msg = msg.trim()
  // print(`${timeline}|${action}|${name}|${msg}`)

  return {
    timeline: timeline,
    name: name,
    uid: uid,
    kuid: uid,
    action: action,
    data: data,
    msg: msg,
  }
}

function on_recv(line, callback) {
  // print(444, line, typeof line)
  var item;
  try {
    item = parse_dst_log_pattern(line);
  } catch (error) {
    print(`[err] parse_dst_log_pattern ${line}`)
    // expected output: ReferenceError: nonExistentFunction is not defined
    // Note - error messages will vary depending on browser
  }
  if (item) {
    var timeline = item.timeline;
    var name     = item.name;
    var kuid     = item.kuid;
    var action   = item.action;
    var data     = item.data;
    var msg      = item.msg;

    callback(line, item)
  }
}


//----------------------------------------------------------
// class
//----------------------------------------------------------

function DstLogPipe(log_path) {
  this.lp = new LogPipe(log_path)
  this.lp.toggle()
};

module.exports = exports = DstLogPipe;

//----------------------------------------------------------
// methods
//----------------------------------------------------------

DstLogPipe.prototype.listen = function (event, fn = do_nothing) {
  this.lp.on('data', (line)=>{
    // print(333, line, typeof line)
    on_recv(line, (line, item)=>{
      fn(line, item)
    })
  })
}

DstLogPipe.prototype.on = DstLogPipe.prototype.listen;


//----------------------------------------------------------
// test
//----------------------------------------------------------

var cluster_name = "ds1"

var cfg_master_chat_log = `/drive_d/game/dstserver/klei/${cluster_name}/Master/server_chat_log.txt`
var cfg_cave_chat_log = `/drive_d/game/dstserver/klei/${cluster_name}/Caves/server_chat_log.txt`
var client_chat_log = "/drive_d/game/dstserver/klei/client_chat_log.txt"




function dst_log_listen_toggle() {
  var log_path = cfg_master_chat_log;

  var dst_log = new DstLogPipe(log_path)
  dst_log.on("data", (item)=>{
    var timeline = item.timeline;
    var name     = item.name;
    var uid      = item.uid;
    var action   = item.action;
    var data     = item.data;
    var msg      = item.msg;

    print(111, item, msg)
  })

}



// dst_log_listen_toggle()



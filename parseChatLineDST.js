
var print = console.log;

const _ = require('underscore');
const assert = require('assert');


var EventEmitter = require('events').EventEmitter;
var util = require('util');

var LogPipe = require('./LogPipe.js');
var {pack_split_str, is_echo} = require('./split.js');

//----------------------------------------------------------
// config
//----------------------------------------------------------
const delimiter = "\n"


var cluster_name = "ds1"

var cfg_master_chat_log = `/drive_d/game/dstserver/klei/${cluster_name}/Master/server_chat_log.txt`
var cfg_cave_chat_log = `/drive_d/game/dstserver/klei/${cluster_name}/Caves/server_chat_log.txt`
var client_chat_log = "/drive_d/game/dstserver/klei/client_chat_log.txt"



//----------------------------------------------------------
// func
//----------------------------------------------------------


// [00:00:40]: [Join Announcement] Leo
// [00:00:50]: [Say] (KU__9qL15UL) Leo: 1111
// [00:00:41]: [Join Announcement] Leo
// [00:29:12]: [Leave Announcement] Leo
function parseChatLineDST(line) {
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
    action: action,
    data: data,
    msg: msg,
  }
}

function on_recv(line) {
  var item;
  try {
    item = parseChatLineDST(line);
  } catch (error) {
    print(`[err] parseChatLineDST ${line}`)
    // expected output: ReferenceError: nonExistentFunction is not defined
    // Note - error messages will vary depending on browser
  }
    print(111, item)

  if (item) {
    var timeline = item.timeline;
    var name     = item.name;
    var uid      = item.uid;
    var action   = item.action;
    var data     = item.data;
    var msg      = item.msg;




  }



}



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
// main
//----------------------------------------------------------

function toggle() {
  var log_path = cfg_master_chat_log;

  var lp = new LogPipe(log_path)
  lp.toggle()
  lp.listen("data", (line)=>{
    on_recv(line)
  })
};

module.exports = exports = {
  toggle: toggle,
};


toggle()
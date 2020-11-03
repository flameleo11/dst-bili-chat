#!/usr/bin/node

//----------------------------------------------------------
// header
//----------------------------------------------------------
var print = console.log;

const _ = require('underscore');
const moment = require('moment');
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const msgpack = require('msgpack');
const { spawn } = require('child_process');
const events = require('events');
var em = new events.EventEmitter();

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";



//----------------------------------------------------------
// config
//----------------------------------------------------------
const delimiter = "\n"
const dst_lua_root = "/drive_d/SteamLibrary/steamapps/common/Don't Starve Together/data";
const dst_data_path = `${dst_lua_root}/data/server.dat`;
const dst_event_fs = spawn('tail', ['-f', dst_data_path]);


const CFG_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const CFG_DATE_FORMAT = 'YYYY-MM-DD';
const CFG_TIME_FORMAT = 'HH:mm:ss';

// var _M = getglobaldata("bilichat")
var _M = {};

_M.db = null;
_M.dbo = null;


//----------------------------------------------------------
// tools
//----------------------------------------------------------

function now() {
  return moment().format(CFG_DATETIME_FORMAT)
}

function date() {
  return moment().format(CFG_DATE_FORMAT)
}

function unixtime() {
  return moment().unix()
}

function not(value) {
  return !(value);
}

function type(value) {
  if (value === null) {
    return 'nil'
  };
  if (value === undefined) {
    return 'nil'
  };
  if (typeof(value) == 'boolean') {
    return 'boolean'
  }
  if (typeof(value) == 'number') {
    if (isNaN(value)) {
      return 'nil'
    }
    return 'number'
  }
  if (typeof(value) == 'string') {
    return 'string'
  }
  if (typeof(value) == 'function') {
    return 'function'
  }

  if (typeof(value) == 'object') {
    if (Array.isArray(value)) {
      return 'array'
    }
    return 'table'
  }
  print('[warning] find other type', typeof(value))
  return (typeof(value))
}


//----------------------------------------------------------
// func
//----------------------------------------------------------
var arr_buf = [];

function decode(str) {
  var buf = Buffer.from(str, 'base64');
  var data = msgpack.unpack(buf);
  return data
}

function parse_data(str) {
try {
  // print("total:", str.length, str)
  var arr = str.split(delimiter)
  _.each(arr, (line, i)=>{
    if (not(line.length > 0)) {
      return ;
    }

    // print("line:", i, line.length, line)
    var data = decode(line)
    if (type(data) == "array") {
      em.emit("dispatch_dst_event", data);
    }

    print("--> msgpack unpack:", data)
  })
} catch (error) {
  print("[error] msgpack.parse", error, str)
}

};

function watch_dst_event() {
  dst_event_fs.stdout.on('data', function (buf) {

    if (buf.includes(delimiter)) {
      // print("includes |", buf.indexOf('this'));
    }
    // var line = str.trim();
    var str = buf.toString();

print(111, str, Date.now())    
    parse_data(str)

    // em.emit('dispatch_dst_chat', line);
  });

  print("recv dst data: start")
}

function toggle_mongodb() {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    dbo = db.db("dst_new");
    _M.db = db
    _M.dbo = dbo

    dbo.createCollection("users", function(err, res) {
      if (err) throw err;
      print("[db] use dst_new db.users");
      // db.close();
    });
  });
}

//----------------------------------------------------------
// on recv
//----------------------------------------------------------


function on_recv_dst_event(data) {
  var cmd = data[0];
  var arg = data.slice(1);

  if (cmd && cmd.length > 0) {
    em.emit(cmd, ...arg);
    // print("[emit] ", cmd, ...arg)
  }
}


function on_recv_test(...arg) {
  print("[test] ", ...arg)
}

function on_recv_login(userid, name, prefab, info) {
  var db = _M.db;
  var dbo = _M.dbo;
  if (not(db && dbo)) {
    print("[warning] db not init:", userid, name, prefab, info)
    return ;
  }


print("login 222", userid, name, prefab, info)

  var lasttime = date();
  var playerage = info.playerage;
  var inc_prefab = {}
  inc_prefab[prefab] = 1

  dbo.collection("users").updateOne(
    { userid: userid },
    { 
      $set: info,
      $set: { lasttime: lasttime },
      $addToSet: { other_name: name },
      $addToSet: { used_character: prefab },
      $inc: inc_prefab,
      $max: { maxday: playerage },
    },
    { upsert: true }
  );      

  print("[login] ", userid, name, prefab)
}

//----------------------------------------------------------
// main
//----------------------------------------------------------

function init() {

  em.on('dispatch_dst_event', on_recv_dst_event);
  em.on('test', on_recv_test);
  em.on('login', on_recv_login);


  // toggle_mongodb()
  watch_dst_event()
}

init()

//----------------------------------------------------------
// test
//----------------------------------------------------------

// var o = {
//   name: "asdf",
//   msg: "a"+(1)+"\n",
//   time: "asdfasdf"
// }


// var buf = msgpack.pack(o);
// var str = buf.toString('hex')
// var buf2 = Buffer.from(str, 'hex');
// var oo = msgpack.unpack(buf2);

// print(oo)




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

var mp64 = require('./mp64.js');
var FilePipe = require('./filepipe.js');
var DataNetwork = require('./DataNetwork.js');


//----------------------------------------------------------
// config
//----------------------------------------------------------
const delimiter = "\n"

const dst_lua_root = "/drive_d/SteamLibrary/steamapps/common/Don't Starve Together/data";
const dst_reader_path = `${dst_lua_root}/data/dstserver_reader.dat`;
const dst_writer_path = `${dst_lua_root}/data/dstserver_writer.dat`;

const dst_data_path = `${dst_lua_root}/data/`



//----------------------------------------------------------
// func
//----------------------------------------------------------


function nodenet_toggle(key) {
  var dst_in  = dst_data_path + key + ".in"
  var dst_out = dst_data_path + key + ".out"

  var dnet = new DataNetwork({
    input_path  : dst_out,
    output_path : dst_in,
  })
  print(1, "read", dst_out)
  print(2, "write", dst_in)

  return dnet;
}


function dstnet_toggle(key) {
  var dst_in  = dst_data_path + key + ".in"
  var dst_out = dst_data_path + key + ".out"

  var dnet = new DataNetwork({
    input_path  : dst_in,
    output_path : dst_out,
  })
  print(1, "read", dst_in)
  print(2, "write", dst_out)

  return dnet;
}

//----------------------------------------------------------
// test
//----------------------------------------------------------

var t1 = dstnet_toggle("server_forest")

//----------------------------------------------------------
// main
//----------------------------------------------------------

var dnet_master = nodenet_toggle("server_forest")

var dnet_cave   = nodenet_toggle("server_cave")

dnet_master.listen("test", (data)=>{
  print(111, "master recv test", data)
  return "dnet_master"
})

dnet_cave.listen("test", (data)=>{
  print(111, "cave recv test", data)
  return "dnet_cave"
})


var options = {
  event: "test",
  data: [1,2,3],
}

t1.emit(options, function (data) {
  print(111, "send test >>> return ", data)
})

// dnet_cave.listen("test", (data)=>{
//   print(222, "cave recv test", data)
//   return "dnet_cave"
// })

print("init.....ok")

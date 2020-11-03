#!/usr/bin/node

const print = console.log;

const querystring = require('querystring');
const request = require('request');
const _ = require('underscore');
const crypto = require('crypto');
const fs = require('fs');
const ini = require('ini');

var dateFormat = require('dateformat');

var config = require("./config.js")
var common = require('./common.js');

const not = common.not;
const do_nothing = common.do_nothing;
const md5 = common.md5;
const now = common.now;
const tostring = common.tostring;
const write = common.write;


var BiliChat = require("./bilichat_api.js")
var MessageSender = require("./MessageSender.js")

// var mp64 = require('./mp64.js');
// var FilePipe = require('./filepipe.js');
var DataNetwork = require('./DataNetwork.js');
var {pack_split_str, is_echo} = require('./split.js');
var DstLogPipe = require('./DstLogPipe.js');

// auto backup & load old cave
var abs = require('./auto_backup_session.js');

var dst_chat_emotes = require('./dst_chat_emotes.js');
var Command = require('./command.js');



// illegal char ["↳"]
var my_console_prefix = ["☆", "★"]
var bili_prefix_for_dst_log = ["♠", "♡", "♣", "♢"]
var my_console_subfix = ":"

var self = {}

//----------------------------------------------------------
// test
//----------------------------------------------------------

// var test = require("./randomstr.js")
// var arr_test_str = require("./test/t1_loadtop100.js").data;

//----------------------------------------------------------
// config
//----------------------------------------------------------
var _M = {}

// const delimiter = "\n"
const host_uid             = config.uid;
const klei_uid             = config.klei_uid;
const host_roomid          = config.roomid;
const cookie               = config.cookie;
const min_sendinterval     = config.min_sendinterval;
const dstserver_path       = config.dstserver_path;
const master_chat_log_path = config.master_chat_log_path
const cfg_cluster_ini      = config.cfg_cluster_ini


const dst_lua_root  = `${dstserver_path}/data/`
const dst_data_path = `${dst_lua_root}/data/`


var last_sendtime = 0;
var lasttime1 = 0;
var lasttime2 = 0;


var count = 0


//----------------------------------------------------------
// init
//----------------------------------------------------------

var bilichat = new BiliChat(host_uid, host_roomid, cookie);

var sender = new MessageSender(min_sendinterval, ()=>{
  var curtime = now();
  if (curtime - last_sendtime > min_sendinterval) {
    return true;
  }
  return false;
})

//----------------------------------------------------------
// func
//----------------------------------------------------------

function getRoomInfo() {
  var config = ini.parse(fs.readFileSync(cfg_cluster_ini, 'utf-8'))

  var name = (config.NETWORK.cluster_name);
  var desc = (config.NETWORK.cluster_description);
  var info = `房间名称: ${name}\n描述: ${desc}`
  return info;
}

//----------------------------------------------------------
// init
//----------------------------------------------------------

function init_commands() {
  var chat_hc = new Command()
  var keyword_hc = new Command()


  var show_room = (cmd, params)=>{
    var room_info = "【steam饥荒】房间名称: !!恭喜...";
    var room_info = getRoomInfo()
    bili_push_text_for_my_console(room_info)
  }

  var show_help = (cmd, params)=>{
    var info = chat_hc.keys.join(", ");
    var msg = "可用命令: " + info;
    bili_push_text_for_my_console(msg)
  }

  var keywords = ["主播"]
  keyword_hc.on("房间", show_room)
  keyword_hc.on("room", show_room)
  keyword_hc.on("加入", show_room)
  keyword_hc.on("help", show_help)
  keyword_hc.on("帮助", show_help)


  keywords.push(...keyword_hc.keys);

  keyword_hc.setKeywordDispatcher(keywords)

  self.biliChatKeywordHandler = keyword_hc;



  chat_hc.setChatCommandDispatcher()
  self.biliChatCmdHandler = chat_hc;

  chat_hc.on("/room", show_room)
  chat_hc.on("#room", show_room)
  chat_hc.on("-room", show_room)

  chat_hc.on("/help", show_help)
  chat_hc.on("#help", show_help)
  chat_hc.on("-help", show_help)


}

function net_toggle(key) {
  var dst_in  = dst_data_path + key + ".in"
  var dst_out = dst_data_path + key + ".out"

  var dnet = new DataNetwork({
    input_path  : dst_out,
    output_path : dst_in,
  })
  return dnet;
}

// todo split from main.js for regen load cave before
function init_data_network() {
  var dnet_master = net_toggle("server_forest")
  var dnet_cave   = net_toggle("server_cave")
  var dnet_client = net_toggle("client")


  // dnet_master.listen("test", (data)=>{
  //   print(111, "master recv test", data)
  //   return "dnet_master"
  // })
  // dnet_client.listen("test", (data)=>{
  //   print(111, "dnet_client recv test", data)
  //   return "dnet_client"
  // })

  self.new_world_flag = 0;
  dnet_master.listen("set_new_world_flag", (data)=>{
    self.new_world_flag = data.data;
    print("set_new_world_flag", data)
  })

  // new version *.meta not infect backup
  dnet_master.listen("get_new_world_flag", (data)=>{
    var flag = self.new_world_flag;
    self.new_world_flag = 0
    print("get_new_world_flag", flag)
    return flag;
  })


  self.dnet_cave   = dnet_cave
  self.dnet_master = dnet_master
  self.dnet_client = dnet_client

}


function test_send(data) {
  var dnet = self.dnet_master
  var options = {
    event : "test",
    data  : data,
    time  : Date.now(),
  }
  dnet.request(options, function (x, y, z) {
    print(999, "return", x, y, z, "end")
  })
}

function toggleConsoleInput() {
  var stdin = process.stdin;
  stdin.setEncoding('utf-8');
  stdin.on('data', function (str) {
    switch (str) {
      // case 'exit\n':
      // case 'quit\n':
      //   exit();
      //   break;
      default:
        // send to bili imediately
        var msg = str.trim();
        bili_push_text_for_my_console(msg)

        // add subfix incase to echo from dst_chat_log
        // var fix_msg = dst_chat_emotes.fix_str(msg) + my_console_subfix;
        var fix_msg = dst_chat_emotes.fix_str(msg) + dst_chat_emotes.random();


    // print(999, msg, fix_msg, my_console_subfix)    
        var dnet_client = self.dnet_client;
        var options = {
          event : "me_chat",
          data  : [fix_msg],
          msg : fix_msg,
        }
        dnet_client.request(options)
    }
  });
}


function toggleDstLogOutput() {
  var log_path = master_chat_log_path;
  var dst_log = new DstLogPipe(log_path)

  dst_log.on("data", (line, item)=>{
    var timeline = item.timeline;
    var name     = item.name;
    var kuid      = item.kuid;
    var action   = item.action;
    var data     = item.data;
    var msg      = item.msg;

    // print("[test] log:", line)

    var txt = `【${name}】: ${msg}`
    if (kuid == config.klei_uid) {
      if (msg.endsWith(my_console_subfix)) {
        txt = "";
      } else {
        txt = `${msg}`
      }
    }

    switch (action) {
      case 'Say':
        if (txt) {
          bili_push_text_for_dst_chat(txt)
          print(action, txt)
        }
        break;
      case 'Join Announcement':
        print(action, ` ${timeline}【${name}】加入游戏`)
        break;
      case 'Leave Announcement':
        print(action, ` ${timeline}【${name}】离开游戏`)
        break;
      case 'Death Announcement':
        print(action, `【${name}】死亡 ${data}`)
        break;
      case 'Vote Announcement':
        // pushTextMultiLine(`【${name}】死亡 ${data}`)
        break;
      case 'Kick Announcement':
        // pushTextMultiLine(`【${name}】死亡 ${data}`)
        break;
      case 'Roll Announcement':
        // pushTextMultiLine(`【${name}】死亡 ${data}`)
        break;

      default:
        // print("[DST unknow action]", action, line)
    }

  })

}

//----------------------------------------------------------
// api
//----------------------------------------------------------

function bili_push_text_for_my_console(str) {
  var arr = pack_split_str(str, my_console_prefix)
  _.each(arr, (line, i)=>{
    sender.push(line)
  })
}

function bili_push_text_for_dst_chat(str) {
  var arr = pack_split_str(str, bili_prefix_for_dst_log)
  _.each(arr, (line, i)=>{
    sender.push(line)
  })
}

function bili_is_echo_msg(msg) {
  if (is_echo(msg, my_console_prefix)) {
    return true
  }
  if (is_echo(msg, bili_prefix_for_dst_log)) {
    return true
  }
  return false
}

function get_bili_short_msg_for_console(item) {
  var uid = item.uid;
  var msg = item.msg;
  var name = item.name;
  var chattime = item.chattime;
  if (uid == host_uid) {
    if (bili_is_echo_msg(msg)) {
      return ""
    }
    name = "me";
  }
  // todo get short name: 1. nums 2 en 3 cn
  return `${chattime} ${name}: ${msg}`
}

function get_bili_short_msg_for_dst(item) {
  var uid = item.uid;
  var msg = item.msg;
  var name = item.name;
  var chattime = item.chattime;
  if (uid == host_uid) {
    if (bili_is_echo_msg(msg)) {
      return ""
    }
    name = "host";
  }
  // todo get short name: 1. nums 2 en 3 cn
  return `${name}: ${msg}`
}


//----------------------------------------------------------
// register
//----------------------------------------------------------

sender.on("fire", (msg)=>{
  var curtime = Date.now();
  // write("[send]", msg, curtime, ">>>")
  write("↳ ")

  // bili msg reply show
  bilichat.send(msg, (data)=>{
    var delay = now() - last_sendtime;
    if (data.code == 0) {
      write("received")
    } else {
      write("received code:", data.code)
    }
    write(` at ${delay}ms `)
    if (data.msg) {
      write(data.msg)
    }
    print("")
  })

  last_sendtime = curtime;
})

bilichat.on("new_data", (item)=>{
  var uid = item.uid;
  var msg = item.text;
  var name = item.name;
  var timeline = item.timeline;
  var chattime = item.chattime;
  print(`[bili] ${chattime} ${name}: ${msg}`)

  if (bili_is_echo_msg(msg)) {
    // print("[test] 收到回声")
    return ""
  }

// print("[test] 收到回声2222", msg, timeline)

  var chat_hc    = self.biliChatCmdHandler
  var keyword_hc = self.biliChatKeywordHandler
  if (chat_hc.checkDispatch(msg)) {
    // print("[test] 命令")
    chat_hc.connect(msg)
    return
  }
  if (keyword_hc.checkDispatch(msg)) {
    // print("[test] 关键字")
    keyword_hc.connect(msg)
    return
  }

  // print("[test] 不是命令", msg)

  // filter echo by this
  var msg = get_bili_short_msg_for_console(item)
  if (msg) {
    print(msg)

    var msg2 = get_bili_short_msg_for_dst(item)
    var dnet_master = self.dnet_master;
    var options = {
      event : "bili_chat",
      data  : [msg2],
      msg : msg2,
    }
    dnet_master.request(options)
  }

  if (uid == host_uid) {
    last_sendtime = now();
  }
})

bilichat.on("old_data", (item)=>{
  // todo: check echo type
  // need a bili char msg send packer & unpack parsor 
  // echo type , text length for prefix with num or not
  var msg = get_bili_short_msg_for_console(item)
  if (msg) {
    print(msg)
  }
})

bilichat.on("update", (num)=>{
  // process.stdout.write("|");
})

bilichat.on("data", (item)=>{
  // print("[data]", item.text)
})

bilichat.on("dup_data", (item)=>{
  // print("[dup_data]", item.text)
})



//----------------------------------------------------------
// main
//----------------------------------------------------------


function main() {
  init_commands()
  init_data_network()
  toggleConsoleInput()

  bilichat.toggle();
  sender.toggle()

  toggleDstLogOutput()

  // worldprefab: forest, cave

  process.on('uncaughtException', function(err) {
    print('[error] unknow: ' + err);
  });

  print("init ............ [ok]")
}


main()


//----------------------------------------------------------
// header
//----------------------------------------------------------

var print = console.log;

const events = require('events');
const querystring = require('querystring');
const request = require('request');
const crypto = require('crypto');
const _ = require('underscore');

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var common = require('./common.js');

const not = common.not;
const do_nothing = common.do_nothing;
const md5 = common.md5;

//----------------------------------------------------------
// class
//----------------------------------------------------------

const cfg_chat_interval = 1200;
var cfg_arr_bilichat_echo_prefix = ["╔", "╠", "╚", ">"]

// 回显过滤器
function biliChatEchoFilter(uid, msg, item) {
  var arr = cfg_arr_bilichat_echo_prefix;
  if (not(msg && msg.length > 0)) {
    return null;
  }

  var flag = _.find(arr,
    (prefix)=>{
      return msg.startsWith(prefix)
    });
  if (flag) {
    return null;
  }

  // var ch1 = msg.charAt(0)
  // if (prefix.includes(ch1)) {
  //   return
  // }
  return msg;
}


function pushTextMultiLine(text) {
  // trace("pushTextMultiLine(text):", text)
  if (not(text && text.length > 0)) {
    return
  }
// print(111, text)  
  text = bilichatTextFilter(text);
// print(222, text)  
  var roomid = getCurrentRoom();
  // todo split seq without split word


  var delimeter = "\n";
  var arr_line = text.split(delimeter);
  if (not(arr_line && arr_line.length > 0)) {
    return
  }
// print(333, arr_line)  
  var arr = [];
  var fixedWidth = 16;
  _.each(arr_line, (line, i)=>{
    var arr_seg = TextSplitArrayByWidth(line, fixedWidth, delimeter)
    for(var seg of arr_seg) {
      arr.push(seg)
    }
  })

  // var arr = text.match(/.{1,15}/g);
// print(444, arr)  

  var len = arr.length;
  var prefix = cfg_arr_bilichat_echo_prefix;

  _.each(arr, (v, i)=>{
    var msg = ""
    if (i == 0) {
      msg = prefix[0] + v;
    } else if (i > 0 && i < (len-1)) {
      msg = prefix[1] + v;
    } else if (i == (len-1)) {
      msg = prefix[2] + v;
    }
    if (i == 0 && i == (len-1)) {
      msg = prefix[3] + v
    };
    arr[i] = msg
  })

  gg_sendMsgQueue.push(arr)
}


function toggleSendMsgQueue() {
  gg_enable_sendMsgQueue = not(gg_enable_sendMsgQueue);
  gg_sendMsgQueue = []

  let timerId = setInterval(()=>{
    if (not(gg_enable_sendMsgQueue)) {
      return
    }

    if (gg_sendMsgQueue && gg_sendMsgQueue[0]) {
      var arr = gg_sendMsgQueue[0];
      if (arr.length == 0) {
        gg_sendMsgQueue.shift();
      } else {
        var msg = arr.shift()
        // print(msg)
        var roomid = getCurrentRoom();
        sendChatMsg(getAdmin(), roomid, msg, (ret)=>{
          if (ret && ret.message) {
            var err = ret.message
            if (err.length > 0) {
              print(`[error] send "${msg}" `, ret);
            }
          } else if (ret && ret.msg) {
            var err = ret.msg
            if (err.length > 0) {
              print(`[error] send "${msg}" `, ret);
            }
          }
        })
      }
    }
  }, cfg_chat_interval)

}



module.exports = BiliChat;


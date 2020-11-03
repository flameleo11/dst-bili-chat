
var print = console.log;

const _ = require('underscore');
const assert = require('assert');


var EventEmitter = require('events').EventEmitter;
var util = require('util');


//----------------------------------------------------------
// config
//----------------------------------------------------------
const delimiter = "\n"


//----------------------------------------------------------
// func
//----------------------------------------------------------

function obj_set(obj, k, v) {
  if (v != null) {
    obj[k] = v
  }
}

function do_nothing() {
  // body...
}

function strlower(str) {
// JavaScript String () Method - W3Schools
// toUpperCase
// toLowerCase
  if (str) {
    return str.toLowerCase()
  }
  return str
}

function std_cmd(cmd) {
  return strlower(cmd);
}

function getChatCmd(msg) {
  var ret = msg.match(/^([#-://]\w+)/)
  if (ret && ret[1]) {
    return std_cmd(ret[1])
  }
  return null;
}

// array: keywords
function findChatKeyword(msg, keywords) {
  var find = "";

  // todo scan msg one time, to match all keywords
  var find = _.find(keywords, (keyword, i)=>{
    var ret = msg.includes(keyword);
    if (ret) {
      find = keyword
    }
    return ret;
  })
  return find;
}

function KeywordDispatcher(keywords) {
  this.keywords = keywords
};

KeywordDispatcher.prototype.fn = function (msg, emit) {
  var keywords = this.keywords;

  emit = emit || do_nothing;
  var cmd = findChatKeyword(msg, keywords)
  if (cmd) {
    var params = msg.split(" ");
    params[0] = msg;
    emit(cmd, params)
    return true
  }
  return false
}

function ChatCommandDispatcher() {

};

ChatCommandDispatcher.prototype.fn = function (msg, emit) {
  emit = emit || do_nothing;
  var cmd = getChatCmd(msg);
  if (cmd) {
    var params = msg.split(" ");
    params[0] = msg;
    emit(cmd, params)
    return true
  }
  return false
}

//----------------------------------------------------------
// class
//----------------------------------------------------------

function Command(dispatcher) {
  this.cmdHandler = {};
  this.keys = [];

  if (dispatcher) {
    this._dispatcher = dispatcher;
  }
  this.input = new EventEmitter();
  this.cmd_em = new EventEmitter();

  var _this = this;
  this.input.on('data', (msg)=>{
    _this._dispatcher.fn(msg, (cmd, ...arg)=>{
      _this.cmd_em.emit(cmd, ...arg);
    })
  })
  // test
  // this.input.emit('data', 1,2,3)
};

module.exports = exports = Command;

//----------------------------------------------------------
// methods
//----------------------------------------------------------


// todo cmd.on cmd.off
Command.prototype.on = function (cmd, fn) {
  // this.cmdHandler[cmd] = fn || do_nothing;
  var callback = fn || do_nothing;
  this.keys.push(cmd);

  this.cmd_em.on(cmd, (...arg)=>{
    callback(cmd, ...arg)
  })
}

Command.prototype.recv = function (msg) {
  this.input.emit('data', msg)
}

Command.prototype.checkDispatch = function (msg) {
  return this._dispatcher.fn(msg, null);
}

Command.prototype.setKeywordDispatcher = function (keywords = []) {
  this._dispatcher = new KeywordDispatcher(keywords)
}

Command.prototype.setChatCommandDispatcher = function () {
  this._dispatcher = new ChatCommandDispatcher()
}

Command.prototype.add = Command.prototype.on;
Command.prototype.connect = Command.prototype.recv;

Command.KeywordDispatcher = KeywordDispatcher
Command.ChatCommandDispatcher = ChatCommandDispatcher


// todo connector
// Command.prototype.connector = Command.prototype.connector;

//----------------------------------------------------------
// test
//----------------------------------------------------------


// var keywords = ["room", "help", "asdf"]
// var cmdHandler = new Command()
// cmdHandler.setChatCommandDispatcher()
// // cmdHandler.setKeywordDispatcher(keywords)

// cmdHandler.on("/room", (cmd, params)=>{
//   print("------>>>>", cmd, params)
// })
// cmdHandler.on("/moveto", (cmd, params)=>{
//   print("----2222-->>>>", cmd, params)
// })

// cmdHandler.on("asdf", (cmd, params)=>{
//   print("----333-->>>>", cmd, params)
// })
// cmdHandler.on("help", (cmd, params)=>{
//   print("----444-->>>>", cmd, params)
// })
// cmdHandler.on("room", (cmd, params)=>{
//   print("----555-->>>>", cmd, params)
// })
// cmdHandler.on("/help", (cmd, params)=>{
//   print("----777-->>>>", cmd, params)
// })

// var msg = "/moveto 38 47"
// var msg = "/help room asdf"
// print(".....check chat", msg)
// if (cmdHandler.checkDispatch(msg)) {
//   print("...........cmd", msg)
//   cmdHandler.recv(msg)
// } else {
//   print("..........game.chat")

//   // do echo in game
//   print("game chat:", msg)
// }

// print(cmdHandler.keys, keywords)



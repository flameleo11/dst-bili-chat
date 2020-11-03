
//----------------------------------------------------------
// header
//----------------------------------------------------------

var print = console.log;

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

function MessageSender(interval, condition_fn) {
	EventEmitter.call(this);

  // type is queue
  this.queue = [];
  this.interval = interval;
  this.lasttime = 0;

  let _this = this;
  this.condition_fn = condition_fn || (()=>{
    var curtime = Date.now();
    if (curtime - _this.lasttime > _this.interval) {
      return true;
    }
    return false;
  });
};

util.inherits(MessageSender, EventEmitter);
module.exports = exports = MessageSender;

//----------------------------------------------------------
// methods
//----------------------------------------------------------

MessageSender.prototype.push = function (data) {
  // var curtime = Date.now();
  // if (curtime - this.lasttime > this.interval) {
  //   this.fire(data)
  // }
  if (this.condition_fn()) {
    this.fire(data)
  } else {
    this.queue.push(data)
  }
}

MessageSender.prototype.fire = function (data) {
  this.emit("fire", data)
  this.lasttime = Date.now();
}

MessageSender.prototype.toggle = function (enable = true) {
  if (not(enable)) {
    return clearInterval(this.tm_sender)
  }

  this.tm_sender = setInterval(()=>{
    if (not(this.queue.length > 0)) {
      return
    }
    if (this.condition_fn()) {
      var data = this.queue.shift();
      this.fire(data)
    }
    // var curtime = Date.now();
    // if (curtime - this.lasttime > this.interval) {
    //   var data = this.queue.shift();
    //   this.fire(data)
    // }
  }, this.interval)
}

var print = console.log;

const events = require('events');
const querystring = require('querystring');
const request = require('request');
const crypto = require('crypto');
const _ = require('underscore');

var EventEmitter = require('events').EventEmitter;
var util = require('util');

const send_uri = 'https://api.live.bilibili.com/msg/send';
const get_history_uri = 'https://api.live.bilibili.com/xlive/web-room/v1/dM/gethistory';
//----------------------------------------------------------
// tools
//----------------------------------------------------------


function not(value) {
  return (!(value))
}


function do_nothing() {

}

function md5(str) {
  var hash = crypto.createHash('md5').update(str).digest('hex');
  return hash;
}

function get_csrf_from_cookie(cookie) {
  const regex = /bili_jct=(\w+);/;
  var ret = cookie.match(regex);
  var csrf = ""
  if (ret && ret[1]) {
    csrf = ret[1]
  }
  return csrf
}


//----------------------------------------------------------
// class
//----------------------------------------------------------

function BiliChat(uid, roomid, cookie, ups = 1) {
	EventEmitter.call(this);

	this.uid = uid;
	this.roomid = roomid;
	this.cookie = cookie;
	this.ups = ups || 1;

	var csrf = get_csrf_from_cookie(cookie);
	this.csrf = csrf
  this.send_form = {
    rnd: 1592205622,
    color: 16777215,
    fontsize: 25,
    mode: 1,
    bubble: 0,
    roomid: roomid,
    csrf_token: csrf,
    csrf: csrf,
    msg: "",
  };
  this.update_form = {
    roomid: roomid,
  };

  this.enable = false;
  this.tm_update = null;
  this._cache_last_chat = null;
};

util.inherits(BiliChat, EventEmitter);

//----------------------------------------------------------
// methods
//----------------------------------------------------------

BiliChat.prototype.send = function (msg, callback = do_nothing) {
  var form = this.send_form;
  form.msg = msg

  var formData = querystring.stringify(form);
  var contentLength = formData.length;
  var option = {
    headers: {
      'Content-Length': contentLength,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'cookie': this.cookie
    },
    uri: send_uri,
    body: formData,
    method: 'POST'
  }
  // print("POST bili chat msg length:", contentLength)

  request(option, function (err, res, body) {
  	if (err) {
		  print("[error] bilichat send err: ", err, body)
		  return ;
  	}
		try {
			callback(JSON.parse(body))
		} catch (error) {
		  print("[error] JSON.parse @ bilichat send: ", error, body)
		}
  });

}


BiliChat.prototype._dispatch = function (arr_chat) {
  var last_cache = this._cache_last_chat;
  var cache = {};

  var em = this;

	var enum_fn = function (v, k) {
		// print(k, v.nickname);
		var chattime = (v.timeline).slice(-8);

		var item = {
			uid: v.uid,
			name: v.nickname,
			nickname: v.nickname,
			nick: v.nickname,
			text: v.text,
			msg: v.text,
			time: v.timeline,
			timeline: v.timeline,
			key: key,
			chattime: chattime,
		}

		var short = `${v.uid}|${v.timeline}|${v.text}`;
		var key = md5(short);

		cache[key] = item;
    // todo emitter with try catch
		if (last_cache == null) {
			em.emit("data", item)
			em.emit("old_data", item)
		} else {
			if (last_cache[key]) {
				em.emit("dup_data", item)
			} else {
		  	em.emit("data", item)
		  	em.emit("new_data", item)
			}
		}
	}
  _.each(arr_chat, enum_fn);
  em.emit('update', arr_chat.length);

  this._cache_last_chat = cache;
}

BiliChat.prototype.update = function () {
  var form = this.update_form;
  var formData = querystring.stringify(form);
  var contentLength = formData.length;
  var option = {
    headers: {
      'Content-Length': contentLength,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    uri: get_history_uri,
    body: formData,
    method: 'POST'
  }

  request(option, (err, res, body) => {
  	if (err) {
  		print("[error] bilichat update room chat: ", err, res, body)
  		return ;
  	}
try {
    var obj = JSON.parse(body);
} catch (error) {
  print("[error] JSON.parse @ bilichat update: ", error, body)
}
		var arr_chat = obj.data.room;
    this._dispatch(arr_chat)
  });

}

BiliChat.prototype.toggle = function () {
	this.enable = not(this.enable);
	var ms = Math.ceil(1000 / this.ups);
	this.up_interval = ms;

	if (this.enable) {
    this.update()
	  this.tm_update = setInterval(() => {
	  	this.update()
	  }, ms);
	} else {
		clearInterval(this.tm_update)
	}

}

//----------------------------------------------------------
// rem
//----------------------------------------------------------


module.exports = BiliChat;


var print = console.log;

const events = require('events');
const querystring = require('querystring');
const request = require('request');
const crypto = require('crypto');
const _ = require('underscore');
const moment = require('moment');

var EventEmitter = require('events').EventEmitter;
var util = require('util');


let common = {};

//----------------------------------------------------------
// rem
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

function now() {
  return Date.now();
}


function datetime() {
  return moment().format(CFG_DATETIME_FORMAT)
}

function date() {
  return moment().format(CFG_DATE_FORMAT)
}

function unixtime() {
  return moment().unix()
}


function tjoin(arr, delimter='') {
  return arr.join(delimter);
}

function write(...arg) {
  var arr = [];
  for (var i = 0; i < arg.length; i++) {
    var str = tostring(arg[i]);
    arr.push(str);
  }

  var line = tjoin(arr, ' \t ');
  return process.stdout.write(line);
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




function tostring(v) {
  // can be OK, if you are su
  // re that value will never be
  // null or undefined.
  // Otherwise, ""+value and
  //  String(value) '
  // a're mostly equivalent.
  return String(v);
}

function substring(s, start, end) {
  return str.substring(start, end);
}

function gsub(str, pattern, fn) {
  var proc = fn;
  if (typeof(fn) == "string") {
    proc = function() {
      return fn
    }
  }

  var arr = []
  var pos = 0
  var other = ""
  var i = 0
  // var arr_match = str.match(gexp)
  // for (let i = 0; i < arr_match.length; ++i) {
  // };

  var regex = new RegExp(pattern, 'g')
  while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    var match = m && m[0];
    var start = m.index;
    var len = match.length

    if (pos < start) {
      other = str.substring(pos, start)
      arr.push(other)
    }
    pos = start + len

    var ret = proc.call(str, match, ++i, m)
    arr.push(ret || match)
  }

  if (pos < str.length) {
    other = str.substring(pos, str.length)
    arr.push(other)
  }
  return arr.join("");
}


module.exports = exports = {
	not        : not,
	do_nothing : do_nothing,
	md5        : md5,
  write      : write,
  now        : now,
	gsub       : gsub,
	substring  : substring,
	tostring   : tostring,
};


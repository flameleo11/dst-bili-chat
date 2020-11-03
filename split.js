
const print = console.log
const _ = require('underscore');


var cfg_poker_flags = ["♠", "♡", "♣", "♢"]
var pack_count = 0;
var cfg_poker_num = {}
cfg_poker_num[1]  = "A";
cfg_poker_num[10] = "T";
cfg_poker_num[11] = "J";
cfg_poker_num[12] = "Q";
cfg_poker_num[13] = "K";
cfg_poker_num[14] = "A";

function get_poker_num(index) {
	var n = index%13 + 1
	if (cfg_poker_num[n]) {
		return cfg_poker_num[n];
	}
	return n;
}


//----------------------------------------------------------
// func
//----------------------------------------------------------

// 回显过滤器

function is_echo(str, arr_prefix) {
  if (!(str && str.length > 0)) {
    return null;
  }
  var arr = arr_prefix || cfg_poker_flags;
  // var ch1 = str.charAt(0);
  var ch1 = str[0];

  // var flag = _.find(arr, (prefix)=>{
  //   return msg.startsWith(prefix)
  // });
  if (arr.includes(ch1)) {
    return true;
  }
  return false;
}

function get_prefix_char(arr, count) {
	return arr[count % arr.length];
}

// for en/cn split by length
function split_str_by_maxlen(str, maxlen) {
	var fmt = `.{1,${maxlen}}`
  return str.match(new RegExp(fmt, 'g'));
}

function pack_split_str(str, arr_prefix) {
  var arr = [];
  if (!(str && str.length > 0)) {
    return arr
  }
	var arr_token = split_str_by_maxlen(str, 17)
  arr_prefix = arr_prefix || cfg_poker_flags;
	var prefix = get_prefix_char(arr_prefix, pack_count++);

 	var c = 14 - arr_token.length
  _.each(arr_token, (token, i)=>{
  	var n = get_poker_num(i+c)
  	arr.push(prefix + n + " " + token)
  })

	return arr;
}

var str = `

You can 
remove the ignore case modifier since
但是我真的
怀疑
我是否可以修改它，以确保单词不会被分成两半。有小费吗？
`


// var arr = pack_split_str(str)
// print(arr)



exports.pack_split_str = pack_split_str;
exports.is_echo = is_echo;

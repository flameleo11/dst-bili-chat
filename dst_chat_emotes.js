

const print = console.log;

const _ = require('underscore');
var common = require('./common.js');

const not = common.not;
const gsub = common.gsub;
const assert = require('assert');


let cfg = {}

//----------------------------------------------------------
// config
//----------------------------------------------------------


// now owns chat emotes
const chat_emotes = [
	":chester:",
	":ghost:",
	":heart:",
	":battle:",
	":wave:",

	":lightbulb:",
	":crockpot:",
	":thumbsup:",
	":reline:",

	":meat:",
	":wormhole:",
	":web:",
	":gold:",
	":hammer:",
];

// now owns chat emotes
// auto link to "chester" command string
// before keyword or after
const emotes_trigger = {
	"chester": ["切斯特", "小妾", "小切"],
	"ghost": ["鬼魂", "鬼", "幽灵", "灵魂"],
	"heart": ["生命", "血", "爱了", "爱心", "心", "爱", "nice", "喜欢"],
	"battle": ["战斗", "武器", "打"],
	"wave": ["well done", "合作愉快", "好", "ok", "恩", "嗯", "en"],

	"lightbulb": ["哈哈", "有了", "准了", "光", "想到了"],
	"crockpot": ["有锅没", "锅", "做点吃的", "做饭"],
	"thumbsup": ["good", "牛逼", "厉害", "叼", "强", "棒棒哒", "nb", "np"],
	"refine": ["宝石", "无价", "好东西"],

	"meat": ["大肉", "生肉", "肉","吃的", "饿"],
	"wormhole": ["虫洞"],
	"web": ["蜘蛛网", "蛛网", "网"],
	"gold": ["金子", "金的", "金"],
	"hammer": ["锤", "砸", "工具"],
}


function init_cfg_emotes_trigger() {
	var arr_key = [];
	var arr_rep = [];

  _.each(emotes_trigger, function(arr, cmd) {
  	var key = "";
  	var rep = `:${cmd}:`
		for (i = 0; i < arr.length; i++) {
			key = arr[i]
			arr_key.push(key);
			arr_rep.push(rep);

		}
		arr_key.push(cmd);
		arr_rep.push(rep);
  })

  cfg.arr_key = arr_key;
  cfg.arr_rep = arr_rep;

}

init_cfg_emotes_trigger() 

//----------------------------------------------------------
// func
//----------------------------------------------------------

function replace_keys(str, arr_key, arr_rep) {
	var pos = 0
  var newstr = gsub(str, ".", (ch, j, m)=>{
  	var start = m.index;
  	if (start < pos) { return }
  	var len = 0;
  	var end = start + len;
  	var key = "";
  	var find_str = ""
  	var i = 0

// print(j, ch)
		for (i = 0; i < arr_key.length; i++) {
			key = arr_key[i];

// print(111,i,key)			
	  	if (! key.startsWith(ch)) {
// print(222,i,key, j, ch, pos)				  		
	  		continue;
	  	}
	  	len = key.length
	  	end = start + len
// print(333,i,key)				  		
	  	var cmp_str = str.substring(start, end)
	  	if (cmp_str == key) {
	  		assert(key);
	  		find_str = key;
	  		pos = end;
// print(444,i,key)				  			  		
	  		break;
	  	}
		}

		if (find_str) {
			var rep = arr_rep[i];
			return rep + ch;
		}
  })
  return newstr;
}

function fix_msg_by_chat_emotes(str) {
	var arr_key = cfg.arr_key;
	var arr_rep = cfg.arr_rep;
	// if (cfg.arr_key == null) {
	// 	init_emotes_trigger()
	// }
  var newstr = replace_keys(str, arr_key, arr_rep)
	return newstr
}

function random_chat_emotes() {
	var arr = chat_emotes;
	var x = _.random(1, arr.length) - 1;
	return chat_emotes[x];
}



module.exports = exports = {
	fix_str : fix_msg_by_chat_emotes,
	random  : random_chat_emotes,
};



//----------------------------------------------------------
// test
//----------------------------------------------------------

// const animals = ['pigs', 'goats', 'sheep'];

// const count = animals.push('cows');


// print(count, animals, animals.concat('cows2') )
// print(count, animals, animals.concat('cows2') )

// var str = 'sheep'
// var arr_key = ["xx", "xhee", "ee"]
// var arr_rep = ["1", "2", "3"]


// var ret = replace_keys(str, arr_key, arr_rep)
// print(ret)


// print(random_chat_emotes())

// var str = '没有金子了'
// var str = '切斯特有没？'
// var str = '变成灵魂了'
// print(fix_msg_by_chat_emotes(str) )



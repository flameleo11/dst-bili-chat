var print = console.log;


const { spawn } = require('child_process');



//----------------------------------------------------------
// config
//----------------------------------------------------------

var cluster_name = "ds1"

var cfg_master_chat_log = `/drive_d/game/dstserver/klei/${cluster_name}/Master/server_chat_log.txt`
var cfg_cave_chat_log = `/drive_d/game/dstserver/klei/${cluster_name}/Caves/server_chat_log.txt`
var client_chat_log = "/drive_d/game/dstserver/klei/client_chat_log.txt"

const fs_dst_chat_log = spawn('tail', ['-f', cfg_master_chat_log]);
// dst_chat_log.stdout.pipe(process.stdout)


//----------------------------------------------------------
// func
//----------------------------------------------------------

function toggle() {
  fs_dst_chat_log.stdout.on('data', function (buf) {
    var str = buf.toString();
    // print(typeof str, str)
    var line = str.trim();
    em.emit('dispatch_dst_chat', line);
  });
}

//----------------------------------------------------------
// event
//----------------------------------------------------------

em.on('dispatch_dst_chat', function (line) {
  // todo asert data is line
  // print(111, line)
  var item = null;
try {
  item = parseChatLineDST(line);
} catch (error) {
  print(`[err] parseChatLineDST ${line}`)
  // expected output: ReferenceError: nonExistentFunction is not defined
  // Note - error messages will vary depending on browser
}
  if (item == null) {
    return
  }


  var timeline = item.timeline;
  var name     = item.name;
  var uid      = item.uid;
  var action   = item.action;
  var data     = item.data;
  var msg      = item.msg;

  // echo off
  if (msg.startsWith("/")) {
    print("dst chat echo:", name, msg)
    return
  }

  switch (action) {
    case 'Say':
      pushTextMultiLine(`【${name}】: ${msg}`)
      break;
    case 'Join Announcement':
      pushTextMultiLine(` ${timeline}【${name}】加入游戏`)
      break;
    case 'Leave Announcement':
      pushTextMultiLine(` ${timeline}【${name}】离开游戏`)
      break;
    case 'Death Announcement':
      pushTextMultiLine(`【${name}】死亡 ${data}`)
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
      print("[DST unknow action]", action, line)
  }



});



//----------------------------------------------------------
// base
//----------------------------------------------------------

fs.truncateSync(cfg_dst_bilichat_pipe)
fs.truncate(cfg_dst_bilichat_pipe, 0, function(){print('clear dst chat cache.')})

var stdout = fs.createWriteStream(cfg_dst_bilichat_pipe, {flags:'a'});
var stdin = process.stdin;
stdin.setEncoding('utf-8');





//----------------------------------------------------------
// init
//----------------------------------------------------------

// var _M = getglobaldata("bilichat")
const _M = {};
_M.arr_bili_chat_queue = []
_M.keywordHandler = {}
_M.cmdHandler = {}
_M.bilichatCount = 0
_M.db = null;

var gg_sendMsgQueue = [];
var gg_enable_sendMsgQueue = false;

//----------------------------------------------------------
// util
//----------------------------------------------------------

function tostring(v) {
  // can be OK, if you are su
  // re that value will never be
  // null or undefined.
  // Otherwise, ""+value and
  //  String(value) '
  // a're mostly equivalent.
  return String(v);
}

function md5(str) {
  var hash = crypto.createHash('md5').update(str).digest('hex');
  return hash;
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

    var ret = proc.call(str, match, ++i)
    arr.push(ret || match)
  }

  if (pos < str.length) {
    other = str.substring(pos, str.length)
    arr.push(other)
  }
  return arr.join("");
}


function not(b) {
  return (!(b))
}

function updateRoomChatHistory(roomid, fn) {
  var form = {
    roomid: roomid,
  };

  var formData = querystring.stringify(form);
  var contentLength = formData.length;
  // print(contentLength)
  var option = {
    headers: {
      'Content-Length': contentLength,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    uri: 'https://api.live.bilibili.com/xlive/web-room/v1/dM/gethistory',
    body: formData,
    method: 'POST'
  }

  request(option, (err, res, body) => {
try {
    var json = body;
    if (not(json)) {
      // print("[error] JSON.parse", json)
      return 
    }
    var obj = JSON.parse(json);
    var chatlist = obj.data.room;
    var cache = {}
    fn(chatlist)
} catch (error) {
  print("[error] JSON.parse", error, json)
}    
  });
}

function sendChatMsg(uid, roomid, msg, fn) {
  var cookie = getUserCookie(uid);
  const regex = /bili_jct=(\w+);/;
  var ret = cookie.match(regex);
  var csrf = ""
  if (ret && ret[1]) {
    csrf = ret[1]
  }

  var form = {
    color: 16777215,
    fontsize: 25,
    mode: 1,
    msg: msg,
    rnd: 1592205622,
    roomid: roomid,
    bubble: 0,
    csrf_token: csrf,
    csrf: csrf,
  };

  var formData = querystring.stringify(form);
  var contentLength = formData.length;
  // print("POST bili chat msg length:", contentLength)

  var option = {
    headers: {
      'Content-Length': contentLength,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'cookie': cookie
    },
    uri: 'https://api.live.bilibili.com/msg/send',
    body: formData,
    method: 'POST'
  }
  request(option, function (err, res, body) {
    var tbl = JSON.parse(body);
    fn(tbl);
  });

}

function getUserCookie(uid) {
  const cookie = "_uuid=B4E4CB64-BC9D-47C8-33ED-1CBF7ECCCE1B83506infoc; LIVE_BUVID=AUTO6715787964835614; sid=i2okuy0h; CURRENT_FNVAL=16; rpdid=|(JYm|J|u|)J0J'ul~)mu|)JY; INTVER=1; buvid3=A542C18B-41D4-4C69-B687-FBAB368900E6155805infoc; bsource=seo_baidu; DedeUserID=68988848; DedeUserID__ckMd5=02c296d5e047ed40; SESSDATA=5e41b577%2C1607700225%2C2e86c*61; bili_jct=2b0ab726f9a838d69981cd1389a68908; Hm_lvt_8a6e55dbd2870f0f5bc9194cddf32a02=1592193441,1592194176,1592194701,1592196209; Hm_lpvt_8a6e55dbd2870f0f5bc9194cddf32a02=1592196209; _dfcaptcha=9061fb0b67f9e0e67582b36edbdffdd8; PVID=59"
  return cookie;
}

function getAdmin() {
  return my_uid;
}

function getCurrentRoom() {
  return my_roomid;
}

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


function sendToDST(msg, tag) {
  // trace(`${tag}->DST: ${msg}`)
  var txt = `##${tag}##${msg}`
  stdout.cork();
  stdout.write(txt);
  stdout.uncork();
}

function bilichatTextFilter(str) {
  // [ \u2E80-\uFE4F
  var text = str.replace(/[^\n\u2E80-\uFE4F \w~!@#$%^&*()_+{}|:\"<>?\`\-=\[\]\\;\',./_]/g, '')
  return text;
}

function TextSplitByWidth(str, fixedWidth, delimeter) {
  delimeter = delimeter || "\n";
  fixedWidth = fixedWidth || 1;

  var ansi_pattern = /[\x00-\x7F]/
  var width = 0
  var ansi_width = 1;
  var other_width = 2;

  var ret = gsub(str, ".", (ch, i)=>{
    var delta = 0
    if (ch.match(ansi_pattern)) {
      delta = ansi_width
    } else {
      delta = other_width
    }
    width = width + delta

    if (width > fixedWidth) {
      width = delta
      return delimeter + ch
    }
  })
  return ret;
}

function TextSplitArrayByWidth(str, fixedWidth, delimeter) {
  delimeter = delimeter || "\n";
  fixedWidth = fixedWidth || 1;

  var ansi_pattern = /[\x00-\x7F]/
  var width = 0
  var ansi_width = 1;
  var other_width = 2;

  var repstr = gsub(str, ".", (ch, i)=>{
    var delta = 0
    if (ch.match(ansi_pattern)) {
      delta = ansi_width
    } else {
      delta = other_width
    }
    width = width + delta

    if (width > fixedWidth) {
      width = delta
      return delimeter + ch
    }
  })
  // var delimeter = "\n";
  var arr = repstr.split(delimeter);
  return arr;
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


function toggleConsoleInput() {
  stdin.on('data', function (str) {
    // print(222, typeof str, str)

    switch (str) {
      case 'exit\n':
      // case 'quit\n':
        exit();
        break;
      default:
        var msg = str.trim()
        sendToDST(msg, "console")
        pushTextMultiLine(msg)
    }
  });
}

function toggleSecondTimer() {
  var sec = 0;
  var tm = setInterval(() => {
    // todo
    em.emit('on_second', {sec: sec++});
  }, cfg_1_sec);
  return tm
}

function toggle_mongodb() {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    dbo = db.db("dst");
    _M.db = db
    _M.dbo = dbo

    dbo.createCollection("users", function(err, res) {
      if (err) throw err;
      print("[db] init dst.users");
      // db.close();
    });
  });
}

function toggle_test() {
  var str = "~!@#$%^&*()_+{}|:\"<>?\`-=[]\\;\',./"
  var print = console.log;
  for (var i = 0; i < str.length; i++) {
    var ch = str.charAt(i);
    var msg = `xxx ${i} xxx ${ch} xxx`;
    pushTextMultiLine(msg)
  }

}

function toggleDebugParseChatLineDST() {
  var line = "[03:00:41]: [Say] (KU_0vPtVLJa) 哲学家van＄: 缺噩梦燃料吗"
  var item
try {
  item = parseChatLineDST(line);
} catch (error) {
  print(error)
  // expected output: ReferenceError: nonExistentFunction is not defined
  // Note - error messages will vary depending on browser
}
  // body...
}

function mapping(x, x0, x1, y0, y1) {
  if (x1 <= x0) {
    return 0;
  }
  x = Math.max(x, x0);
  x = Math.min(x, x1);
  var y = (x-x0)/(x1-x0) * (y1-y0)
  return y;
}

function toggleBiliBroadcastPostTimed() {
  sendBiliChatBotMsg(1)
  sendBiliChatBotMsg(2)
  sendBiliChatBotMsg(3)



// todo by user trigger
// too much broadcast msg mask game chat &
// command reply
  var trigger_count = 3;
  var sec = 1000 * 30 * 1;
  var last_push_id = 0
  setInterval(()=>{
    var delta = _M.bilichatCount - last_push_id;
// print(111, delta)    
    // if (delta > trigger_count) {
      var p = mapping(delta+1, 0, 30, 0, 1)
      var x = Math.random()
      var lucky = (p + x - 1) > 0
// print(222, delta, p, x, lucky)
      if (lucky) {
      // if ((1-x) < p) {
        // sendBiliChatBotMsg()
        last_push_id = _M.bilichatCount;
      }
    // }
  }, sec);
}

function sendBiliChatBotMsg(x) {
  // // todo key
  // if (_M.last_cache && not(_M.last_cache[key])) {
  //   pushTextMultiLine(msg)
  // }
  var items = [
    "输入/help查询命令",
    "steam饥荒DST路人联机\n/room查看房间号",
    "你可以发送聊天消息到游戏内喔！！",
    "输入/room查看房间号",
    "输入/summon 或者输入召唤,姐姐等,召唤出鬼魂姐姐",
    "标准生存模式:路人随机",
    // "steam饥荒夏季促销￥16双份\n买了还能送朋友!!",
    // "饥荒冬天开始后,就没人感进来了",
    // "门是静居的象征，是引退的象征",
    // "是心灵躲进幸福的宁静的象征，或是陷入悲伤的秘密挣扎的象征",
    // "生活不会静止不前，听任我们孤独下去。",
    // "我们心怀希望不断地把门打开，心怀绝望地又把门关上。",
    "修复了一些影响平衡的bug",
    "修复了利用卡位bug击杀犀牛",
    "正在做玩家纵火日志",
    "正在做反外挂功能",
    "next屏蔽夜视,屏蔽高速走A脚本",
    // "一个个下地大展宏图,开着夜视,绕过蜘蛛准备走A欺负犀牛,一旦发现不能用bug了,就熄火了",

    // "next外挂检测，增加猪王拍卖行",
    // "门是静居的象征，是引退的象征，是心灵躲进幸福的宁静的象征，或是陷入悲伤的秘密挣扎的象征。",
    // "生活不会静止不前，听任我们孤独下去。我们心怀希望不断地把门打开，心怀绝望地又把门关上。",
  ];
  var i = x || _.random(1, items.length);
  var msg = items[i-1];
  if (not(msg && msg.length > 0)) {
    return 
  }
  pushTextMultiLine(msg)

}




function testBiliChatPost() {
  var fs = require('fs');
  var data = null;
  try {
      var data = fs.readFileSync('test_str.txt', 'utf8');
      console.log(data.toString(), data.length);
  } catch(e) {
      console.log('Error:', e.stack);
  }
  if (data) {
    pushTextMultiLine(data)
  }
}

function isChatComand(uid, msg, item) {
  // by check ret onBiliChatCommand(uid, msg, item)
}

function createTextReply(v) {
  var text = tostring(v)
  return (()=>{
    pushTextMultiLine(text)
  });
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

function cmd_std(cmd) {
  return strlower(cmd);
}

function addBiliChatComandFn(cmds, fn) {
  var arr = cmds.split(/,| |\|/);
  var cmdHandler = _M.cmdHandler;
  _.each(arr, (cmd, i)=>{
    cmd = cmd_std(cmd)
    // fn(uid, msg, item, cmd);
    cmdHandler[cmd] = fn;
  })
}

function addBiliChatKeywordFn(keywords, fn) {
  var arr = keywords.split(/,| |\|/);
  var keywordHandler = _M.keywordHandler;
  _.each(arr, (keyword, i)=>{
    keywordHandler[keyword] = fn;
  })
}

function keywordCheckor(text, keyword) {
  // single char check 1st char
  if (text.includes(keyword)) {
    return true;
  }
  return false;
}

function cmdCheckor(text, cmd) {
  if ( text.startsWith("-"+cmd)
    || text.startsWith("/"+cmd)
    || text.startsWith(":"+cmd) ) {
    return true;
  }
  return false;
}

function findCmdFromText(text) {
  var ret = text.match(/^[-://](\w+)/)
  if (ret && ret[1]) {
    return cmd_std(ret[1])
  }
  return null;
}


function isTextContainsKeyword(msg) {
  var keywordHandler = _M.keywordHandler;
  var included = _.find(keywordHandler, (fn, keyword)=>{
    return msg.includes(keyword);
  })
  if (included) {
    return true;
  }
  return false;
}

function findChatKeyword(msg) {
  var keywordHandler = _M.keywordHandler;
  var lastkeyword = "";
  var fn = _.find(keywordHandler, (fn, keyword)=>{
    var find = msg.includes(keyword);
    if (find) {
      lastkeyword = keyword
    }
    return msg.includes(keyword);
  })
  return lastkeyword;
}




function onBiliChatCommand(uid, msg, item) {
  var keywordHandler = _M.keywordHandler;
  var cmdHandler = _M.cmdHandler;
  var cmd = findCmdFromText(msg)

  if (cmdHandler[cmd]) {
    var fn = cmdHandler[cmd];
    fn(uid, msg, item, cmd);
    return [1, cmd, fn];
  }

// print(111, msg, isTextContainsKeyword(msg))
  // exactly match keyword will return 
  var keyword = findChatKeyword(msg);
// print(111, msg, keyword)
  if (keyword) {
    var fn = keywordHandler[keyword];
    fn(uid, msg, item, keyword)
// print(222, msg)
    if (keyword == msg) {
      return [2, keyword, fn];
    }
  }

  return null
}

function onRecvBiliChat(uid, msg, item) {
  if ( trace(onBiliChatCommand(uid, msg, item), "bilichat cmd") ) {
    return
  }

  var v = item;
  var chattime = (v.timeline).slice(-8);
  var txt = `${v.nickname}: ${v.text}`;
  if (v.uid == cfg_uid_me) {
    txt = `${v.text}`;
  }

  // todo check uid by premissons
  // print("[info] bili -> dst:", `${chattime} ${v.nickname}: ${v.text}`);
  sendToDST(txt, "bilichat")
}

function pushRoomInfo() {
  var config = ini.parse(fs.readFileSync(cfg_cluster_ini, 'utf-8'))

  var name = (config.NETWORK.cluster_name);
  var desc = (config.NETWORK.cluster_description);
  var info = `房间名称: ${name}\n描述: ${desc}`
  pushTextMultiLine(info);
}


function pushRoomPasswdInfo() {
  var config = ini.parse(fs.readFileSync(cfg_cluster_ini, 'utf-8'))

  var name = (config.NETWORK.cluster_name);
  var passwd = (config.NETWORK.cluster_password);
  var info = `房间名称: ${name}\n密码: ${passwd}`
  pushTextMultiLine(info);
}




//----------------------------------------------------------
// on recv
//----------------------------------------------------------

em.on('update_bili_chat', function () {

  var last_cache = _M.last_cache;
  // print('[info] bili_ch222at: ', last_cache);
  var arr = _M.arr_bili_chat_queue;

  updateRoomChatHistory(my_roomid, (chatlist)=>{
    var cache = {}
    // print(chatlist)

    _.each(chatlist, function(v, k) {
      // print(k, v);
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
      }

      // todo limit user same chat times
      var short = `${v.uid}|${v.timeline}|${v.text}`;
      var key = md5(short);
      var chattime = (v.timeline).slice(-8);

      cache[key] = item;
      if (_M.last_cache == null) {
        print(`${chattime} ${v.nickname}: ${v.text}`);
      }

      if (_M.last_cache && not(_M.last_cache[key])) {
        arr.push(item)
        
      }
    })

    _M.last_cache = cache;
  })

});

em.on('dispatch_bili_chat', function () {
  var arr = _M.arr_bili_chat_queue;
  if (not(arr && arr.length > 0)) return;

  var item = arr.shift();
  var uid = item.uid;
  var msg = item.text;
  var name = item.name;

  var datetime = dateFormat(new Date(), "hh:MM:ss");
  // show all
  // print(`[bili] ${datetime} ${name}: ${msg}`)

  // echo off
  if (biliChatEchoFilter(uid, msg, item)) {
    _M.bilichatCount = _M.bilichatCount + 1;
    print(`${datetime} ${name}: \n${msg}`)
    onRecvBiliChat(uid, msg, item)
  }
});

// [00:00:40]: [Join Announcement] Leo
// [00:00:50]: [Say] (KU__9qL15UL) Leo: 1111
// [00:00:41]: [Join Announcement] Leo
// [00:29:12]: [Leave Announcement] Leo
function parseChatLineDST(line) {
  var str = line.trim();
  var p1 = /^\[(\d\d:\d\d:\d\d)\]:\s*\[([\w ]+)\]\s*(.*)/;
  var p2 = /\(([\w ]+)\)\s*([^:]+):(.*)/;

  var timeline = "";
  var action = "";
  var data   = "";
  var uid    = "";
  var name   = "";
  var msg    = "";


  var ret = str.match(p1);
  if (ret && ret[1]) {
    timeline = ret[1];
    action = ret[2];
    data = ret[3];
    name = data;
    msg = ""
    if (action == "Say") {
      var ret2 = data.match(p2);
      uid  = ret2[1];
      name = ret2[2];
      msg  = ret2[3];
    }
  }

  msg = msg.trim()
  // print(`${timeline}|${action}|${name}|${msg}`)

  return {
    timeline: timeline,
    name: name,
    uid: uid,
    action: action,
    data: data,
    msg: msg,
  }
}

em.on('ERR_NOT_CATCH', function (err) {
  print('[error] unknow: ' + err);
});

//----------------------------------------------------------
// main
//----------------------------------------------------------


function exit() {
  stdout.end();
  clearInterval(gg_timer_sec);
  process.exit();
}

function init() {



  var _R = createTextReply;

  addBiliChatKeywordFn("什么游戏|name", _R("steam饥荒together"))
  addBiliChatKeywordFn("房间|room", pushRoomInfo)
  addBiliChatKeywordFn("密码|passwd|password", pushRoomPasswdInfo)


  addBiliChatKeywordFn("表情|emote", _R("输入/emote: 查询游戏人物表情列表"))
  addBiliChatKeywordFn("cmd|command", _R("输入/help: 查询命令列表"))


// print(_M.keywordHandler)

  var help_info = `
输入
/room 查询饥荒房间号
/emote 查询饥荒表情列表
/roll 掷随机点数
输入/summon 或者输入召唤,姐姐等,召唤出鬼魂姐姐
跟随 [玩家职业|序号]
比如:
跟随 wendy
跟随 1
开礼物
`
  addBiliChatKeywordFn("帮助|help|命令", _R(help_info))
  addBiliChatComandFn("help", _R(help_info))
  var emote_text = `
输入 /dance 跳舞
表情列表:
facepalm joy sad
annoyed rude carol
toast squat sit
angry happy bonesaw
kiss pose dance
`
  addBiliChatComandFn("emote", _R(emote_text))

  // todo send to dst
  addBiliChatComandFn("roll", (uid, msg, item, cmd)=>{
    var usernick = item.name;
    var x = _.random(0, 100);
    var info = `${usernick} 掷出了 ${x} (1-100)`
    pushTextMultiLine(info);
  })

  addBiliChatComandFn("room", pushRoomInfo)

  // toggle_mongodb()
  toggleConsoleInput()
  toggleDSTChatLogInput()


  setTimeout(()=>{
    gg_timer_sec = toggleSecondTimer();
    toggleSendMsgQueue();
    toggleBiliBroadcastPostTimed();
  }, 1000);


  // setTimeout(toggle_test, 3000);
  process.on('uncaughtException', function(err) {
    em.emit('ERR_NOT_CATCH', err);
  });

  em.on('on_second', function () {
    em.emit('update_bili_chat');
    em.emit('dispatch_bili_chat');
  });



  setTimeout(()=>{
    // testBiliChatPost()
  }, 1000);

  // toggleDebugParseChatLineDST()

}




init()
// main()

print("[dst] ready to chat:")

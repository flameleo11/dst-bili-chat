
let config = {};

module.exports = exports = config;
//----------------------------------------------------------
// config
//----------------------------------------------------------

const dst_lua_root = "/drive_d/SteamLibrary/steamapps/common/Don't Starve Together/data";
const dstserver_path = "/drive_d/SteamLibrary/steamapps/common/Don't Starve Together Dedicated Server";

const uri_str1 = "_uuid=B4E4CB64-BC9D-47C8-33ED-1CBF7ECCCE1B83506infoc; LIVE_BUVID=AUTO6715787964835614; sid=i2okuy0h; CURRENT_FNVAL=16; rpdid=|(JYm|J|u|)J0J'ul~)mu|)JY; INTVER=1; buvid3=A542C18B-41D4-4C69-B687-FBAB368900E6155805infoc; bsource=seo_baidu; DedeUserID=68988848; DedeUserID__ckMd5=02c296d5e047ed40; SESSDATA=5e41b577%2C1607700225%2C2e86c*61; bili_jct=2b0ab726f9a838d69981cd1389a68908; Hm_lvt_8a6e55dbd2870f0f5bc9194cddf32a02=1592193441,1592194176,1592194701,1592196209; Hm_lpvt_8a6e55dbd2870f0f5bc9194cddf32a02=1592196209; _dfcaptcha=9061fb0b67f9e0e67582b36edbdffdd8; PVID=59"
const uri_str2 = "_uuid=B4E4CB64-BC9D-47C8-33ED-1CBF7ECCCE1B83506infoc; LIVE_BUVID=AUTO6715787964835614; sid=i2okuy0h; CURRENT_FNVAL=16; rpdid=|(JYm|J|u|)J0J'ul~)mu|)JY; INTVER=1; buvid3=A542C18B-41D4-4C69-B687-FBAB368900E6155805infoc; DedeUserID=68988848; DedeUserID__ckMd5=02c296d5e047ed40; SESSDATA=5e41b577%2C1607700225%2C2e86c*61; bili_jct=2b0ab726f9a838d69981cd1389a68908; bp_video_offset_68988848=411854296739572773; bp_t_offset_68988848=411854296739572773; bsource=search_baidu; _dfcaptcha=e687fe131c2c7afb10cccc0496e21591; Hm_lvt_8a6e55dbd2870f0f5bc9194cddf32a02=1594600813,1594978706,1596375983,1596727608; Hm_lpvt_8a6e55dbd2870f0f5bc9194cddf32a02=1596727608; PVID=15"
const interval_min = 1200;
const interval_safe = 1200;
const my_uid = 68988848;


const cluster_name    = "ds1"
const master_chat_log = `/drive_d/game/dstserver/klei/${cluster_name}/Master/server_chat_log.txt`
const cave_chat_log   = `/drive_d/game/dstserver/klei/${cluster_name}/Caves/server_chat_log.txt`
const client_chat_log = "/drive_d/game/dstserver/klei/client_chat_log.txt"
const cfg_cluster_ini = `/drive_d/game/dstserver/klei/${cluster_name}/cluster.ini`



//----------------------------------------------------------
// exports
//----------------------------------------------------------

config.uid     = 68988848;
config.klei_uid = "KU__9qL15UL";

config.hostuid = 68988848;
config.roomid = 4136343;
config.cookie = uri_str2;

config.min_sendinterval     = interval_min;
config.dstserver_path       = dstserver_path;
config.master_chat_log_path = master_chat_log;
config.cfg_cluster_ini      = cfg_cluster_ini;





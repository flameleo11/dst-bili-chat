
let config = {};

module.exports = exports = config;
//----------------------------------------------------------
// config
//----------------------------------------------------------

const dst_lua_root = "/game/Don't Starve Together/data";
const dstserver_path = "/game/Don't Starve Together Dedicated Server";

const uri_str1 = "_uuid=xxx"
const uri_str2 = "_uuid=xxx"
const my_uid = 68000000;


const interval_min = 1200;
const interval_safe = 1200;


const cluster_name    = "ds1"
const master_chat_log = `/game/dstserver/klei/${cluster_name}/Master/server_chat_log.txt`
const cave_chat_log   = `/game/dstserver/klei/${cluster_name}/Caves/server_chat_log.txt`
const client_chat_log = "/game/dstserver/klei/client_chat_log.txt"
const cfg_cluster_ini = `/game/dstserver/klei/${cluster_name}/cluster.ini`



//----------------------------------------------------------
// exports
//----------------------------------------------------------

config.uid     = 68000000;
config.klei_uid = "KU__XXXXXXX";

config.hostuid = 68000000;
config.roomid  = 4136343;
config.cookie  = uri_str2;

config.min_sendinterval     = interval_min;
config.dstserver_path       = dstserver_path;
config.master_chat_log_path = master_chat_log;
config.cfg_cluster_ini      = cfg_cluster_ini;





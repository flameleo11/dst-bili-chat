
var print = console.log;
const chokidar = require('chokidar');
const fs = require('fs');



var cf = require('./copy_file.js');

var exec = require('child_process').exec;

//----------------------------------------------------------
// config
//----------------------------------------------------------

const session_pattern = /\/session\/([A-Z0-9]+)\/([0-9]+)$/;

var klei_folder = "/home/me/.klei/DoNotStarveTogether";

var master_session = `${klei_folder}/ds1/Master/save/session`;
var cave_session   = `${klei_folder}/ds1/Caves/save/session`;

var backup_folder        = `${klei_folder}/ds1/test`;
var master_backup_folder = `${klei_folder}/ds1/save_session/master`;
var cave_backup_folder   = `${klei_folder}/ds1/save_session/cave`;


function errfunc(error, stdout, stderr) {
	if (error) {
		console.log(`error: ${error.message}`);
		return;
	}
	if (stderr) {
		console.log(`stderr: ${stderr}`);
		return; 
	}
  // console.log(`stdout: ${stdout}`);
}

exec("mkdir -p "+master_backup_folder, errfunc);
exec("mkdir -p "+cave_backup_folder, errfunc);

print(master_backup_folder)
print(cave_backup_folder)


function do_backup(tag, path, b_load_last = false) {
	// var path = "./session/A00D6713A51918CA/0000000010"
	var backup_folder = master_backup_folder;
	var session_folder = master_session;

	if (tag == "cave") {
		backup_folder = cave_backup_folder;
		session_folder = cave_session;
	}

	var ret = path.match(session_pattern)
	if (ret && ret[0]) {
		// backup like this: A00D6713A51918CA 0000000010
		var session_id = ret[1];
		var slot_name = ret[2];
		var rename = session_id +"-"+ slot_name

		// load game before
// print(Date.now(), ".............", tag, slot_name, 111)
		if (parseInt(slot_name) == parseInt("0000000002")) {
			if (b_load_last) {
// print(Date.now(), ".............", tag, slot_name, 222)
				print(tag, backup_folder, session_folder+"/"+session_id)
				cf.load(backup_folder, session_folder+"/"+session_id+"/"+"0000000002")
// print(Date.now(), "........cf.load.....", tag, backup_folder, session_folder+"/"+session_id+"/"+"0000000002", 333)										
			}
		}

		if (parseInt(slot_name) > parseInt("0000000003")) {
			cf.backup(rename, path, backup_folder) 
		} 
	}

}


//----------------------------------------------------------
// test
//----------------------------------------------------------

// watcher.on('all', (event, path) => {
//   console.log(event, path);
// });

const watcher_setting = {
  ignoreInitial: true,
  awaitWriteFinish: true,
}

const watcher1 = chokidar.watch(master_session, watcher_setting);
const watcher2 = chokidar.watch(cave_session, watcher_setting);

watcher1.on('add', (path) => {
	do_backup("master", path, false)
});

watcher2.on('add', (path) => {
	console.log("[+]", path);
	do_backup("cave", path, true)

});


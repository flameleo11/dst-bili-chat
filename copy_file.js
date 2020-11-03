const fs = require('fs');
// By using COPYFILE_EXCL, the operation will fail if destination.txt exists.
const { COPYFILE_EXCL } = fs.constants;

var print = console.log;
var delim = "-"

const getAllDirFiles = function(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllDirFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(file)
    }
  })

  return arrayOfFiles
}

function pad(a,b){return(1e15+a+"").slice(-b)}

function countFilesInFolder(dirPath) {
  var files = fs.readdirSync(dirPath)
  // print(files)
  return files.length
}

function get_last_session_file(dirPath) {
  // assume files sort by names
  var files = fs.readdirSync(dirPath)
  if (files.length > 0) {
    return files[files.length - 1];
  }
}


// destination.txt will be created or overwritten by default.
function copy_file(org, dest) {
	fs.copyFileSync(org, dest);
	// fs.copyFileSync('source.txt', 'destination.txt', COPYFILE_EXCL);
}

// destination.txt will be created or overwritten by default.
function backup_session_file(rename, file_path, dest_folder) {
	var count = countFilesInFolder(dest_folder)

	// 0000000010
	var prefix = pad(count+1, 10)
	var dest_path = `${dest_folder}/${prefix}${delim}${rename}`

	copy_file(file_path, dest_path)
}

function load_session_file(backup_folder, dest_path) {
  var name1 = get_last_session_file(backup_folder)
  // var name2 = get_last_session_file(dest_folder)
  if (name1) {
    var org_path = `${backup_folder}/${name1}`
    // var dest_path = `${dest_folder}/${name2}`
    copy_file(org_path, dest_path)
  }
}

module.exports = exports = {
	backup : backup_session_file,
  load : load_session_file,
	copyto : copy_file,
};


//----------------------------------------------------------
// test
//----------------------------------------------------------



// const session_pattern = /\/session\/([A-Z0-9]+)\/([0-9]+)/;

// var klei_folder = "/home/me/.klei/DoNotStarveTogether";

// var master_session = `${klei_folder}/ds1/Master/save/session`;
// var cave_session   = `${klei_folder}/ds1/Caves/save/session`;

// var backup_folder1 = `${klei_folder}/ds1/master_session`;
// var backup_folder2 = `${klei_folder}/ds1/cave_session`;


// var dest_folder   = `${klei_folder}/ds1/test`;
// // var count = countFilesInFolder(tttt)
// // print(count, pad(count, 10))


// // /drive_d/game/dstserver/klei/ds1/save_session
// var rename = `A00D6713A51918CA${delim}0000000128`
// var file_path = `${cave_session}/A00D6713A51918CA/0000000028`

// backup_save(rename, file_path, dest_folder)



// var klei_folder = "/home/me/.klei/DoNotStarveTogether";

// var master_session = `${klei_folder}/ds1/Master/save/session`;
// var cave_session   = `${klei_folder}/ds1/Caves/save/session`;

// var backup_folder        = `${klei_folder}/ds1/test`;
// var master_backup_folder = `${klei_folder}/ds1/save_session/master`;
// var cave_backup_folder   = `${klei_folder}/ds1/save_session/cave`;



// load_session_file(master_backup_folder, master_session+"/47B584B7A5490918")
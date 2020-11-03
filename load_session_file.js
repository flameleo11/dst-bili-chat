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
  files = fs.readdirSync(dirPath)
  // assume files sort by names
  print(files)
  return files.length
}

// destination.txt will be created or overwritten by default.
function copy_file(orc, dest) {
	fs.copyFileSync(orc, dest);
	// fs.copyFileSync('source.txt', 'destination.txt', COPYFILE_EXCL);
}

// destination.txt will be created or overwritten by default.
function backup_save(rename, file_path, dest_folder) {
	var count = countFilesInFolder(dest_folder)

	// 0000000010
	var prefix = pad(count+1, 10)
	var dest_path = `${dest_folder}/${prefix}${delim}${rename}`

	copy_file(file_path, dest_path)
	// fs.copyFileSync('source.txt', 'destination.txt', COPYFILE_EXCL);
}



module.exports = exports = {
	backup : backup_save,
	copyto : copy_file,
};






//----------------------------------------------------------
// test
//----------------------------------------------------------



const session_pattern = /\/session\/([A-Z0-9]+)\/([0-9]+)/;

var klei_folder = "/home/me/.klei/DoNotStarveTogether";

var master_session = `${klei_folder}/ds1/Master/save/session`;
var cave_session   = `${klei_folder}/ds1/Caves/save/session`;

var backup_folder        = `${klei_folder}/ds1/test`;
var master_backup_folder = `${klei_folder}/ds1/save_session/master`;
var cave_backup_folder   = `${klei_folder}/ds1/save_session/cave`;


var count = countFilesInFolder(cave_backup_folder)
// print(count, pad(count, 10))


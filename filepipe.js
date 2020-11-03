
var print = console.log;

const _ = require('underscore');
const assert = require('assert');
const fs = require('fs');
const { spawn } = require('child_process');
var EventEmitter = require('events').EventEmitter;
var util = require('util');


const delimiter = '\n'
const fn = (data)=>{
  return data;
};


function truncate_file(path) {
  // file must exist
  // fs.truncateSync(path, 0)
  fs.writeFileSync(path, ''); 
}


function touch_file(path) {
  var fd = fs.openSync(path, "w");
  fs.closeSync(fd); 
}



//----------------------------------------------------------
// class
//----------------------------------------------------------

function FilePipe(options) {
  EventEmitter.call(this);

  this.encoder = options.encoder || fn;
  this.decoder = options.decoder || fn;
  this.delimiter = options.delimiter || delimiter;

  this.send_path = null;
  this.send_fs = null;

  this.listen_path = null;
  this.listen_fs = null;

  this.on("*", (event, data)=>{
    if (event !== "*") {
      this.emit(event, data) 
    }
  })

};

util.inherits(FilePipe, EventEmitter);
module.exports = exports = FilePipe;

//----------------------------------------------------------
// methods
//----------------------------------------------------------

FilePipe.prototype.connect = function (path) {
  this.open(path);
}

FilePipe.prototype.open = function (path) {
  // touch_file(path)
  // truncate_file(path)
  
  this.send_path = path;
  this.send_fs = fs.createWriteStream(path, {flags:'a'});
// print(111, this.send_fs)  
  assert(this.send_fs, "[error] FilePipe send_fs is null @send")

}

FilePipe.prototype.send = function (data) {
  assert(this.send_fs, "[error] FilePipe send_fs is null @send")

  var str = this.encoder(data);
  this.send_fs.cork();
  this.send_fs.write(str);
  this.send_fs.write(this.delimiter);
  this.send_fs.uncork();
}

FilePipe.prototype._dispatch = function (str) {
  var arr = str.split(this.delimiter);
  if (!(arr && arr.length > 0)) {
    return
  }

  _.each(arr, (line, i)=>{
    if (!(line && line.length > 0)) {
      return
    }

    try {
      var data = this.decoder(line);
      if (data != null) {
        this.emit("*", "data", data);
      }
    } catch (error) {
      print("[error] FilePipe decode ", line, error)
    }
  })
}

FilePipe.prototype.listen = function (path) {
  touch_file(path);

  this.listen_path = path;
  this.listen_fs = spawn('tail', ['-f', path]);
  var _this = this;

  this.listen_fs.stdout.on('data', function (buf) {
    var str = buf.toString();
    // str.trim();
// print(111, str, Date.now())
    if (str && str.length > 0) {
      _this._dispatch(str);
    }
  });
}

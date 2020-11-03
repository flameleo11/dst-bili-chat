
var print = console.log;

// let config = {};
// module.exports = exports = config;


//----------------------------------------------------------
// rem
//----------------------------------------------------------

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function randstr() {
	var len = 8
  var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"
  var str = "";

  for (var i = 0; i < len; i++) {
    var random_index = randomInteger(0, charset.length);
    var start = charset[random_index];
    var ch = charset.substring (start, 1);
    // string ch = charset.get_char(bpos).to_string ();
    str += ch;
  }
  return str;
}

exports.randstr       = randstr;
exports.randomstr       = randstr;
exports.randomInteger = randomInteger;
exports.randomNumber  = randomNumber;


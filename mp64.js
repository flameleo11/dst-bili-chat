const msgpack = require('msgpack');

var mp64 = {}

function encode(data) {
  var buf = msgpack.pack(data);
  return buf.toString('base64');
}

function decode(str) {
  var buf = Buffer.from(str, 'base64');
  var data = msgpack.unpack(buf);
  return data
}

module.exports = exports = mp64;

mp64.encode = encode;
mp64.decode = decode;

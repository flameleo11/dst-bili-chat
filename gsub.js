
function gsub(str, pattern, fn) {
  var proc = fn;
  if (typeof(fn) == "string") {
    proc = function() {
      return fn
    }
  }

  var gexp = new RegExp(pattern, 'g')
  var arr_match = str.match(gexp)
  var arr = []
  for (let i = 0; i < arr_match.length; ++i) {
    var match = arr_match[i]
    var ret = proc.call(str, match, i+1)
    arr.push(ret || match)
  };
  return arr.join("");
}

function buildUrl(url, parameters){
  var qs = "";
  for(var key in parameters) {
    var value = parameters[key];
    qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
  }
  if (qs.length > 0){
    qs = qs.substring(0, qs.length-1); //chop off last "&"
    url = url + "?" + qs;
  }
  return url;
}

function stringFormat(str, obj) {
    return str.replace(/\{\s*([^}\s]+)\s*\}/g, function(m, p1, offset, string) {
        return obj[p1]
    })
}

function capitaliseFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
    buildUrl: buildUrl,
    stringFormat: stringFormat,
    capitaliseFirstLetter: capitaliseFirstLetter
};
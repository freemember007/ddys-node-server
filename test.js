var http = require('http');
var querystring = require('querystring');

var post_data = JSON.stringify({
  spid: '9901',
  channel: '13',
  sign: '5f54e74af1ec3276d298da5a15831170',
  format: 'JSON',
  random: '065c',
  oper: '127.0.0.1',
  service: 'appdocarticleinfo',
  ghArticleId: '227',
  isEncode: '1'
});

var options = {
  host: 'ws.diandianys.com',
  port: 80,
  path: '/app',
  method: 'POST',
  headers: {'Content-Type': 'application/json;charset=UTF-8', 'Content-Length': post_data.length}
};


var req = http.request(options, function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
});

// write data to request body
req.write(post_data + "\n");
req.end();
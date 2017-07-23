exports.send = function(obj) {

  var TopClient = require('./lib/top/topClient'); //淘宝客户端
  var client = new TopClient({
    'appkey': '23348843',
    'appsecret': '5faad3ebbf5022c24e0a3e60c64eff66',
    'REST_URL': 'http://gw.api.taobao.com/router/rest'
  });

  client.execute('alibaba.aliqin.fc.sms.num.send', {
    extend: '',
    sms_type: 'normal',
    sms_free_sign_name: '特扬工作流',
    sms_param: obj.sms_param,
    rec_num: obj.rec_num,
    sms_template_code: obj.sms_template_code
  }, function(error, response) {
    if (!error) console.log(response);
    else console.log(error);
  });
};
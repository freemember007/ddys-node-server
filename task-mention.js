exports.mention = function () {
  var rp = require('request-promise'); //http请求库
  var moment = require('moment');
  var TopClient = require('./lib/top/topClient'); //淘宝客户端
  var sendSms = require('./send-sms');

  //组装数据
  // var client = new TopClient({
  //   'appkey': '23348843',
  //   'appsecret': '5faad3ebbf5022c24e0a3e60c64eff66',
  //   'REST_URL': 'http://gw.api.taobao.com/router/rest'
  // });
  var options = {
    method: 'GET',
    uri: 'https://api.bmob.cn/1/classes/task',
    headers: {
      'X-Bmob-Application-Id': '5d447ad3a22ca5a70ec26ca01a9f5176',
      'X-Bmob-REST-API-Key': '8a010f08c229de9b811d3a86a3b24c1b'
    },
    json: true
  };
  var whereString = JSON.stringify({
    status: 1,
    deadline: {'__type': 'Date', 'iso': moment().format('YYYY-MM-DD 00:00:00')}
  });
  options.uri += encodeURI('?where=' + whereString);
  options.uri += encodeURI('&include=' + 'assignee');

  rp(options).then(function (data) {
    var tasks = data.results || {};
    console.log(tasks.length);
    for (var i = 0; i < tasks.length; i++) {
      console.log(tasks[i]);
      sendSms.send({
        sms_param: {
          name: tasks[i].assignee.name,
          title: tasks[i].title
        },
        rec_num: tasks[i].assignee.mobilePhoneNumber,
        sms_template_code: 'SMS_10680836'

      })
      // client.execute('alibaba.aliqin.fc.sms.num.send', {
      //   extend: '',
      //   sms_type: 'normal',
      //   sms_free_sign_name: '特扬工作流',
      //   sms_param: {
      //     name: tasks[i].assignee.name,
      //     title: tasks[i].title
      //   },
      //   rec_num: tasks[i].assignee.mobilePhoneNumber,
      //   sms_template_code: 'SMS_10680836'
      // }, function (error, response) {
      //   if (!error) console.log(response);
      //   else console.log(error);
      // });
    }
  });
};

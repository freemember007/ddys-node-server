var koa = require('koa');
var app = koa();
var logger = require('koa-logger');
var gzip = require('koa-gzip');
var serve = require('koa-static'); //静态文件服务
var bodyParser = require('koa-bodyparser');
var route = require('koa-route');
var dot = require('koa-dot'); //dot模板引擎
var rp = require('request-promise'); //promise版的request
var _ = require('lodash');


// 此处插入特扬工作流部分代码
var CronJob = require('cron').CronJob;
var taskMention = require('./task-mention');
var sendSms = require('./send-sms');
var checkTask = require('./check-task');


new CronJob('00 00 9,18,21 * * *', function() {
  console.log('You will see this message every second');
  taskMention.mention();
}, null, true, 'Asia/Chongqing');
new CronJob('00 30 9,18 * * *', function() {
  console.log('检查饱和度任务启动!');
  checkTask.check();
}, null, true, 'Asia/Chongqing');


var params = {
  spid: '9901',
  channel: '13',
  sign: '5f54e74af1ec3276d298da5a15831170',
  format: 'JSON',
  random: '065c',
  oper: '127.0.0.1'
};
var options = {
  method: 'POST',
  uri: 'http://192.168.56.61:8004/app',
  body: {},
  json: true
};

app.use(logger());
app.use(gzip());
app.use(serve('public'), {
  maxage: 30 * 24 * 60 * 60
});
app.use(bodyParser());
app.use(dot({
  path: './views',
  layout: true,
  body: 'body',
  interpolation: {start: '{{', end: '}}'}
}));

// 医生文章接口
app.use(route.get('/docArticle/:articleId', function *(articleId) {
  this.state.title = '医生文章';
  options.body = _.extend({}, params, {
    service: 'appdocarticleinfo',
    ghArticleId: articleId,
    isEncode: 0
  });
  this.state.article = yield rp(options).then(function(data){
    console.log(data.info.ghArticleContent);
    data.info.ghArticleContent = data.info.ghArticleContent.replace(/[\n\r]+/g, '<br>');
    return data.info;
   });
  options.body = _.extend({}, params, {
    service: 'appdocdescv2',
    docId: 33063
  });
  yield this.render('docArticle', this.state);
}));

// 发送短信接口
app.use(route.post('/api/sms', function *() {
  console.log(this.request.body);
  sendSms.send(this.request.body);
  this.body = '短信发送中...';
}));

// 其他情况
app.use(function *() {
  this.body = 'hi World';
});

app.use(function *() {
  this;
  this.request;
  this.response;
});

app.listen(8090, function () {
  console.log('Koa is listening to http://localhost:8090');
});
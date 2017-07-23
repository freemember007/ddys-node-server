exports.check = function () {


  // 外部模块载入
  var util = require('util');
  var async = require('async');
  var _ = require('underscore');
  var rp = require('request-promise'); //http请求库
  var moment = require('moment'); //时间格式化
  var sendSms = require('./send-sms'); //发送短信


  // bmob请求所需基本数据
  var options = {
    method: 'GET',
    headers: {
      'X-Bmob-Application-Id': '5d447ad3a22ca5a70ec26ca01a9f5176',
      'X-Bmob-REST-API-Key': '8a010f08c229de9b811d3a86a3b24c1b'
    },
    json: true
  };


  async.auto({

    // 查询所有用户
    getAllUserIds: function (callback) {
      options.uri = 'https://api.bmob.cn/1/classes/_User';
      var whereString = JSON.stringify({
        hidden: {$ne: true}
      });
      options.uri += encodeURI('?where=' + whereString);
      options.uri += encodeURI('&keys=' + 'objectId,mobilePhoneNumber,name');
      rp(options).then(function (data) {
        var users = data.results || {};
        var allUserIds = _.pluck(users, 'objectId');
        // util.log('所有用户IDs', allUserIds);
        callback(null, {allUserIds: allUserIds, allUsers: users});
      });
    },

    // 查询有任务的用户
    getUserIdsHasTask: function (callback) {
      options.uri = 'https://api.bmob.cn/1/classes/task';
      var whereString = JSON.stringify({
        status: 1
      });
      options.uri += encodeURI('?where=' + whereString);
      options.uri += encodeURI('&keys=' + 'assignee');
      rp(options).then(function (data) {
        var tasks = data.results || {};
        var usersHasTask = _.pluck(tasks, 'assignee');
        var userIdsHasTask = _.uniq(_.compact(_.pluck(usersHasTask, 'objectId')));
        // util.log('有任务的userIDs', userIdsHasTask)
        callback(null, {userIdsHasTask: userIdsHasTask})
      });
    },

    // 查询没有进行中的任务的用户
    getUserIdsHasNotTask: ['getAllUserIds', 'getUserIdsHasTask', function (results, callback) {
      var userIdsHasNotTask = _.difference(results.getAllUserIds.allUserIds, results.getUserIdsHasTask.userIdsHasTask);
      // util.log('没有任务的userIDs', userIdsHasNotTask);
      callback(null, {userIdsHasNotTask: userIdsHasNotTask})
    }],

    // 查询没有任务的用户的上司手机号并发短信
    doSendSms: ['getAllUserIds', 'getUserIdsHasNotTask', function (results, callback) {
      async.each(results.getUserIdsHasNotTask.userIdsHasNotTask, function (userId, callback) {
        options.uri = 'https://api.bmob.cn/1/classes/team';
        var whereString = JSON.stringify({
          'members': {'__type': 'Pointer', 'className': '_User', 'objectId': userId}
        });
        options.uri += encodeURI('?where=' + whereString);
        options.uri += encodeURI('&keys=' + 'leader,company');
        options.uri += encodeURI('&include=' + 'leader,company.boss');
        rp(options).then(function (data) {
          var team = data.results[0] || {};
          if (!team.leader) return;
          var leaderPhone = team.leader.mobilePhoneNumber;
          var bossPhone = team.company.boss.mobilePhoneNumber;
          var user = _.findWhere(results.getAllUserIds.allUsers, {objectId: userId}) || {};
          var superiorPhone = userId == team.leader.objectId ? bossPhone : leaderPhone;
          var userPhone = user.mobilePhoneNumber;
          util.log('短信信息', user.name, team.leader.name, team.company.boss.name, rec_num);
          sendSms.send({
            sms_param: {
              name: user.name,
              percent: '0%'
            },
            rec_num: superiorPhone,
            sms_template_code: 'SMS_12185399'
          });
          sendSms.send({
            sms_param: {
              percent: '0%'
            },
            rec_num: userPhone,
            sms_template_code: 'SMS_12205536'
          });
          callback(null)
        });
      }, function (err) {
        if (err) util.log(err);
      })
    }]

  }, function (err, results) {
    if (err) util.log(err);
    callback(null)
  })


};

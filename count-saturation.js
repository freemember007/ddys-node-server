/**
 * Created by xjp on 16/7/7.
 * 计算团队平均未来饱和度
 */

exports.countSaturation = function() {
  var rp = require('request-promise'); //http请求库
  var moment = require('moment');
  var _ = require('lodash');

  //一周开始,今天
  var thisWeekStart = new Date();
  thisWeekStart.setHours(0,0,0,0);
  //一周结束,6天后
  var thisWeekEnd = new Date();
  thisWeekEnd.setDate(thisWeekEnd.getDate() + 6);
  thisWeekEnd.setHours(0,0,0,0);

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
    // assignee: 'EuGz444d',
    status: 1,
    deadline: {'$gte': {'__type': 'Date', 'iso': moment(thisWeekStart).format('YYYY-MM-DD 00:00:00')}}
  });
  options.uri += encodeURI('?where=' + whereString);
  options.uri += encodeURI('&include=' + 'assignee,team.leader');

  rp(options).then(function(data){
    var tasks = data.results || [];
    console.log(tasks.length);
    _.remove(tasks, function (o) { //删除leader的任务
      return o.assignee.objectId === o.team.leader.objectId;
    });
    console.log(tasks.length);
    var tasksGroupedByTeam = {};
    tasksGroupedByTeam = _.groupBy(tasks, 'team.leader.name'); //按teamLeader分组
    // 计算每个team的平均未来饱和度并存入数据库
    for(var k in tasksGroupedByTeam){
      var tasksGroupedByAssignee = {};
      tasksGroupedByAssignee = _.groupBy(tasksGroupedByTeam[k], 'assignee.name'); //按assignee分组
      var teamSaturationArray = []; //数组用于临时存放团队每个人的饱和度
      var teamAverageSaturation = 0; //团队平均未来饱和度
      for(var l in tasksGroupedByAssignee){
        var totalCostHoursThisWeek = 0; //个人总工作量
        var saturation = 0; // 个人饱和度
        // 计划每个成员的未来饱和度
        for (var i = 0; i < tasksGroupedByAssignee[l].length; i++) {
          var task = tasksGroupedByAssignee[l][i];
          //任务开始时间
          var createdAt = task.createdAt.replace(/-/g, '/');
          createdAt = new Date(createdAt);
          createdAt.setHours(0,0,0,0);
          //任务结束时间
          var deadline = task.deadline.iso.replace(/-/g, '/');
          deadline = new Date(deadline);
          deadline.setHours(0,0,0,0);
          // 本周一减任务开始日的天数
          var startDaysDiff = (thisWeekStart.getTime() - createdAt.getTime())/(24*60*60*1000);
          // 任务结束日减本周日的天数
          var endDaysDiff = (deadline.getTime() - thisWeekEnd.getTime())/(24*60*60*1000);
          // 任务在本周的天数
          var costDaysThisWeek = 7 + (startDaysDiff < 0 ? startDaysDiff : 0) + (endDaysDiff < 0 ? endDaysDiff : 0);
          // 任务总天数
          var costDays = (deadline.getTime() - createdAt.getTime())/(24*60*60*1000) + 1; //注意:算上当天,故要加一天
          // 任务总耗时
          var costHours = task.costHours;
          // 任务在本周的耗时
          var costHoursThisWeek = costHours/costDays*costDaysThisWeek;
          // console.log(task.title+'\n');
          // console.log(costDays+'days\n');
          // console.log(costDaysThisWeek+'days\n');
          // console.log(costHoursThisWeek+'hours\n');
          totalCostHoursThisWeek += costHoursThisWeek;
        }
        saturation = _.round(totalCostHoursThisWeek/40*100, 0);
        console.log(l);
        console.log(saturation);
        teamSaturationArray.push(saturation);
      }
      teamAverageSaturation = _.round(_.mean(teamSaturationArray), 0);
      console.log(k);
      console.log(teamAverageSaturation);
    }

  });
};

exports.countSaturation();



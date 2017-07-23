var route = require('koa-route');
//
module.exports = routes;
function routes() {
  route.get('/docArticle/:articleId', docArticle);
}

function docArticle() {
  this.state.title = '医生文章';
  this.state.article = yield fetch();
  console.log(this.state.article);
  // this.state.article = ' 我是下载的文章内容';
  this.render('docArticle', this.state);
}
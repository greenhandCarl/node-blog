
const express = require('express');

const swig = require('swig');

const mongoose = require('mongoose');

const bodyParser = require('body-parser');

const Cookies = require('cookies');

const app = express();

const User = require('./models/User');

// 静态文件托管
app.use('/public', express.static(`${__dirname}/public`))

app.engine('html', swig.renderFile);

app.set('views', './views');

app.set('view engine', 'html');

app.use(bodyParser.urlencoded({extended: true}))
// app.use(bodyParser()) // koa-bodyparser的用法

// 设置cookies
app.use((req, res, next) => {
  req.cookies = new Cookies(req, res);
  req.userInfo = {};
  if (req.cookies.get('userInfo')) {
    try {
      req.userInfo = JSON.parse(req.cookies.get('userInfo'))
      User.findById(req.userInfo._id).then((userInfo) => {
        req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
        next();
      })
    } catch (e) {
      next();
    }
  } else {
    next();
  }
});

// 开发环境 设置缓存
swig.setDefaults({cache: false});

mongoose.Promise = global.Promise;

app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));
app.use('/', require('./routers/main'));

mongoose.connect('mongodb://localhost:27017/blog', (err) => {
  if (err) {
    console.log('数据库连接失败');
  } else {
    console.log('数据库连接成功');
    app.listen(3000);
  }
});

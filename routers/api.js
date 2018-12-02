const express = require('express');

const router = express.Router();

const User = require('../models/User');

let responseData = {};
router.use((req, res, next) => {
  responseData.code = 0;
  responseData.message = '';
  next();
})

router.post('/user/signup', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const repassword = req.body.repassword;

  // 校验非空
  if (username.trim('') === '') {
    responseData.code = 1;
    responseData.message = '用户名不能为空';
    res.json(responseData);
    return;
  }
  if (password.trim('') === '') {
    responseData.code = 2;
    responseData.message = '密码不能为空';
    res.json(responseData);
    return;
  }
  if (repassword.trim('') !== password.trim('')) {
    responseData.code = 2;
    responseData.message = '密码不一致';
    res.json(responseData);
    return;
  }

  // 查询数据库
  User.findOne({
    username
  }).then((userInfo) => {
    if (userInfo) {
      responseData.code = 4;
      responseData.message = '用户名已被注册';
      res.json(responseData);
      return;
    }
    // 保存用户注册信息
    const user = new User({username, password})
    return user.save();
  }).then((newUserInfo) => {
    responseData.message = '注册成功';
    res.json(responseData);
  });

});

router.post('/user/signin', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username.trim('') === '' || password.trim('') === '') {
    responseData.code = 1;
    responseData.message = '用户名或密码不能为空';
    res.json(responseData);
    return;
  }
  // 查询数据库
  User.findOne({username, password}).then((userInfo) => {
    if (!userInfo) {
      responseData.code = 2;
      responseData.message = '用户名或密码错误';
      res.json(responseData);
      return;
    } else {
      responseData.message = '登录成功';
      responseData.userInfo = {
        _id: userInfo._id,
        username: userInfo.username
      }
      req.cookies.set('userInfo', JSON.stringify({
        _id: userInfo._id,
        username: userInfo.username
      }));
      res.json(responseData);
      return;
    }
  })
})

router.get('/user/signout', (req, res, next) => {
  req.cookies.set('userInfo', null);
  res.json(responseData);
});

module.exports = router;
const mongoose = require('mongoose');

// 分类的表结构
module.exports = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }, // 关联分类表 类型是Types.ObjectId
  // 用户id
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // 点击量
  views: {
    type: Number,
    default: 0
  },
  // 添加时间
  addTime: {
    type: Date,
    default: new Date()
  },
  // 评论
  comments: {
    type: Array,
    dafault: []
  },
  title: String,
  desc: String,
  content: String
}, {usePushEach: true});
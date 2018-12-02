const express = require('express');

const router = express.Router();
const Category = require('../models/Category');
const Content = require('../models/Content');
const data = {categories: [], }

router.use(async (req, res, next) => {
  data.userInfo = req.userInfo
  data.categories = await Category.find()
  next()
})

router.get('/', (req, res, next) => {
  const data = {
    cate: req.query.category || '',
    pages: 0,
    pagination: {},
    contents: [],
    userInfo: req.userInfo
  }
  let where = {}
  if (data.cate) {
    where.category = data.cate
  }
  let page = Number(req.query.page || 1);
  const limit = 2;
  Category.find().then((categories) => {
    data.categories = categories;
    return Content.where(where).count()
  }).then((count) => {
    const pages = Math.ceil(count/limit);
    page = Math.min(page, pages);
    page = Math.max(page, 1);
    const skip = (page - 1) * limit;
    data.pagination = {
      currentPage: page,
      total: count,
      size: limit,
      pages
    }
    return Content.find().where(where).sort({_id: -1}).limit(limit).skip(skip).populate(['category', 'user'])
  }).then((contents) => {
    data.contents = contents
    res.render('main/index', data);
  })
  
});

router.get('/view', async (req, res) => {
  const id = req.query.contentId || ''
  data.content = await Content.findOne({
    _id: id
  }).populate('user')
  res.render('main/view', data)
})

router.post('/comment', (req, res) => {
  const responseData = {
    userInfo: req.userInfo,
    comments: [],
    commentTime: new Date()
  }
  const id = req.body.id
  const comment = req.body.comment
  Content.findOne({_id: id}).then((con) => {
    con.comments[con.comments.length] = comment
    return Content.update({_id: id}, {comments: con.comments})
  }).then(() => {
    return Content.findOne({_id: id})
  }).then((newContents) => {
    responseData.comments = newContents.comments
    res.json(responseData)
  })
})

router.get('/test', async (req, res) => {
  res.render('main/test', data)
})

module.exports = router;
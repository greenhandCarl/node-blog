const express = require('express');

const router = express.Router();

const User = require('../models/User');
const Category = require('../models/Category');
const Content = require('../models/Content');

router.use((req, res, next) => {
  if (!req.userInfo.isAdmin) {
    res.send('对不起，只有管理员才可以进入后台管理');
    return;
  }
  next();
})

router.get('/', (req, res, next) => {
  res.render('admin/index', {
    userInfo: req.userInfo
  });
  return;
})

router.get('/user', (req, res, next) => {
  let page = Number(req.query.page || 1);
  const limit = 2;
  
  User.count().then((count) => {
    const pages = Math.ceil(count/limit);
    page = Math.min(page, pages);
    page = Math.max(page, 1);
    const skip = (page - 1) * limit;

    User.find().limit(limit).skip(skip).then((users) => {
      res.render('admin/user_index', {
        userInfo: req.userInfo,
        users,
        pagination: {
          currentPage: page,
          total: count,
          size: limit,
          pages,
          url: '/user'
        }
      })
    });
    
  })
});

router.get('/category', (req, res, next) => {
  let page = Number(req.query.page || 1);
  const limit = 2;
  
  Category.count().then((count) => {
    const pages = Math.ceil(count/limit);
    page = Math.min(page, pages);
    page = Math.max(page, 1);
    const skip = (page - 1) * limit;

    Category.find().sort({_id: -1}).limit(limit).skip(skip).then((categories) => {
      res.render('admin/category_index', {
        userInfo: req.userInfo,
        categories,
        pagination: {
          currentPage: page,
          total: count,
          size: limit,
          pages,
          url: '/category'
        }
      })
    });
  })
})

router.get('/category/add', (req, res, next) => {
  res.render('admin/category_add', {
    userInfo: req.userInfo
  })
})

router.post('/category/add', (req, res, next) => {
  const name = req.body.name
  if(name.trim(' ') === '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '分类名称不能为空'
    })
    return
  }
  Category.findOne({
    name
  }).then((rs) => {
    if (rs) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '该分类名称已存在'
      })
      return Promise.reject('error')
    } else {
      return new Category({
        name: name
      }).save()
    }
  }).then((newCategory) => {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '分类保存成功',
      url: '/admin/category'
    })
  })
})

router.get('/category/edit', (req, res, next) => {
  const _id = req.query.id || '';
  Category.findOne({
    _id
  }).then(category => {
    if (!category) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '分类信息不存在'
      })
      return Promise.reject()
    } else {
      res.render('admin/category_edit', {
        userInfo: req.userInfo,
        category: category
      })
    }
  })
  
})

router.post('/category/edit', (req, res, next) => {
  const _id = req.query.id || '';
  const name = req.body.name || '';
  Category.findOne({
    _id
  }).then(category => {
    if (!category) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '分类信息不存在'
      })
      return Promise.reject()
    } else {
      // 当用户没有做任何修改或提交的时候
      if (name === category.name) {
        res.render('admin/success', {
          userInfo: req.userInfo,
          message: '修改成功',
          url: '/admin/category'
        })
        return Promise.reject()
      } else {
        // 要修改的分类在数据库中是否已经存在
        return Category.findOne({
          _id: {$ne: _id},
          name: name
        })
      }
    }
  }).then((sanmeCategory) => {
    if (sanmeCategory) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '数据库中已存在同名分类'
      })
      return Promise.reject()
    } else {
      return Category.update({_id}, {name})
    }
  }).then(() => {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '修改成功',
      url: '/admin/category'
    })
  })
})

router.get('/category/delete', (req, res, next) => {
  const _id = req.query.id
  Category.remove({_id}).then(() => {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '删除成功',
      url: '/admin/category'
    })
  })
})

router.get('/content/add', (req, res, next) => {
  Category.find().sort({_id: -1}).then((categories) => {
    res.render('admin/content_add', {
      userInfo: req.userInfo,
      categories
    })
  })
})

router.post('/content/add', (req, res, next) => {
  const type = req.body.type
  const title = req.body.title
  const desc = req.body.desc
  const content = req.body.content
  if (title === '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '标题不能为空'
    })
    return
  }
  new Content({
    category: type,
    title,
    desc,
    content,
    user: req.userInfo._id.toString(),
  }).save().then((rs) => {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '添加内容成功',
      url: '/admin/content'
    })
  })
})

router.get('/content', async (req, res, next) => {
  let page = Number(req.query.page || 1);
  const limit = 2;
  let count = await Content.count()
  pages = Math.ceil(count/limit);
  page = Math.min(page, pages);
  page = Math.max(page, 1);
  skip = (page - 1) * limit;
  let contents = await Content.find().sort({_id: -1}).limit(limit).skip(skip).populate(['category', 'user'])
  res.render('admin/content_index', {
    userInfo: req.userInfo,
    contents,
    pagination: {
      currentPage: page,
      total: count,
      size: limit,
      pages,
      url: '/content'
    }
  })
})

router.get('/content/edit', (req, res, next) => {
  const _id = req.query.id || '';
  Content.findOne({
    _id
  }).populate('category').then((content) => {
    if (!content) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '内容信息不存在'
      })
      return Promise.reject()
    } else {
      Category.find().sort({_id: -1}).then((categories) => {
        res.render('admin/content_edit', {
          userInfo: req.userInfo,
          content,
          categories
        })
      })
    }
  })
})

router.post('/content/edit', (req, res, next) =>{
  const _id = req.query.id || '';
  const type = req.body.type
  const title = req.body.title
  const desc = req.body.desc
  const cont = req.body.content
  Content.findOne({_id}).populate('category').then((content) => {
   if (!content) {
      res.render('admin/error', {
          userInfo: req.userInfo,
          message: '内容信息不存在'
      })
      return Promise.reject()
   } else {
      // 当用户没有做任何修改或提交的时候
      if (
        type === content.category._id.toString()
        && title === content.title
        && desc === content.desc
        && cont === content.content
      ) {
        res.render('admin/success', {
          userInfo: req.userInfo,
          message: '修改成功',
          url: '/admin/content'
        })
        return Promise.reject()
      } else {
        return Content.update({_id}, {
          category: type,
          title,
          desc,
          content: cont
        })
      }
   }
  }).then(() => {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '修改成功',
      url: '/admin/content'
    })
  })
})

router.get('/content/delete', (req, res, next) => {
  const _id = req.query.id
  Content.remove({_id}).then(() => {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '删除成功',
      url: '/admin/content'
    })
  })
})

module.exports = router;
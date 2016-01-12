var express = require('express');
var router = express.Router();
var flash = require('connect-flash');
var crypto = require('crypto');
var User = require('../models/user');
var Post = require('../models/post');

// var user = function(req, res, next) {};
// var post = function(req, res, next) {};
// var reg = function(req, res) {
//   res.render('reg', {
//     title: '用户注册'
//   });
// };
// var doReg = function(req, res, next) {};
// var login = function(req, res, next) {};
// var doLogin = function(req, res, next) {};
// var logout = function(req, res, next) {};


/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', {
//     title: '首页'
//   });
// });

router.get('/', function(req, res) {
  Post.get(null, function(err, posts) {
    //console.log(err,posts);
    if (err) {
      posts = [];
    }
    res.render('index', {
      title: 'home',
      posts: posts
    });
    // console.log(res);
  });
});

router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res) {
  res.render('reg', {
    title: 'reg'
  });
});

router.post('/reg', checkNotLogin);
router.post('/reg', function(req, res) {
  //检验用户两次输入的口令是否一致
  //console.log('req',req.body);
  if (req.body['password-repeat'] != req.body['password']) {
    //console.log('error', '两次输入的口令不一致');
    req.flash('error', 'Your new passwords did not match');
    return res.redirect('/reg');
  }
  //console.log('两次输入的口令一致');
  //生成口令的散列值
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');
  //console.log(password);
  var newUser = new User({
    name: req.body.username,
    password: password,
  });
  //console.log(newUser);
  //检查用户名是否已经存在
  User.get(newUser.name, function(err, user) {
    if (user)
      err = 'Username already exists.';
    //console.log(err, user);
    if (err) {
      req.flash('error', err);
      return res.redirect('/reg');
    }
    //如果不存在则新增用户

    newUser.save(function(err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/reg');
      }
      req.session.user = newUser;
      //console.log('success', '注册成功');
      req.flash('success', 'register success');
      res.redirect('/');
    });
  });
});

router.get('/login', checkNotLogin);
router.get('/login', function(req, res) {
  res.render('login', {
    title: 'login',
  });
});

router.get('/dropdown1', function(req, res) {
  res.render('dropdown', {
    title: 'Action',
  });
});
router.get('/dropdown2', function(req, res) {
  res.render('dropdown', {
    title: 'Another action',
  });
});
router.get('/dropdown3', function(req, res) {
  res.render('dropdown', {
    title: 'Something else here',
  });
});
router.get('/dropdown4', function(req, res) {
  res.render('dropdown', {
    title: 'Separated link',
  });
});

router.post('/login', checkNotLogin);
router.post('/login', function(req, res) {
  //生成口令的散列值
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');
  User.get(req.body.username, function(err, user) {
    if (!user) {
      req.flash('error', 'username not exist');
      return res.redirect('/login');
    }
    if (user.password != password) {
      req.flash('error', 'password wrong');
      return res.redirect('/login');
    }
    req.session.user = user;
    req.flash('success', 'login success');
    res.redirect('/');
  });
});

router.get('/logout', checkLogin);
router.get('/logout', function(req, res) {
  req.session.user = null;
  req.flash('success', 'Logout success');
  res.redirect('/');
});

router.post('/post', checkLogin);
router.post('/post', function(req, res) {
  var currentUser = req.session.user;
  var post = new Post(currentUser.name, req.body.post);
  post.save(function(err) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    req.flash('success', 'post success');
    res.redirect('/u/' + currentUser.name);
  });
});

router.get('/u/:user', function(req, res) {
  User.get(req.params.user, function(err, user) {
    if (!user) {
      req.flash('error', 'user not exist');
      return res.redirect('/');
    }
    Post.get(user.name, function(err, posts) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('user', {
        title: user.name,
        posts: posts,
      });
    });
  });
});

// router.get('/u/:user', user);
// router.post('/post', post);
// router.get('/reg', reg);
// router.post('/reg', doReg);
// router.get('/login', login);
// router.post('/login', doLogin);
// router.get('/logout', logout);

function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'need login');
    return res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', 'User logged in');
    return res.redirect('/');
  }
  next();
}

module.exports = router;

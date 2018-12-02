$(function () {
  function getValue(url){  
      //首先获取地址  
      var url = url || window.location.href;  
      //获取传值  
      var arr = url.split("?");  
      //判断是否有传值  
      if(arr.length == 1){  
          return {};  
      }  
      //获取get传值的个数
      var value_arr = arr[1].split("&");
      //循环生成返回的对象  
      var obj = {};  
      for(var i = 0; i < value_arr.length; i++){  
          var key_val = value_arr[i].split("=");  
          obj[key_val[0]]=key_val[1];  
      }  
      return obj;  
  }
  // 取消冒泡
  var host = 'http://localhost:3000'
  function stopBubble (e) {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    } else {
      window.event.cancelBubble = true;
    }
  }
  // nav
  // var navs = $('.nav_row').find('div');
  // navs.on('click', function (e) {
  //   navs.removeClass('row_active');
  //   $(this).addClass('row_active');
  // })
  // main
  var docHeight = document.documentElement.clientHeight;
  var main = $('main');
  var mainDom = main[0];
  var nav = $('nav');
  var navDom = nav[0];
  var bannerDiv = $('.index_banner');
  var bannerDivDom = bannerDiv[0];
  mainDom.style.minHeight = (docHeight - navDom.offsetHeight - bannerDivDom.offsetHeight) + 'px';
 
 // 切换登录注册用户信息
  var $signin_container = $('.signin_container');
  var $signup_container = $('.signup_container');
  var $user_info_container = $('.user_info_container');

  $signup_container.find('a').on('click', function (e) {
    stopBubble(e)
    $signup_container.hide();
    $signin_container.show();
  });

  $signin_container.find('a').on('click', function (e) {
    stopBubble(e)
    $signin_container.hide();
    $signup_container.show();
  });

  // 注册
  var $signup = $('#signup');
  $signup.on('click', function (e) {
    stopBubble(e);
    $.ajax({
      type: 'POST',
      url: '/api/user/signup',
      data: {
        username: $signup_container.find('[name=username]').val().trim(''),
        password: $signup_container.find('[name=password]').val().trim(''),
        repassword: $signup_container.find('[name=repassword]').val().trim(''),
      },
      dataType: 'json',
      success: function (res) {
        if (!res.code) {
          $signup_container.find('.warnText').html(res.message);
          const timerId = setTimeout(() => {
            $signup_container.hide();
            $signin_container.show();
          }, 1000);
        } else {
          $signup_container.find('.warnText').html(res.message);
        }
      }
    });
  });

  // 登录
  $signin_container.find('#signin').on('click', function (e) {
    stopBubble(e);
    $.ajax({
      type: 'POST',
      url: '/api/user/signin',
      dataType: 'json',
      data: {
        username: $signin_container.find('[name=username]').val().trim(''),
        password: $signin_container.find('[name=password]').val().trim(''),
      },
      success: function (res) {
          $signin_container.find('.warnText').html(res.message)
        if (!res.code) {
          window.location.reload()
        }
      }
    })
  })

  // 退出
  $('#signou').on('click', function (e) {
    $.ajax({
      url: '/api/user/signout',
      success: function (res) {
        window.location.reload();
      }
    })
  })
  // 首页内上下页切换
  var $lastPage = $('.lastPage');
  var $nextPage = $('.nextPage');
  $lastPage.on('click', function () {
    if ($(this).data('disabled')) {
      return
    }
    var params = getValue(window.location.href)
    var page = params.hasOwnProperty('page') ? params.page : 1
    var category = params.hasOwnProperty('category') ? params.category : ''
    page = Number(page) - 1
    window.location.href = '/?category='+ category +'&page=' + page
  })
  $nextPage.on('click', function () {
    if ($(this).data('disabled')) {
      return
    }
    var params = getValue(window.location.href)
    var page = params.hasOwnProperty('page') ? params.page : 1
    var category = params.hasOwnProperty('category') ? params.category : ''
    page = Number(page) + 1
    window.location.href = '/?category='+ category +'&page=' + page
  })
  // 提交评论
  var $com_submit = $('#com_submit');
  var $com_reset = $('#com_reset');
  var $com_area = $('#com_area');
  var $comment_main_container = $('#comment_main_container')
  $com_submit.on('click', function () {
    var comment = $com_area.val() || ''
    var id = $com_submit.data('article');
    $.ajax({
      type: 'POST',
      url: '/comment',
      data: {comment,id},
      dataType: 'json',
      success: function (result) {
        var html = ''
        for ( var key in result.comments ) {
          html += "<ul class='comment_main'>"
          html += "<li class='user_info'><span class='fl'>用户：carl</span> <span class='fr' style='font-size: 12px;'>2018-05-24</span></li>"
          html += "<li class='comment_content'>content</li>"
          html += "<li class='interaction'>赞， 回复， 踩， 举报</li>"
          html += "</ul>"
        }
        $comment_main_container.html(html)
        console.log(result)
      }
    })
  })
  $com_reset.on('click', function () {
    console.log('$com_reset')
  })
  
});
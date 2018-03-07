var ditto = {
    // page element ids
    content_id: "#content",
    sidebar_id: "#sidebar",
    back_to_top_id: "#back_to_top",
    loading_id: "#loading",
    error_id: "#error",

    // display elements
    sidebar: true,
    back_to_top_button: true,
    save_progress: true, // 保存阅读进度
    search_bar: true,

    // initialize function
    run: initialize
};

/**
 * 获取当前hash
 *
 * @param {string} hash 要解析的hash，默认取当前页面的hash，如： nav#类目 => {nav:nav, anchor:类目}
 * @description 分导航和页面锚点
 * @return {Object} {nav:导航, anchor:页面锚点}
 */
var getHash = function (hash) {
  hash = hash || window.location.hash.substr(1);

  if (!hash) {
    return {
      nav: '',
      anchor: ''
    }
  }

  hash = hash.split('#');
  return {
    nav: hash[0],
    anchor: decodeURIComponent(hash[1] || '')
  }
};

var menu = new Array();

function initialize() {
  // initialize sidebar and buttons
  if (ditto.sidebar) {
    init_sidebar_section();
  }

  if (ditto.back_to_top_button) {
    init_back_to_top_button();
  }

  // page router
  router();
  $(window).on('hashchange', router);
}
function init_menu_list(item){
  item.addClass('Nav')
  item.find('li').each(function(i,j){
    $(j).addClass('Nav__item')
    var child=$(j).find('ul')
    if(child.length){
      $(j).find('>h4').addClass('folder').append($('<i class="Nav__arrow">&nbsp;</i>'))
      $(j).addClass('has-children')
      init_menu_list(child)
    }
  })
}
function init_sidebar_section() {
    $.get(ditto.sidebar_file+'?t='+Math.random(), function (data) {
        $(ditto.sidebar_id).html(marked(data));
        init_menu_list($('#sidebar>ul'))

        $('#sidebar ul li>a').each(function(i,j){
           var n=$(j).attr('href').split('/')[1]?$(j).attr('href').split('/')[1]:$(j).attr('href').split('#')[1]
           $(this).parent('li').attr('id',n)
        })

        $('#sidebar ul a').click(function(){
           $('#sidebar ul li').removeClass('Nav__item--active')
           $(this).parent('li').addClass('Nav__item--active')
           var el=$(this).parents('.has-children.Nav__item--open:last')
           el.siblings('li.Nav__item--open').removeClass('Nav__item--open')
           el.parents('li.Nav__item--open').removeClass('Nav__item--open')
        })

        $('ul.Nav > li.has-children > h4').click(function() {
            $(this).parent().toggleClass('Nav__item--open');
            return false;
        });
        // 初始化内容数组
        var menuOL = $(ditto.sidebar_id + '>ul');
        menuOL.attr('start', 0);

        menuOL.find('li a').map(function() {
            menu.push(this.href.slice(this.href.indexOf('#')));
        });
        $('#pageup').on('click', function() {
            var hash = getHash().nav;
            for (var i = 0; i < menu.length; i++) {
                if (hash === '') break;
                if (menu[i] === '#' + hash) break;
            }
            location.hash = menu[i - 1]
        });
        $('#pagedown').on('click', function() {
            var hash = getHash().nav;
            for (var i = 0; i < menu.length; i++) {
                if (hash === '') break;
                if (menu[i] === '#' + hash) break;
            }
            location.hash = menu[i + 1];
        });
    }, "text").fail(function() {
        alert("Opps! can't find the sidebar file to display!");
    });
}

function init_debug_m(item){
  var debug_wrap=$('<div class="debug_wrap"></div>')
  var top=$('<div class="top"></div>')
  var params=$('<div class="params"></div>')
  var respones=$('<div class="respones"></div>')
  var init_params={url:item.data('url'),method:item.data('method'),params:eval('('+item.data('params')+')')}
  var float=$(
    `<div class="folat">
      <div class="sk-wave">
        <div class="sk-rect sk-rect1"></div>
        <div class="sk-rect sk-rect2"></div>
        <div class="sk-rect sk-rect3"></div>
        <div class="sk-rect sk-rect4"></div>
        <div class="sk-rect sk-rect5"></div>
      </div>
    </div>`)
 var top_button=$(`<div class="d_td">
    <select class="form-control method">
      <option value="get">GET</option>
      <option value="post">POST</option>
      <option value="put">PUT</option>
      <option value="delete">DELETE</option>
    </select>
  </div>
  <div class="d_td" style="width:87%;float:right;">
    <div class="input-group">
      <input type="text" class="form-control url" value="${init_params.url}" placeholder="Enter request URL">
      <span class="input-group-addon cursor btn-main">调试</span>
      <span class="input-group-addon cursor btn-save">保存</span>
    </div>
  </div>`)
  top_button.appendTo(top)
  top_button.find(`.method option[value="${init_params.method}"]`).attr("selected", true);
  var paramsTr=""
  var paramKeys=Object.keys(init_params.params)
  for(var i=0;i<paramKeys.length;i++){
      paramsTr +=`<div class="key_row">
                    <div class="key"><input type="text" value="${paramKeys[i]}" class="form-control" data-stage="key"></div>
                    <div class="value"><input type="text"  value="${init_params.params[paramKeys[i]]}"  class="form-control" data-stage="value"></div>
                    <div class="opration">×</div>
                  </div>`
  }
  paramsTr +=`<div class="key_row last">
                <div class="key"><input type="text" class="form-control" data-stage="key"></div>
                <div class="value"><input type="text" class="form-control" data-stage="value"></div>
                <div class="opration">×</div>
              </div>`

  var params_bar=$(`<h3><span>参数</span></h3>
                    <div class="keys">
                      <div class="title">
                        <div class="key">Key</div>
                        <div class="value">Value</div>
                      </div>
                      ${paramsTr}
                    </div>`)
  params_bar.appendTo(params)

  params.on("keyup","input", function() {
      if($(this).val() != ''){
          var tr = $(this).parent().parent();
          if( tr.hasClass("last") ){
              var table = tr.parent();
              table.append(paramsTr);
              tr.removeClass("last");
          }
      }
  });

  params.on("click",".opration", function() {
    $(this).parent().remove()
  })

  var respones_bar=$(
    `<div class="tab">
      <span class="body active" data-type='body'>Body</span>
      <span class="headers" data-type='header'>Headers</span>
    </div>
    <div class="res">
      <div class="response-body">
        <div class="response-pretty"></div>
      </div>
      <div class="response-header" style="display:none">
        <div class="fb">General</div>
        <div class="general"></div>
        <div class="fb">Response Headers</div>
        <div class="headers"></div>
      </div>
    </div>
    `)

  respones_bar.appendTo(respones)
  respones.find('.tab span').on('click',function(){
    var type=$(this).data('type')
    $(this).addClass('active').siblings('span').removeClass('active')
    respones.find('.res').find('.response-'+type).show().siblings().hide();
  })
  top.appendTo(debug_wrap)
  params.appendTo(debug_wrap)
  respones.appendTo(debug_wrap)
  float.appendTo(debug_wrap)
  item.replaceWith(debug_wrap)
  debug_wrap.find('.btn-main').on('click',function(){
     debug_wrap.find('.folat').fadeIn(300);
     callAjax(debug_wrap)
  })
  debug_wrap.find('.btn-save').on('click',function(){
     debug_wrap.find('.folat').fadeIn(300);
     saveParams(debug_wrap)
  })
}
function saveParams(el){
    var url = el.find(".url").val().trim().split("?")[0] + "?";
    var method = el.find(".method").val();
    var params =  getParamsJson(el);
    $.ajax({
        type : 'post',
        url : 'saveParams.php',
        async : true,
        data : {
          url:url,
          method:method,
          params:params
        },
        complete: function(responseData, textStatus){
          el.find(".folat").fadeOut(300);
        }
    })
}
function getParamsJson(el){
    var texts = el.find(".key_row input[type='text']");
    var data ={};
    // 获取所有文本框
    var key = "";

    $.each(texts, function(i, val) {
        try {
            if(val.getAttribute("data-stage")  == "value"){
                if( key != "") {
                    data[key]=val.value;
                }
            }else if(val.getAttribute("data-stage")  == "key"){
                key = val.value;
            }
        } catch (ex) {
            alert(ex);
        }
    });
    return data;
}
function getParams(el){
    var texts = el.find(".key_row input[type='text']");
    var data = "";
    // 获取所有文本框
    var key = "";

    $.each(texts, function(i, val) {
        try {
            if(val.getAttribute("data-stage")  == "value"){
                if( key != "") {
                    data += "&" + key + "=" + val.value;
                }
            }else if(val.getAttribute("data-stage")  == "key"){
                key = val.value;
            }
        } catch (ex) {
            alert(ex);
        }
    });
    return data;
}
function getHeaders(request,el){
    if( el.find(".method").val() == "POST")
        request.setRequestHeader("Content-Type", 'application/x-www-form-urlencoded;charset=UTF-8');
}
String.prototype.endWith=function(endStr){
    var str = this;
    if(endStr.length == 0 || this.length == 0){
        return false;
    }
    if(str.length < endStr.length){
        return false;
    }
    str = str.substr(str.length - endStr.length);
    return (str == endStr)
}
String.prototype.trim = function () {
    return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}
String.prototype.huanhang = function () {
    return this.replace(/\n/g, "<br>");
}
function callAjax(el) {
    var url = el.find(".url").val().trim().split("?")[0] + "?";
    var method = el.find(".method").val();
    var urlParamsStr = "";
    var params =  getParams(el);
    // 表单参数优先url参数
    if( el.find(".url").val().indexOf("?") > 0){
        urlParamsStr = el.find(".url").val().split("?")[1];
        var urlParams = urlParamsStr.split("&");
        for(var i=0; i<urlParams.length; i++ ){
            if( urlParams[i] != "" && urlParams[i].indexOf("=") > 0){
                if(params.indexOf("&" + urlParams[i].split("=")[0]) < 0){
                    url += "&" + urlParams[i];
                }
            }
        }
    }

    url = url.replace("?&", '?');
    if( url.endsWith("?")){
        url = url.substr(0 - url.length-1);
    }
    el.find(".float").fadeIn(300);
    el.find(".response-pretty").html('')
    el.find(".response-header .headers").html('');
    el.find(".response-header .general").html('');
    $.ajax({
        type : method,
        url : url,
        async : true,
        data : params,
        beforeSend: function(request) {
            getHeaders(request,el);
        },
        complete: function(responseData, textStatus){
            if(textStatus == "error"){
                el.find(".response-pretty").html("Status:" + responseData.status + "<br>StatusText:" + responseData.statusText +"<br>TextStatus: " + textStatus +" Could not get any response There was an error connecting to " + url);
            }
            else if(textStatus == "success"){
                try{
                    var data = responseData.responseText;
                    el.find(".response-pretty").JSONView(data, { collapsed: true }); 
                    var head = responseData.getAllResponseHeaders().toString().huanhang();
                    
                    el.find(".response-header .headers").html(head);
                    var general ="Request URL: " + url +"<br>Request Method: " + method +"<br>Status Code: " + responseData.status;
                    el.find(".response-header .general").html(general);

                }catch(e){
                  
                }
            }else{
                el.find(".response-pretty").html("textStatus: " + textStatus +" There was an error connecting to " + url);
            }
            el.find(".folat").fadeOut(300);
        }
    });
    if(url.indexOf("?") < 0){
        url += "?";
    }
    if( method == "GET"){
        if(params.trim() == ""){
            if(url.endsWith("?") || url.endsWith("&") ){
                url = url.substr(0, url.length-1);
            }
        }else{
            url = (url +"&"+ params).replace("&&", '&').replace("?&", '?');
        }
        el.find(".url").val(url);
    }
}
function init_back_to_top_button() {
  $(ditto.back_to_top_id).on('click', goTop);
}

function goTop(e) {
  if(e) e.preventDefault();
  $('.r_text').animate({
    scrollTop: 0
  }, 200);
  history.pushState(null, null, '#' + location.hash.split('#')[1]);
}

function goSection(sectionId){
  $('.r_text').animate({
    scrollTop: ($('#' + sectionId).offset().top)
  }, 300);
}

function replace_symbols(text) {
  // replace symbols with underscore
  return text
    .replace(/, /g, ',')
    .replace(/[&\/\\#,.+=$~%'":*?<>{}\ \]\[]/g, "-")
    .replace(/[()]/g, '');
}
function offset(curEle) {      
    var totalLeft = null,
        totalTop = null,
        par = curEle.offsetParent;
        totalLeft += curEle.offsetLeft;      
        totalTop += curEle.offsetTop       
    while (par) {        
        if (navigator.userAgent.indexOf("MSIE 8.0") === -1) {          
            totalLeft += par.clientLeft;          
            totalTop += par.clientTop        
        } 
        totalLeft += par.offsetLeft;        
        totalTop += par.offsetTop        
        par = par.offsetParent;      
    }      
    return { left: totalLeft,  top: totalTop  }    
}
function li_create_linkage(li_tag, header_level) {
  // add custom id and class attributes
  html_safe_tag = replace_symbols(li_tag.text());
  li_tag.attr('data-src', html_safe_tag);
  li_tag.attr("class", "link");
  li_tag.attr("title", li_tag.text());
  // add click listener - on click scroll to relevant header section
  li_tag.click(function(e) {
    e.preventDefault();
    // scroll to relevant section
    var header = $(
      ditto.content_id + " h" + header_level + "." + li_tag.attr('data-src')
    );

    $('.r_text').animate({
      scrollTop: offset(header[0]).top-80
    }, 200);
    // highlight the relevant section
    original_color = header.css("color");
    header.animate({ color: "#ED1C24", }, 500, function() {
      // revert back to orig color
      $(this).animate({color: original_color}, 2500);
    });
    history.pushState(null, null, '#' + location.hash.split('#')[1] + '#' + li_tag.attr('data-src'));
    return false
  });
}

function create_page_anchors() {
  // create page anchors by matching li's to headers
  // if there is a match, create click listeners
  // and scroll to relevant sections

  // go through header level 1 to 3
  for (var i = 2; i <= 6; i++) {
    // parse all headers
    var headers = [];
    $('#content h' + i).map(function() {
      var content = $(this).text();
      headers.push(content);
      $(this).addClass(replace_symbols(content));
      this.id = replace_symbols(content);
      $(this).on('click', 'a.section-link', function(event) {
        event.preventDefault();
        history.pushState(null, null, '#' + location.hash.split('#')[1] + '#' + replace_symbols(content));
        goSection(replace_symbols(content));
      });
    });
  }
  $('#content-toc .catalogue-title').remove()
  $('#content-toc').prepend('<div class="catalogue-title">目录</div>')
  $('#content-toc a').each(function(i,j){
    li_create_linkage($(this),$(this).attr('level'))
  })
}

function show_error() {
  $(ditto.error_id).show();
}

function show_loading() {
  $(ditto.loading_id).show();
  $(ditto.content_id).html('');  // clear content

  // infinite loop until clearInterval() is called on loading
  var loading = setInterval(function() {
    $(ditto.loading_id).fadeIn(1000).fadeOut(1000);
  }, 2000);

  return loading;
}
function open_menu(name){
  $('.Nav__item').removeClass('Nav__item--active')
  $('#'+name).addClass('Nav__item--active')
  var el=$('#'+name).parents('.Nav__item.has-children')
  el.addClass('Nav__item--open')
  var html=''
  el.find('h4').each(function(i,j){
    html+='<span>'+$(j).text().trim()+'</span> &gt; '
  })
  html+='<span>'+$('#'+name).find('a').text()+'</span>'
  $('.Page__header h1').html(html)
}
function parseMd(markdown){
  editormd.markdownToHTML('content', {
      markdown        : markdown ,//+ "\r\n" + $("#append-test").text(),
      //htmlDecode      : true,       // 开启 HTML 标签解析，为了安全性，默认不开启
      htmlDecode      : "style,script,iframe",  // you can filter tags decode
      //toc             : false,
      tocm            : true,    // Using [TOCM]
      tocContainer    : "#content-toc", // 自定义 ToC 容器层
      tocStartLevel        : 2,              // Said from H1 to create ToC
      //gfm             : false,
      //tocDropdown     : true,
      // markdownSourceCode : true, // 是否保留 Markdown 源码，即是否删除保存源码的 Textarea 标签
      emoji           : true,
      taskList        : true,
      tex             : true,  // 默认不解析
      flowChart       : true,  // 默认不解析
      sequenceDiagram : true,  // 默认不解析
  });
}
function router() {
  var path = location.hash.replace(/#([^#]*)(#.*)?/, './$1');

  var hashArr = location.hash.split('#');
  var filename='README'
  if(hashArr[1]){
    if(hashArr[1].split('/')[1]){
      filename=hashArr[1].split('/')[1]
    }
  }
  var sectionId;
  if (hashArr.length > 2 && !(/^comment-/.test(hashArr[2]))) {
    sectionId = hashArr[2];
  }

  if (ditto.save_progress && store.get('menu-progress') !== location.hash) {
    store.set('menu-progress', location.hash);
    store.set('page-progress', 0);
  }

  // default page if hash is empty
  if (location.pathname === "/index.html") {
    path = location.pathname.replace("index.html", ditto.index);
  } else if (path === "") {
    path = location.pathname + ditto.index;
  } else {
    path = path + ".md";
  }
  
  // 取消scroll事件的监听函数
  // 防止改变下面的变量perc的值
  $(window).off('scroll');

  // otherwise get the markdown and render it
  var loading = show_loading();

  $.get(path+'?t='+Math.random(), function(data) {
    parseMd(data)
    create_page_anchors();
    open_menu(filename)
    $('.debug_m').each(function(i,j){
      init_debug_m($(j))
    })
    if (sectionId) {
      $('.r_text').animate({
        scrollTop: ($('#' + decodeURI(sectionId)).offset().top-80)
      }, 300);
    }
    if (location.hash === '' || '#' + getHash().nav === menu[0]) {
      $('#pageup').css('display', 'none');
    } else {
      $('#pageup').css('display', 'inline-block');
    }

    if ('#' + getHash().nav === menu[(menu.length - 1)]) {
      $('#pagedown').css('display', 'none');
    } else {
      $('#pagedown').css('display', 'inline-block');
    }

    (function() {
      var $w = $('.r_text');
      var $prog2 = $('.progress-indicator-2');
      var wh = $w.height();
      var h = $('#content').height();
      var sHeight = h - wh;
      $w.on('scroll', function() {
        window.requestAnimationFrame(function(){
          var perc = Math.max(0, Math.min(1, $w.scrollTop() / sHeight));
          updateProgress(perc);
        });
      });

      function updateProgress(perc) {
        if(perc>0.02)
          $(ditto.back_to_top_id).show();
        else{
          $(ditto.back_to_top_id).hide();
        }
        $prog2.css({width: perc * 100 + '%'});
        ditto.save_progress && store.set('page-progress', perc);
      }

    }());

  }).fail(function() {
    show_error();
  }).always(function() {
    clearInterval(loading);
    $(ditto.loading_id).hide();
  });
}

$(function(){
	initList();
	$(window).on("scroll", scrollCtrl);

	function initList() {
		var tab = $('nav a'),
				list = $('.list'),
				cur   = list.eq(0),
        load  = cur.find('.loading').eq(0);
		
		// 参考  type : 0请的 1领的  
		getData('../../api_data/orderlist.json', { pageSize: 10, page: 1, type: load.data('type')}, function(res){
			renderlist(res, cur, load)
		})

		tab.on('click', function(){
			var target = $(this),
					curIndex = target.parent().find('.cur').index(),
					nowIndex = target.index(),
					targetList = list.eq(nowIndex);

			if(!target.hasClass('cur')){
				$(this).addClass('cur').siblings().removeClass('cur')
				if(targetList.hasClass('toload')){
					var load = targetList.find('.loading'),
							type = load.data('type');

					list.eq(curIndex).attr("class", "list hide loaded");
					targetList.removeClass('hide');

					getData('../../api_data/orderlist.json', { pageSize: 10, page: 1, type: type}, function(res){
						renderlist(res, targetList, load);
						nowIndex > curIndex ? targetList.addClass("animated").addClass("fadeInRight") : targetList.addClass("animated").addClass("fadeInLeft");
					})
				}else{
					list.eq(curIndex).attr("class", "list hide loaded");
					targetList.removeClass('hide');
					nowIndex > curIndex ? targetList.addClass("animated").addClass("fadeInRight") : targetList.addClass("animated").addClass("fadeInLeft");
				}
			}
		})
	}

	function scrollCtrl() {
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
        docHeight = $(document).height(),
        winHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;

    if(scrollTop+winHeight >= docHeight-100){
      $('.loading').each(function() {
        var obj = $(this);
        if (!obj.parent().hasClass("hide") && !obj.data("loaded")){
          if( 'yes' != obj.data('loading')){
            var page = obj.data('page')*1,
                type = obj.data('type');
            obj.data('loading', 'yes').removeClass('hide');
            getData('../../api_data/orderlist.json', { pageSize: 10, page: page, type: type}, function(res){
              obj.data('loading', 'no').addClass('hide');
              if (res == 0) {
								alert('加载失败');
							}else{
								if(res.list.length){
                  html = fillList(res.list);
                  obj.before(html);
                  obj.data('page', page+1);
                  if( page+1 > res.pageCount ){
                    obj.data('loaded', 1);
                  }
                }
							}
            })
          }
        }
      });
    }
  }

	function getData(url, params, cb) {
    $.ajax({
      type: "GET",
      url: url,
      data: params,
      dataType: "json",
      success: function(res) {
        cb(res)
      },
      error: function() {
        cb(0);
      }
    })
  }

  function renderlist(res, cur, load){
  	if (res == 0) {
			alert('获取订单数据失败，请稍后再试')
		}else{
			var datalist = res.list;
			if(datalist.length){
        html = fillList(datalist);
        load.data('page',2);
        if(res.pageCount <=1 ){
          load.data('loaded', 1);
        }
      }else{
        html = '<div class="empty">\
            			<i class="icon icon-coffee2"></i>\
            			<p>这里空荡荡的</p>\
            			<a href="javascript:;">快来请朋友喝咖啡吧</a>\
          			</div>';
      }
      cur.removeClass('toload').addClass('loaded');
      cur.prepend(html);
		}
  }

  function fillList(data){
  	var html = "";
  	for (var i = 0; i < data.length; i++) {
  		html += '<div class="item">\
								<a href="orderdetail.html?id='+ data[i].id +'">\
            			<dl>\
              			<dt>\
                			<h3>'+ data[i].name +'</h3>\
                			<p>'+ data[i].date +'</p>\
              			</dt>\
              			<dd>\
                			<b>'+ data[i].qty +' 份</b>\
                			<span>'+ data[i].status +'</span>\
              			</dd>\
            			</dl>\
            		</a>\
        			</div>'
		}
		return html;
  }
})
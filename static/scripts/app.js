// app.js
"use strict";

var Drink = angular.module('drink',['ui.router', 'ngAnimate']);

Drink
.config(['$httpProvider', 'app',function ($httpProvider, app) {
	var loading = false

	$httpProvider.defaults.transformRequest.push(function (data) {
    if (!loading) {
      window.setTimeout(function () {
        if (!loading) {
          loading = true;
          app.loading(true, status);
        }
      }, 1); // if no response in 1000ms, begin loading
    }
    return data;
  });
  // global loading end
  $httpProvider.defaults.transformResponse.push(function (data) {
    if (loading) {
      loading = false;
      app.loading(false, status);
    }
    return data;
  });
}])

.run(['app', '$rootScope', function(app, $rootScope){
	$rootScope.loading = {
    show: false
  };
  $rootScope.pageClass=""
  app.loading = function (value, status) {
    $rootScope.loading.show = value;
  };
}])

.constant('app', {
    version: Date.now()
});
// config.js
"use strict";

Drink.value("config", {
  pageSize  : 5,  //首页 每页显示多少条 建议不少于5，否则大屏滚动加载不了
  payUrl: "/a.html", // 配置支付页面路径
  dataUrl:{ // 接口URL
    "home":"../api_data/home.json",  //首页列表
    "detail":"../api_data/detail.json", //商品详情
    "card":"../api_data/card.json" //心意卡
  }
});
// router.js
"use strict";

Drink.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
  $stateProvider
    .state('home', {
      url: '/',
      templateUrl:'/home.html',
      controller: 'homeCtrl'
    })
    .state('detail', {
      url: '/detail/:pid',
      templateUrl:'/detail.html',
      controller: 'detailCtrl'
    })
    .state('card', {
      url: '/card/:pid/:qty',
      templateUrl:'/card.html',
      controller: 'cardCtrl'
    })
});
// services.js
"use strict";

Drink.factory('data', ['$http','config', function ($http, config) {
  return {
    Product: {
      getList : function (page) {
        return $http.get(config.dataUrl.home+"?page="+page+"&pagesize="+config.pageSize);
      },
      getDetail: function(pid){
        return $http.get(config.dataUrl.detail+"?pid="+pid)
      },
      getCard: function(pid, qty){
        return $http.get(config.dataUrl.card+"?pid="+pid+"&qty="+qty)
      }
    }
  }
}]);

// controllers.js
"use strict";

Drink.controller('homeCtrl', ['$rootScope', '$scope', 'data', function($rootScope, $scope, data){
	$scope.page = 1;
	$scope.pageSize = 5;
	$scope.loaded = 0;
	$scope.isloading = 'no';
	$scope.list = new Array();

	getData();

	$(window).on('scroll', function(){
		getData();
	})

	function getData(){
		var scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
		docHeight = $(document).height(),
		winHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
		if(!$scope.loaded && $scope.isloading != 'yes' && scrollTop+winHeight >= docHeight-100){
			$scope.isloading = 'yes';

			data.Product.getList($scope.page)
			.success(function (result) {
				for (var i = 0; i < result.list.length; i++) {
					$scope.list.push(result.list[i])
				}
				if(result.pageCount <= $scope.page){
					$scope.loaded = 1;
				}

				$scope.page++;
				$scope.isloading = 'no';  

			});
		}
	}
	setTimeout(function(){
		$rootScope.pageClass = 'page';
	},100)
}])

.controller('detailCtrl', ['$scope', '$stateParams','data', function($scope, $stateParams, data){
	$(window).off('scroll');
	$scope.data="";
	$scope.aaid = 0;
	$scope.msg = false;
	
	data.Product.getDetail($stateParams.pid)
	.success(function (result) {
		if(!result.status){
			$scope.msg = true;
			setTimeout(function(){
				window.location.href = "/";
				$scope.msg = false;
			},3000)
		}else{
			$scope.data = result
		}
	});

	$scope.minus = function(){
		if($scope.data.qty - 1 > 0)
			$scope.data.qty--;
	}

	$scope.add = function(){
		if($scope.data.qty + 1 < 1000)
			$scope.data.qty++;
	}

}])

.controller('cardCtrl', ['$scope','$stateParams', 'data', 'config', function($scope, $stateParams, data, config){
	$(window).off('scroll')
	$scope.payUrl = config.payUrl;
	data.Product.getCard($stateParams.pid, $stateParams.qty)
	.success(function (result) {
		if(!result.status){
			$scope.msg = true;
			setTimeout(function(){
				window.location.href = "/";
				$scope.msg = false;
			},3000)
		}else{
			$scope.data = result
		}
	});

	$scope.confirm = function(){
		$scope.goToPay = true;
	}

	$scope.closeBox = function(){
		$scope.goToPay = false;
	}

	$scope.pay = function(){
		$('#form').submit();
	}

}]);

// directives.js
"use strict";

Drink.directive('onRepeatFinish', function ($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function() {
                    slide("#slider").init({
                      loop:true,
                      smallBtn: false,
                      autoPlay: false
                    })
                });
            }
        }
    };
});
// filter.js
"use strict";

Drink.filter('toPrice', function () {
	return function (input) {
		input = input || '';
		var output = '';
		output = '￥'+input
		return output;
	};
});

/* slider Date:2015-12-21 author:cmax*/
"use strict";

var slide = (function() {
  var run = function(obj) {
    return new slider(obj);
  };

  function slider(obj) {
    this.elem = obj;
    this.oBox = document.querySelector(obj);
    this.mRight = document.querySelector('.control-box>.m-right');
    this.mLeft = document.querySelector('.control-box>.m-left');
    this.pName = document.querySelector('.control-box>p');
    this.moveObj = document.querySelector('.card-box');
    this.aLi = document.querySelectorAll(obj + ">ul>li");
    this.oUl = document.querySelector(obj + ">ul");
    this.now = 0;
    this.on0ff = false;
    return this
  }

  slider.prototype = {
    init: function(options) {
      var options = options || {},
        	li 			= this.aLi;

      this.defaults = {
        startIndex: 0,
        loop			: false,
        autoPlay 	: false,
        smallBtn	: false,
        playTime	: 6000
      };
      slider.extend(this.defaults, options);

      this.now = this.defaults.startIndex;

      if (this.defaults.smallBtn) {
      	var spans = "<div class='s-btn'>";
				for (var i = 0; i < this.aLi.length; i++) {
					if(i == 0){
						spans += "<span class='active'></span>";
						continue;
					}
          spans += "<span></span>";
        };
        spans+= '</div>';
        this.oBox.innerHTML += spans;
        this.btns = document.querySelectorAll(this.elem + ">.s-btn>span");
      };
      if (this.defaults.number) {
        var nub = "<div class='page-nub'>"+
                  "<em id='slide-nub'>"+ parseInt(this.now+1) +"</em>"+
                  "<em>/</em>"+
                  "<em id='slide-sum'>"+ li.length +"</em>"+
                "</div>";
        this.oBox.innerHTML += nub;
        this.slideNub = document.querySelector('#slide-nub');
      }
      if (this.aLi.length <= 2) {
        if (this.defaults.loop) {
          this.oUl.innerHTML += this.oUl.innerHTML
        }
      	this.lack = true;
      }
      this.aLi = document.querySelectorAll(this.elem + ">ul>li");
      this.oUl = document.querySelector(this.elem + ">ul");

      if (this.defaults.autoPlay) {
          this.pause();
          this.play();
      }
      this.liInit();
      this.bind();
    },
    bind: function(){
    	var evt = "onorientationchange" in window;
      var type = evt ? "orientationchange" : "resize";
      this.moveObj.addEventListener('touchstart', this);
      window.addEventListener(type, this);
      window.addEventListener("touchcancel", this);
      this.mRight.addEventListener('click', this)
      this.mLeft.addEventListener('click', this)
    },
    liInit: function(){

    	var li 		= this.aLi,
    			w_box = this.oBox.offsetWidth,
    			now 	= this.now,
    			len 	= li.length,
    			_this = this;
    	_this.oUl.style.width = w_box * len + 'px';


    	if(w_box >= 640){
    		w_box = 640;
    	}else if( w_box <= 320){
    		w_box = 320;
    	};

    	

      if(this.defaults.loop){
        for (var i = 0; i < len; i++) {
          slider.setStyle(li[i], {
            transition: "all 0ms ease",
            height: "auto"
          });
        };
        for( i = 0; i < len; i ++){
          li[i].style.width = w_box + 'px';
        };
        var img = li[0].getElementsByTagName("img")[0];
        if(img){
          // 不明
          var newimg = new Image();
          newimg.onload = function() {
            _this.oBox.style.height = li[0].offsetHeight + "px";
            for (var i = 0; i < li.length; i++) {
              li[i].style.height = li[0].offsetHeight + "px";
            };
          };
          newimg.src = img.src;
        }else {
          _this.oBox.style.height = li[0].offsetHeight + "px";
        };
      	for (var i = len - 1; i >= 0; i--) {
      		if( i == slider.getNow(now, len)){
      			slider.setStyle(li[i], {
      				transform: "translateX(" + 0 + "px)",
              zIndex: 10
      			});
      		}else if( i == slider.getPre(now, len)){
      			slider.setStyle(li[i],{
      				transform: "translateX(" + -w_box + "px)",
              zIndex: 10
      			});
      		}else if( i == slider.getNext(now, len)){
      			slider.setStyle(li[i],{
      				transform: "translateX(" + w_box + "px)",
              zIndex: 10
      			});
      		}else{
      			slider.setStyle(li[i],{
      				transform: "translateX(" + -w_box + "px)",
              zIndex: 9
      			});
      		}
      	};
      }
    },
    handleEvent: function(e) {
    	var type = e.type;
    	if(type == 'resize' || type == 'orientationchange'){
    		this.reInit();
    	}else if( type == "touchstart"){
    		if(this.defaults.autoPlay){
    			this.pause();
    		}
				this.startHandler(e);
    	}else if( type == "touchmove"){
    		if(this.defaults.autoPlay){
    			this.pause();
    		}
    		this.moveHandler(e);
    	}else if( type == "touchend"){
    		if(this.defaults.autoPlay){
    			this.pause();
    			this.play();
    		}
    		this.endHandler(e);
    	}else if( type == "touchcancel"){
    		if(this.defaults.autoPlay){
    			this.pause();
    			this.play();
    		}
    		this.endHandler(e);
    	}else if( type == 'click'){
        this.clickHandler(e);
      }
    },
    reInit: function() {
      var _this = this;
      setTimeout(function() {
        _this.liInit();
      }, 300);
    },
    startHandler: function(e){
    	this.on0ff = true;
    	this.startTime = Date.now();
    	this.startX = e.targetTouches[0].pageX;
      this.startY = e.targetTouches[0].pageY;
    	this.moveObj.addEventListener("touchmove", this);
      this.moveObj.addEventListener("touchend", this);
    },
    moveHandler: function(e){
    	if (this.on0ff) {
    		var li 		= this.aLi,
            li_w  = this.oBox.offsetWidth,
    				now   = this.now,
    				len 	= li.length,
    				endX 	= e.targetTouches[0].pageX,
        		endY 	= e.targetTouches[0].pageY,
        		dis		= 0;

        for (var i = 0; i < len; i++) {
					slider.setStyle(li[i], {
						transition: "all 0ms ease"
					});
				};

				if (Math.abs(endX - this.startX) < Math.abs(endY - this.endY) || Math.abs(endX - this.startX) > 10) {
					slider.stopDefault(e);
				};
        if(this.defaults.loop){
          nowDis = endX - this.startX;
          preDis = parseInt(li[0].style.width) - nowDis;
          nextDis = parseInt(li[0].style.width) + nowDis;
          this.move(li[slider.getPre(now, len)], -preDis, 10);
          this.move(li[slider.getNow(now, len)], nowDis, 10);
          this.move(li[slider.getNext(now, len)], nextDis, 10);
        }else{
          dis = endX - this.startX - now * li_w;
          for (var i = 0; i < len; i++) {
            this.move(li[i], dis);
          };
        }
        
    	}else{
    		this.oBox.removeEventListener("touchmove", this);
      	this.oBox.removeEventListener("touchend", this);
    	};
    },
    endHandler: function(e){
    	this.on0ff 	= false;
    	var li 			= this.aLi,
    			li_w 		= this.oBox.offsetWidth,
    			endX 		= e.changedTouches[0].pageX,
        	endY 		= e.changedTouches[0].pageY,
    	    endTime = Date.now();
    	if(endX < this.startX){
    		if(this.startX - endX > li_w / 4 || (endTime - this.startTime < 200 && this.startX - endX >10)){
    			this.now++;
    			this.tab('left');
    		}else{
    			this.tab('lStay');
    		};
    	}else{
    		if(endX - this.startX > li_w / 4 || (endTime - this.startTime < 200 && endX - this.startX >10)){
    			this.now--;
    			this.tab('right');
    		}else{
    			this.tab('rStay');
    		};
    	};
    	this.oBox.removeEventListener("touchmove", this);
      this.oBox.removeEventListener("touchend", this);
    },
    clickHandler: function(e){
      var type =e.target.dataset.type;
      if(type == 1){
        this.now--;
        this.tab('right');
      }else{
        this.now++;
        this.tab('left');
      }
    },
    tab: function(type){
    	var li = this.aLi,
    			len = li.length,
    			li_w = this.oBox.offsetWidth,
    			now = this.now,
          _pName = this.pName,
    			speed = "";

      if(this.defaults.loop){
      	if (now < 0) {
          now = len - 1;
          this.now = len - 1;
        };

      	for (var i = len-1; i >= 0; i--) {
      		if(i == slider.getPre(now, len)){
      			speed = (type == "left" || type == "rStay") ? 300 : 0;
      			slider.setStyle(li[slider.getPre(now, len)], {
  	    			transform: "translateX(" + -li_w + "px)",
  						zIndex: 10,
  						transition: "all "+ speed +"ms ease"
  	    		});
      		}else if(i == slider.getNow(now, len)){
      			slider.setStyle(li[slider.getNow(now, len)], {
  	    			transform: "translateX(0px)",
  						zIndex: 10,
  						transition: "all 300ms ease"
  	    		});
      		}else if( i == slider.getNext(now, len)){
      			speed = (type == "left" || type == "rStay") ? 0 : 300;
      			slider.setStyle(li[slider.getNext(now, len)], {
  	    			transform: "translateX(" + li_w + "px)",
  						zIndex: 10,
  						transition: "all "+ speed +"ms ease"
  	    		});
      		}else{
      			slider.setStyle(li[i], {
  	    			transform: "translateX(" + -li_w + "px)",
  						zIndex: 9,
  						transition: "all 0ms ease"
  	    		});
      		};
      	};
        setTimeout(function(){
          _pName.innerHTML = li[slider.getNow(now, len)].getAttribute('data-name')
          document.querySelector('#cardId').value = li[slider.getNow(now, len)].getAttribute('data-id')
        },speed)
      }else{
        if (now <= 0) {
          now = 0;
          this.now = 0
        }
        if (now > len - 1) {
          now = len - 1;
          this.now = len - 1
        }
        dis = -this.now * li_w;
        for (var i = len-1; i >= 0; i--) {
          slider.setStyle(li[i], {
            transform: "translateX("+ dis +"px)",
            transition: "all 300ms ease"
          });
        };
      }
    	if( this.defaults.smallBtn ){
				for (var i = 0; i < this.btns.length; i++) {
					this.btns[i].className = "";
				};

				if (this.lack) {
					this.btns[slider.getNow(now, len / 2)].className = "active";
				} else {
					this.btns[slider.getNow(now, len)].className = "active";
				};
    	};
      if( this.defaults.number){
        this.slideNub.innerHTML = this.now + 1;
      }
    },
    move: function(obj, dis, zIndex){
			var newZIndex = zIndex || null;
			if (newZIndex) {
				obj.style.zIndex = newZIndex;
			};
			slider.setStyle(obj, {
				transform: "translateX(" + dis + "px)"
			})
    },
    play: function() {
			var _this = this;
			_this.timer = setInterval(function() {
				_this.now++;
				_this.tab("left")
			}, this.defaults.playTime);
		},
    pause: function(){
			var _this = this;
			clearInterval(_this.timer);
    }

  }
  slider.extend = function(defaults, options) {
    for (name in options) {
      if (options[name] !== undefined) {
        defaults[name] = options[name];
      };
    };
  };
  slider.extend(slider, {
		setStyle: function(obj, style) {
	    for (name in style) {
        obj.style[name] = style[name];
	    };
		},
		getNow: function(now, len) {
      return now % len;
    },
    getPre: function(now, len) {
      if (now % len - 1 < 0) {
        var index = len - 1;
      } else {
        var index = now % len - 1;
      };
      return index;
    },
    getNext: function(now, len) {
      if (now % len + 1 > len - 1) {
        var index = 0;
      } else {
        var index = now % len + 1;
      };
      return index;
    },
    stopDefault: function(e) {
			if (e && e.preventDefault) {
				e.preventDefault();
			} else {
				window.event.returnValue = false;
			};
			return false;
		}
	})
  return run;
})();


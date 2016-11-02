$(function(){
	$(document)
	.on('click', '.adr', function(){
		toggleDialog();
	})

	.on('click', '.layout', function(){
		toggleDialog();
	})

	.on('click', '.close', function(){
		toggleDialog();
	})

	.on('click', '.save', function(){
		var reg 		= /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/,
				phone 	= $('#phone').val(),
				address = $('#address').val();
			console.log(address)
		if(isEmpty(phone)){
			alert("请填写联系电话");
			return false;
		}else{
			if(!reg.test(phone)){
				alert("请填写正确的联系电话");
				return false;
			}
		}

		if(isEmpty(address)){
			alert('请填写详细收货地址');
			return false
		}

		$('.phone').html(phone);
		$('.address').html(address);
		toggleDialog();
	})

	function toggleDialog(){
		$('.layout').toggleClass('hide');
		$('.tips-box').toggleClass('hide');
	}

	function isEmpty(value){
		if(value == null || value == "" || value == "undefined" || value == undefined || value == "null"){
			return true;
		}
		else{
			value = (value+"").replace(/\s/g,'');
			if(value == ""){
				return true;
			}
			return false;
		}
	}
})
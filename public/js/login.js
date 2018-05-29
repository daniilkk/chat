$(function() {
	let loginBtn = $('#btnSubmit');

	loginBtn.click(function() {
		$.ajax({
			url: '/login',
			type: 'POST',
			dataType: 'json',
			data: {
				username: $('#username').val(),
				password: $('#password').val()
			},
		})
		.done(function() {
			window.location.href = '/';
		})
		.fail(function(data) {
			console.log('gopa');
			wrongPassword();
		});
		
	});

	document.onkeydown = function(e) {
		if (e.keyCode == 13) {
			loginBtn.click();
		}
	}

	function wrongPassword() {
		$('#msgWrong')[0].style.display = 'block';
		$('#password').val('');
	}
});
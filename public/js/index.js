$( document ).ready(function() {
	let socket = io();
	let messages = $('#messages');
	let logoutBtn = $('#logout');
	var chat = document.querySelector('#chatWindow');
	let user = null;

	/*sendBtn.click(function() {
		let dateString = (new Date).toString();
		let time = dateString.split(' ')[4];

		let msg = $('#msgForm').val();

		let msgObj = {
			message: msg,
			time: time
		};

		socket.emit('message', msgObj, function() {
			messages.append($('<li>').text(time + 
				' ' + user.username +
				'> '+ msg)
			);
		});

		$('#msgForm').val('');
	});*/

	logoutBtn.click(function() {
		$.ajax({
			url: '/logout',
			type: 'POST',
			dataType: 'json',
		});
		window.location.href = '/login';
	});

	document.querySelector('#msgForm').onkeydown = function(e) {
		if (e.keyCode == 13) {
			if (e.shiftKey) return;
			if (e.target.value == '') return false;

			let dateString = (new Date).toString();
			let time = dateString.split(' ')[4];

			let msgText = e.target.value;

			let msgObj = {
				message: msgText,
				time: time
			};


			let msg = document.createElement('div'); 
			let	div = msg.cloneNode(false);
			let	span = document.createElement('span');

			msg.className = 'msgContainer';
			div.className = 'msg sentMsg';

			msg.append(div);
			div.append(span);

			span.textContent = msgText;

			let style = getComputedStyle(div);
			let	chatS = getComputedStyle(chat);	

			e.target.value = '';
			

			socket.emit('message', msgObj, function() {
				/*messages.append($('<li>').text(time + 
					' ' + user.username +
					'> '+ msg)
				);*/
				messages.append(msg);
				msg.style.height = parseInt(getComputedStyle(div).height) + 22 + 'px';
				chat.scrollTo(0,parseInt(chatS.height));
				
			});
			return false;
		};
	}

	socket.on('message', function(msgObj) {
		let msg = document.createElement('div'); 
		let	div = msg.cloneNode(false);
		let	span = document.createElement('span');

		msg.className = 'msgContainer';
		div.className = 'msg getMsg';

		msg.append(div);
		div.append(span);

		span.textContent = msgObj.message;

		var style = getComputedStyle(div),
			chatS = getComputedStyle(chat);	

		messages.append(msg);
		msg.style.height = parseInt(getComputedStyle(div).height) + 22 + 'px';
		chat.scrollTo(0,parseInt(chatS.height))
		return false;
	});

	socket.on('user data', function(userData) {
		user = userData;
	});

	socket.on('redirect', function(dest) {
		window.location.href = dest;
	});

});
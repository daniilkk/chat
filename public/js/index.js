$( document ).ready(function() {
	let socket = io();
	let messages = document.querySelector('#messages');
	let chat = document.querySelector('#chatWindow');
	let nickName = 'clamus';
	let logout = $('#logout');
	let onlineBtn = document.querySelector('#onlineBtn');
	let onlineWrap = document.querySelector('#onlineWrap');
	let onlineUsersList = $('#onlineUsers');

	logout.click(function() {
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

			let msgText = e.target.value;
			e.target.value = '';

			let msgObj = {
				message: msgText
			};

			socket.emit('message', msgObj, function(msgObj) {
				renderMessage(msgObj, true);
			});

			return false;
		};
	}

	function renderMessage(msgObj, ofThisClient) {

		let msg 	 = document.createElement('div');
		let	div 	 = document.createElement('div');
		let	textDiv  = document.createElement('div');
		let	timeDiv  = document.createElement('div');
		let	timeWrap = document.createElement('div');

		let time = msgObj.time;

		timeWrap.className = 'msgTimeWrap';
		timeDiv.textContent = time;
		timeDiv.className = 'msgTime';

		msg.className = 'msgContainer';
		div.className = 'msg ' + (ofThisClient ? 'sent' : 'get') + 'Msg';

		msg.className = 'msgContainer';
		div.className = 'msg ' + (ofThisClient ? 'sent' : 'get') + 'Msg';

		msg.append(div);
		div.append(textDiv);
		timeWrap.append(timeDiv);
		div.append(timeWrap);

		textDiv.textContent = msgObj.message;

		// *********** Line limit checking

		let arr = textDiv.innerText.split(' ');
		textDiv.innerText = arr.map((e)=>check(e, 355)).join(' ');



		let divS	  = getComputedStyle(div);
		let	chatS 	  = getComputedStyle(chat);
		let	messagesS = getComputedStyle(messages);
		let	textStyle = getComputedStyle(textDiv);	

		messages.append(msg);

		textDiv.style.width = parseInt(textStyle.width) + 30 + 'px';
		msg.style.height 	= parseInt(divS.height) + 26 + 'px';

		if (ofThisClient) {
			if (chat.scrollHeight
				- chat.scrollTop 
				- parseInt(chatS.height) 
				- 11 < parseInt(chatS.height)) {
				chat.scrollTo(0, parseInt(messagesS.height))
			}
			return false;
		}

		let nickWrap  = document.createElement('div');
		let nickBlock = document.createElement('div');
				
		nickBlock.className = 'nick';
		nickBlock.textContent = msgObj.author;
		div.prepend(nickBlock);
		divS = getComputedStyle(div);
		msg.style.height = parseFloat(divS.height) + 30 + 'px';

		if (chat.scrollHeight
		 	- chat.scrollTop
		  	- parseInt(chatS.height) 
		  	- 11 < parseInt(chatS.height)) {
			chat.scrollTo(0, parseInt(messagesS.height));
		}

		if (parseInt(textStyle.width) > 355)
			return false;
	}

	function check(str, max) {
			let span = document.createElement('span');
			span.textContent = str;
			document.body.append(span);
	
			var k = span.offsetWidth / max;
			if (k < 1) {
				span.remove();
				return str;
			}
			
			let chunkLength = str.length / k | 0;
			let res = [];
			
			for (let i = 0; i <= k; i++) {
				res.push(str.slice(i * chunkLength, (i+1) * chunkLength))
			}
			span.remove();
			return res.join(' ')
	}

	onlineBtn.onclick = function(e) {
		onlineWrap.classList.toggle('open');
	}

	onlineBtn.onmousedown = function() {
		return false;
	}

	socket.on('message', function(msgObj) {
		console.log('message event');
		renderMessage(msgObj, false);
	});

	socket.on('user data', function(userData) {
		user = userData;
	});

	socket.on('redirect', function(dest) {
		window.location.href = dest;
	});

	socket.on('online list render', function (onlineUsers) {
		onlineUsersList.empty();
		for (let i = 0; i < onlineUsers.length; i++) {
			onlineUsersList.append($('<li>').text(onlineUsers[i]));
		}
	});

});
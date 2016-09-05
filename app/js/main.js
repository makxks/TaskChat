var name = getQueryVariable('name') || 'Anonymous';
var room = getQueryVariable('room');
var socket = io();

$('.room-name').text(room);

socket.on('users',function(message){
	var $users = $('.current-users');
	$users.text = message.text;
});

socket.on('connect',function(){
	console.log('Connected to socket.io server!');
	socket.emit('joinRoom', {
		name: name,
		room: room
	});
});

socket.on('message',function(message){
	var momentTimestamp = moment.utc(message.timestamp);
	var $messages = $('.messages');
	var $message = $('<li class="list-group-item"></li>')

	console.log('New message: ');
	console.log(message.text);

	$message.prepend('<p>' + message.text + '</p>');
	$message.prepend('<p><strong>'+ message.name + ' ' + momentTimestamp.local().format('h:mm a') +'</strong></p>');
	$messages.prepend($message);

});

//Handles submission of new message

var $form = jQuery('#message-form');

$form.on('submit',function(event){
	event.preventDefault();

	var $message = $form.find('input[name=message]');

	socket.emit('message',{
		name: name,
		text: $message.val()
	});

	$message.val('');

});
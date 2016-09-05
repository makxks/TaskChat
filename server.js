var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

var clientInfo = {};

app.get('/',function(req,res){
	res.send('Todo API Root');
});

app.get('/todos', middleware.requireAuthentication,  function(req,res){
	var query = req.query;
	var where = {
		userId : req.user.get('id')
	};

	if(query.hasOwnProperty('completed') && query.completed == 'true'){
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed == 'false'){
		where.completed = false;
	}

	if(query.hasOwnProperty('q') && query.q.length > 0){
		where.description = {
			$like: '%'+ query.q +'%'
		};
	}

	db.todo.findAll({where: where}).then(function(todos){
		res.json(todos);
	},function(e){
		res.status(500).send();
	});
});

app.get('/todos/:id', middleware.requireAuthentication, function(req,res){
	var todoId = parseInt(req.params.id,10);

	db.todo.findOne({
		where: {
			id : todoId,
			userId : req.user.get('id')
		}
	}).then(function(todo){
		if(!!todo){
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function (e){
		res.status(500).send();
	});
	
});

app.post('/todos', middleware.requireAuthentication,function(req,res){
	var body = _.pick(req.body,'description','completed');

	db.todo.create(body).then(function(todo){
		req.user.addTodo(todo).then(function(){
			return todo.reload();
		}).then(function(todo){
			res.status(200).json(todo.toJSON());
		});
	}),function(e){
		res.status(400).json(e);
	};
	
});

app.delete('/todos/:id', middleware.requireAuthentication , function(req,res){
	var todoId = parseInt(req.params.id,10);

	db.todo.destroy({
		where:{
			id:todoId,
			userId : req.user.get('id')
		}
	}).then(function(rowsDeleted){
		if(rowsDeleted==0){
			res.status(404).json({"error":"no todo found with that id"});
		} else {
			res.status(204).send();
		}
	}, function(){
		res.status(500).send();
	});
});

app.put('/todos/:id', middleware.requireAuthentication, function(req,res){
	var todoId = parseInt(req.params.id,10);
	var body = _.pick(req.body,'description','completed');
	var attributes = {};
	
	if(body.hasOwnProperty('completed')){
		attributes.completed = body.completed;
	}
	
	if(body.hasOwnProperty('description')){
		attributes.description = body.description;
	}
	
	db.todo.findOne({
		where: {
			id: todoId,
			userId : req.user.get('id')
		}
	}).then(function(todo){
		if(todo){
			todo.update(attributes).then(function(todo){
				res.json(todo.toJSON());
			}, function(e){
				res.status(400).json(e);
			});	
		} else {
			res.status(404).send();
		}
	}, function(){
		res.status(500).send();
	});
});

app.post('/users', function(req,res){
	var body = _.pick(req.body,'email','password');
	db.user.create(body).then(function(user){
		res.json(user.toPublicJSON());
	},function(e){
		res.status(400).json(e);
	});
});

app.post('/users/login', function(req,res){
	var body = _.pick(req.body, 'email', 'password');
	var userInstance;

	db.user.authenticate(body).then(function(user){
		var token = user.generateToken('authentication');
		userInstance = user;

		return db.token.create({
			token: token
		});
	}).then(function(tokenInstance){
		res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
	}).catch(function(){
		res.status(401).send();
	});
});

app.delete('/users/login', middleware.requireAuthentication, function(req,res){
	req.token.destroy().then(function(){
		res.status(204).send();
	}).catch(function(){
		res.status(500).send();
	});
});

function sendCurrentUsers (socket) {
	var info = clientInfo[socket.id];
	var users = [];

	if (typeof info === 'undefined') {
		return;
	}

	Object.keys(clientInfo).forEach(function (socketId) {
		var userInfo = clientInfo[socketId];

		if (info.room === userInfo.room) {
			users.push(userInfo.name);
		}
	});

	socket.emit('message', {
		name: 'System',
		text: 'Current users: ' + users.join(', '),
		timestamp: moment().valueOf()
	});
}

io.on('connection', function (socket) {
	console.log('User connected via socket.io!');

	socket.on('disconnect', function () {
		var userData = clientInfo[socket.id];

		if (typeof userData !== 'undefined') {
			socket.leave(userData.room);
			io.to(userData.room).emit('message', {
				name: 'System',
				text: userData.name + ' has left!',
				timestamp: moment().valueOf()
			});
			delete clientInfo[socket.id];
		}
	});

	socket.on('joinRoom', function (req) {
		clientInfo[socket.id] = req;
		socket.join(req.room);
		socket.broadcast.to(req.room).emit('message', {
			name: 'System',
			text: req.name + ' has joined!',
			timestamp: moment().valueOf()
		});
	});

	socket.on('message', function (message) {
		console.log('Message received: ' + message.text);

		if (message.text === '@currentUsers') {
			sendCurrentUsers(socket);
		} else {
			message.timestamp = moment().valueOf();
			io.to(clientInfo[socket.id].room).emit('message', message);	
		}
	});

	// timestamp property - JavaScript timestamp (milliseconds)

	socket.emit('message', {
		name: 'System',
		text: 'Welcome to the chat application!',
		timestamp: moment().valueOf()
	});
});

http.listen(PORT, function () {
	console.log('Server started!');
});

// db.sequelize.sync({force:true}).then(function(){
// 	app.listen(PORT,function(){
// 		console.log('Express listening on port ' + PORT + '!');
// 	});
// });


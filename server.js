var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

// var todos = [{
//   id: 1,
//   description: "Meet for coffee",
//   completed: false
// }, {
//   id: 2,
//   description: "Go to market",
//   completed: false
// }];
app.get('/', function (req, res) {
  res.send('Todo API Root');
});
// GET /todos
app.get('/todos', function (req, res) {
  //res.json(todos);
  var query = req.query;
  var where = {};

  if (query.hasOwnProperty('completed') && query.completed === 'true') {
    where.completed = true;
  } else if (query.hasOwnProperty('completed') && query.completed ==='false') {
    where.completed = false;
  }

  if (query.hasOwnProperty('q') && query.q.length > 0) {
    where.description = {
      $like: '%' + query.q + '%'
    };
  }

  db.todo.findAll({where: where}).then(function (todos) {
    res.json(todos);
  }, function (e) {
    res.status(500).send();
  })

});

app.get('/todos/:id', function (req, res){
  var todoId = parseInt(req.params.id, 10);
  db.todo.findById(todoId).then(function (todo) {
    if (!!todo) {
      res.json(todo.toJSON());
    } else {
      res.status(404).send();
    }
  }, function (e) {
    res.status(500).send();
  });
  // var matchedTodo = _.findWhere(todos, {id: todoId});
  // if (matchedTodo){
  //   res.json(matchedTodo);
  // } else {
  //   res.status(404).send();
  // }
});
// GET /todos/1 or /todos/2 or /todos/:id etc.

// app.get('/todos/:id', function (req, res){
//   var todoId = parseInt(req.params.id,10);
//   var matchedTodo;
//   todos.forEach(function (todo) {
//     if (todoId === todo.id) {
//       matchedTodo = todo;
//     }
//   });
//   if (matchedTodo) {
//     res.json(matchedTodo);
//   } else {
//     res.status(404).send();
//   }
//   //res.send('Asking for todos with id of ' + req.params.id);
// });

app.delete('/todos/:id', function (req, res) {
  var todoId = parseInt(req.params.id, 10);
  // var matchedTodo = _.findWhere(todos, {id: todoId});
  // if (!matchedTodo) {
  //   res.status(404).json({"error":"no todo found with that id"});
  // } else {
  //   todos = _.without(todos, matchedTodo);
  //   res.json(matchedTodo);
  // }
  db.todo.destroy({
    where: {
      id: todoId
    }
  }).then(function (rowsDeleted) {
    if (rowsDeleted === 0) {
      res.status(404).json({
        error: 'No todo ID'
      })
    } else {
      res.status(204).send(); //sending a 204 saying everything went well, nothing to return
    }
  }), function () {
    res.status(500).send();
  }
});

app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
    console.log('hi' + attributes.completed);
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}
  console.log(JSON.stringify(attributes));
	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});
});

app.post('/todos', function (req, res) {
  var body = _.pick(req.body, 'description', 'completed');
  db.todo.create(body).then(function (todo) {
    res.json(todo.toJSON());
  }, function (e) {
    res.status(400).json(e);
  });
  // if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
  //   return res.status(400).send();
  // }
  // body.description = body.description.trim();
  //
  // console.log('description' + body.description);
  // body.id = todoNextId++;
  // todos.push(body);
  // res.json(body);
});



db.sequelize.sync().then(function() {
  app.listen(PORT, function (){
    console.log('Express listening on port ' + PORT + '!');
  });
});

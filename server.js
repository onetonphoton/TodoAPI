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

// GET /todos
app.get('/todos', function (req, res) {
  res.json(todos);
});

app.get('/todos/:id', function (req, res){
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});
  if (matchedTodo){
    res.json(matchedTodo);
  } else {
    res.status(404).send();
  }
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
  var matchedTodo = _.findWhere(todos, {id: todoId});
  if (!matchedTodo) {
    res.status(404).json({"error":"no todo found with that id"});
  } else {
    todos = _.without(todos, matchedTodo);
    res.json(matchedTodo);
  }
});

app.put('/todos/:id', function (req, res) {
  var body = _.pick(req.body, 'description', 'completed');
  var validAttributes = {};

  if (body.hasOwnProperty('completd') && _.isBoolean(body.completed)){
    validAttributes.completed = body.completed;
  } else if (body.hasOwnProperty('completed')){
    return res.status(400).send();
  }

  if (body.hasOwnProperty('description') && !_.isString(body.description) || body.description.trim().length === 0) {
    validAttributes.description = body.description;
  } else if (body.hasOwnProperty('description')

){
    return res.status(400).send();
  }
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

app.get('/', function (req, res) {
  res.send('Todo API Root');
});

db.sequelize.sync().then(function() {
  app.listen(PORT, function (){
    console.log('Express listening on port ' + PORT + '!');
  });
});

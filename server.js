var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
  id: 1,
  description: "Meet for coffee",
  completed: false
}, {
  id: 2,
  description: "Go to market",
  completed: false
}];

// GET /todos
app.get('/todos', function (req, res) {
  res.json(todos);
});
// GET /todos/1 or /todos/2 or /todos/:id etc.

app.get('/todos/:id', function (req, res){
  var todoId = parseInt(req.params.id);
  var matchedTodo;
  todos.forEach(function (todo) {
    if (todoId === todo.id) {
      matchedTodo = todo;
    }
  });
  if (matchedTodo) {
    res.json(matchedTodo);
  } else {
    res.status(404).send();
  }
  res.send('Asking for todos with id of ' + req.params.id);
});

app.get('/', function (req, res) {
  res.send('Todo API Root');
});

app.listen(PORT, function (){
  console.log('Express listening on port ' + PORT + '!');
});

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');


const app = express();
const users = [{
  name: "Customer 1",
  username: "Customer1",
  id: uuidv4(),
  todos: []
}];

app.use(cors());
app.use(express.json());

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(x => x.username === username);

  if (!user)
    return response.status(404).json({ error: "Usuário não existe" });

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.some(x => x.username === username);

  if (userAlreadyExists)
    return response.status(400).json({ error: "Usuário informado já existe." });

  const newUser = {
    name,
    username,
    id: uuidv4(),
    todos: []
  };
  users.push(newUser);

  response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.status(request.user.todos ? 200 : 204).json(request.user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  request.user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const todo = request.user.todos.find(x => x.id === request.params.id);

  if (todo) {
    todo.title = title;
    todo.deadline = deadline;
    response.status(200).json(todo);
  }
  else {
    response.status(404).json({ error: "Todo não encontrado" });
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id: todoId } = request.params;
  const todo = request.user.todos.find(x => x.id === todoId);

  if (todo) {
    todo.done = true;
    response.status(200).json(todo);
  }
  else {
    response.status(404).json({ error: "Todo não encontrado" });
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id: todoId } = request.params;
  const todo = request.user.todos.find(x => x.id === todoId);

  if (todo) {
    request.user.todos =  request.user.todos.filter(x => x.id !== todo.id);
    response.sendStatus(204);
  }
  else {
    response.status(404).json({ error: "Todo não encontrado" });
  }
});

module.exports = app;
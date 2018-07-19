var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();

app.use(bodyParser.json());

app.post('/todos', (req,res) => {
  console.log('POST /todos request sent:', req.body.text);
  var todo = new Todo(
    { text: req.body.text }
  );
  todo.save().then(
    (doc) => {
      res.send(doc)
    },
  (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos', (req,res) => {
  console.log('GET /todos request sent');
  Todo.find().then((todos) => {
    res.send({todos})
  }, (e) => {
    res.status(400).send(e);
  })
});

app.listen(3000, () => {
  console.log('Started on port 3000');
});
module.exports = {app};
/* DOC
    http://mongoosejs.com/docs/validation.html
    http://mongoosejs.com/docs/guide.html
*/

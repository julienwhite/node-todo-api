var express = require('express');
var bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req,res) => {
  console.log('--> POST /todos:', req.body.text);
  var todo = new Todo(
    { text: req.body.text }
  );
  todo.save().then(
    (doc) => {
      res.send(doc)
    },
  (e) => {
    res.status(400).send();
  });
});

app.get('/todos', (req,res) => {
  console.log('--> GET /todos');
  Todo.find().then((todos) => {
    res.send({todos})
  }, (e) => {
    res.status(400).send();
  })
});

app.get('/todos/:id', (req,res) => {
  var {id} = req.params;
  console.log(`--> GET /todos/${id}`);

  if(!ObjectID.isValid(id))
  {
    res.status(404).send({error:'Invalid ID'})
  }
  Todo.findById(id).then((todo) =>
  {
    if(!todo)
    {
      res.status(404).send({error:'Todo not found'})
    }
    res.send({todo})
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/todos/:id', (req,res) => {
  // get the ID
  var {id} = req.params;
  console.log(`--> DELETE /todos/${id}`);
  // Validate the ID -> not valid? return 404
  if(!ObjectID.isValid(id))
  {
    res.status(404).send({error:'invalid ID'});
  }
  // remove todo by ID
  Todo.findByIdAndRemove(id).then((todo) => {
    if(!todo) { // Failure
      res.status(404).send({error:'ID not found'});
    }
    res.status(200).send({todo}); // Success
  }).catch((e) => {
    res.status(400).send();
  })
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});
module.exports = {app};
/* DOC
    http://mongoosejs.com/docs/validation.html
    http://mongoosejs.com/docs/guide.html
*/

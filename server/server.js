/* DOC
    http://mongoosejs.com/docs/validation.html
    http://mongoosejs.com/docs/queries.html
    http://mongoosejs.com/docs/guide.html
    http://mongoosejs.com/docs/middleware.html
    https://jwt.io/
    https://www.npmjs.com/package/bcryptjs
*/

require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req,res) => {
  console.log('>>> POST /todos:', req.body.text);
  var todo = new Todo(
    {
      text: req.body.text,
      _creator: req.user._id
    }
  );
  todo.save().then(
    (doc) => {
      res.send(doc)
    },
  (e) => {
    res.status(400).send();
  });
});

app.get('/todos', authenticate, (req,res) => {
  console.log('>>> GET /todos');
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.send({todos})
  }, (e) => {
    res.status(400).send();
  })
});

app.get('/todos/:id', authenticate, (req,res) => {
  var {id} = req.params;
  var shortId = id.substr(id.length - 5);
  console.log(`>>> GET /todos/****${shortId}`);

  if(!ObjectID.isValid(id))
  {
    res.status(404).send({error:'Invalid ID'})
  }
  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then((todo) =>
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

app.delete('/todos/:id', authenticate, (req,res) => {
  // get the ID
  var {id} = req.params;
  var shortId = id.substr(id.length - 5);
  console.log(`>>> DELETE /todos/****${shortId}`);
  // Validate the ID -> not valid? return 404
  if(!ObjectID.isValid(id))
  {
    res.status(404).send({error:'invalid ID'});
  }
  // remove todo by ID
  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if(!todo) { // Failure
      res.status(404).send({error:'ID not found'});
    }
    res.status(200).send({todo}); // Success
  }).catch((e) => {
    res.status(400).send();
  })
});

app.patch('/todos/:id', authenticate, (req,res) => {
  var id = req.params.id;
  var shortId = id.substr(id.length - 5);
  console.log(`>>> PATCH /todos/****${shortId}`);
  var body = _.pick(req.body, ['text', 'completed']);

  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({
    _id: id,
    _creator: req.user._id
  }, {$set : body}, {new: true}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((e) => {
    console.log('!!! Bad request:', e.message);
    res.status(404).send();
  })
});

// POST /users
app.post('/users', (req,res) => {
  var user = new User(_.pick(req.body, ['email', 'password']));
  console.log('>>> POST /users:', user.email);
  user.save().then(() => {
      return user.generateAuthToken();
    }).then((token) => {
      res.header('x-auth', token).send(user);
      console.log('+++ User created');
    }).catch((e) => {
      console.log('!!! Bad request:', e.message);
      res.status(400).send(e);
    });
});

// POST /users/login {email, password}
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  console.log('>>> POST /users/login:', body.email);
  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
      console.log('+++ User logged in');
    });
  }).catch((e) => {
    console.log('!!! Bad request');
    res.status(400).send();
  });
});

// DELETE
app.delete('/users/me/token', authenticate, (req, res) => {
  var shortToken = req.token.substr(req.token.length - 5);
  console.log('>>> DELETE /users/me/token: *****' + shortToken);
  req.user.removeToken(req.token).then(() => {
    console.log('--- Token deleted');
    res.status(200).send();
  }, () => {
    console.log('!!! Bad request');
    res.status(400).send();
  });
});

app.get('/users/me', authenticate, (req,res) => {
  res.send(req.user);
  console.log('+++ User data retrieved');
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});
module.exports = {app};

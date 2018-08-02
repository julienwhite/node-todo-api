const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
    _id: userOneId,
    email: 'julien@example.com',
    password: 'userOnePass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
    }]
  },
  {
    _id: userTwoId,
    email: 'john@example.com',
    password: 'userTwoPass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({_id: userTwoId, access: 'auth'}, 'abc123').toString()
    }]
  }];

const todos = [{
  _id: new ObjectID,
  text: 'First test todo',
  _creator: userOneId
},
{
  _id: new ObjectID,
  text: 'Second test todo',
  completed: true,
  completedAt: 888,
  _creator: userTwoId
}];

const removeTodos = (done) => {
  Todo.remove({}).then(() => done());
};

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    Promise.all([userOne, userTwo]);
  }).then(() => done());
};

module.exports = {
  todos,
  removeTodos,
  populateTodos,
  users,
  populateUsers
}

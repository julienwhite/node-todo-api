/* DOCS
http://mongoosejs.com/docs/queries.html
*/

const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var id = '5b4feabb3e1c01363b884d6a'; // todo collection id
var id_u = '5b4d8e1c177078825009e238'; // user collection id

if(!ObjectID.isValid(id))
{
  console.log('ID not valid');
}

/*
    Todos
*/
// // retrieve all results
// Todo.find({
//   _id: id
// }).then((todos) => console.log('Todos', todos));
//
// // retrieves first result
// Todo.findOne({
//   _id: id
// }).then((todo) => console.log('Todo', todo));
//
// // retrieves by id
// Todo.findById(id).then((todo) => {
//   if(!todo) {
//     return console.log('ID not found');
//   }
//   console.log('Todo', todo);
// }).catch((e) => console.log(e));

/*
    User
*/
User.findById(id_u).then((user) => {
  if(!user) {
    return console.log(`User id: ${id_u} not found`);
  }
  console.log(user.email);
}, (e) => {
  console.log(e);
})

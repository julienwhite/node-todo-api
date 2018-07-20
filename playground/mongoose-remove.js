/* DOCS
http://mongoosejs.com/docs/queries.html
*/

const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// // Todo.remove({})
// Todo.remove({}).then((result) =>
// {
//   return console.log(result);
// });
//
// // Todo.findOneAndRemove
// Todo.findOneAndRemove({text: "Do it"}).then((todo) =>
// {
//   console.log(todo);
// });
//
// // // Todo.findByIdAndRemove
// Todo.findByIdAndRemove('5b5174970f6039a11fbb0b0b').then((todo) =>
// {
//   console.log(todo);
//   done();
// })

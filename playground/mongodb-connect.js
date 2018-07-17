//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb'); // deconstructed

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if(err) {
    return console.log('Unable to connect to MongoDB server');
  }
  const db = client.db('TodoApp');
  console.log('Connected to MongoDB server');
  insertUser(db, 'tim', 55, 'Melbourne');
  insertTodo(db, 'Something to do 1', false);
  client.close();
});

var insertUser = (db, name, age, location) =>
{
  db.collection('Users').insertOne({
    name,
    age,
    location
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert user', err);
    }
    console.log(result.ops[0]._id.getTimestamp());
    console.log(JSON.stringify(result.ops, undefined, 2));
  })
}

var insertTodo = (db, text, status) =>
{
  db.collection('Todos').insertOne({
    text,
    status
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert Todo', err);
    }
    console.log(result.ops[0]._id.getTimestamp());
    console.log(JSON.stringify(result.ops, undefined, 2));
  })
}

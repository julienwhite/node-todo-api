//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb'); // deconstructed

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if(err) {
    return console.log('Unable to connect to MongoDB server');
  }
  const db = client.db('TodoApp');
  console.log('Connected to MongoDB server');

  var text = 'eat lunch';
  var name = 'tim';
  var _id = new ObjectID('5b4d7a2f8fce02bb1d202fab');
////deleteMany
  // db.collection('Todos').deleteMany({text}).then((result) => {
  //   console.log(`Found ${result.length} items, deleting all`);
  //   console.log(result);
  // }, (err) => {
  //   console.log('Unable to fetch todos', err);
  // })

  // db.collection('Users').deleteMany({name}).then((result) => {
  //   console.log(`Found ${result.length} items, deleting all`);
  //   console.log(result);
  // }, (err) => {
  //   console.log('Unable to fetch todos', err);
  // })

////deleteOne
  // db.collection('Todos').deleteOne({text}).then((result) => {
  //   console.log(`Found ${result.length} items, deleting one`);
  //   console.log(result);
  // }, (err) => {
  //   console.log('Unable to fetch todos', err);
  // })

  // db.collection('Users').deleteOne({_id}).then((result) => {
  //   console.log(`Found ${result.length} items, deleting one`);
  //   console.log(result);
  // }, (err) => {
  //   console.log('Unable to fetch todos', err);
  // })

////findOneAndDelete
  // db.collection('Todos').findOneAndDelete({completed: false}).then((result) => {
  //   console.log(result);
  // }, (err) => {
  //   console.log('Unable to fetch todos', err);
  // })

  db.collection('Users').findOneAndDelete({_id}).then((result) => {
    console.log(JSON.stringify(result, undefined, 3));
  }, (err) => {
    console.log('Unable to fetch todos', err);
  })
});

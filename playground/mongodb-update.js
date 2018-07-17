//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb'); // deconstructed

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if(err) {
    return console.log('Unable to connect to MongoDB server');
  }
  const db = client.db('TodoApp');
  console.log('Connected to MongoDB server');

  var _id = new ObjectID('5b4d75d48fce02bb1d2029d8');

  // https://docs.mongodb.com/manual/reference/method/db.collection.findOneAndUpdate/
  // https://docs.mongodb.com/manual/reference/operator/update/

  // db.collection('Todos').findOneAndUpdate(
  //   { // filter
  //     _id
  //   },
  //   { // update
  //     $set: {
  //       completed: false
  //     }
  //   },
  //   {
  //     returnOriginal: false
  //   }).then((result) => {
  //     console.log(result);
  //   });

    db.collection('Users').findOneAndUpdate(
      { // filter
        name: 'james'
      },
      { // update
        $set: { name: 'mike' },
        $inc: { age : -10 }
      },
      { // options
        returnOriginal: false
      }).then((result) => {
        console.log(result);
      });
  //db.close();
});

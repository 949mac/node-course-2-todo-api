const { MongoClient, ObjectID } = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server.');
  }
  console.log('Connected to MongoDB server.');

  // deleteMany
  // db.collection('Todos')
  //   .deleteMany({text: 'eat the dog'})
  //   .then( (result) => {
  //   console.log(result);
  // });

  // deleteOne
  // db.collection('Todos')
  //   .deleteOne({text: 'eat the dog'})
  //   .then( (result) => {
  //   console.log(result);
  // });

  // fineOneAndDelete
  db.collection('Todos')
    .findOneAndDelete({text: 'eat the dog'})
    .then( (result) => {
    console.log(result);
  });

  // db.close();

});

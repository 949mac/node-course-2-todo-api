const { MongoClient, ObjectID } = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server.');
  }
  console.log('Connected to MongoDB server.');

  // db.collection('Todos').find({
  //     _id: new ObjectID('58177e4a0909fcb7a827ec48')
  //   }).toArray().then( (docs) => {
  //   console.log('Todos');
  //   console.log(JSON.stringify(docs, undefined, 2));
  // }, (err) => {
  //   console.log(`Unable to fetch Todos`, err);
  // });

  db.collection('Users').find({name: 'Mike'}).count().then( (count) => {
    console.log(`Users count: ${count}`);
  }, (err) => {
    console.log(`Unable to fetch Todos`, err);
  });

  // db.close();

});

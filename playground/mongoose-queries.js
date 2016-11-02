const { ObjectID } = require('mongodb');
const mongoose = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

var id = '5817d65dffb67f712e016f76';

if (!ObjectID.isValid(id)) {
  console.log(`ID not valid`);
}

Todo.find({
  _id: id
}).then( (todos) => {
  if (!todos) {
    return console.log('id not found');
  }
  console.log(`Todos ${todos}`);
});

Todo.findOne({
  _id: id
}).then( (todo) => {
  if (!todo) {
    return console.log('id not found');
  }
  console.log(`Todo by One ${todo}`);
});


Todo.findById(id).then( (todo) => {
  if (!todo) {
    return console.log('id not found');
  }
  console.log(`Todo by Id ${todo}`);
}).catch( (e) => console.log(e));



User.findById('58179a8f0d9b5d45e5a14534').then( (user) => {
  if (!user) {
    return console.log('user id not found');
  }
  console.log(`User by Id ${user}`);
}).catch( (e) => console.log(e));

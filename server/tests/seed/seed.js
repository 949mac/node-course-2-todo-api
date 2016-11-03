const jwt = require('jsonwebtoken');

const { ObjectID } = require('mongodb');
const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');

var userObj1 = new ObjectID();
var userObj2 = new ObjectID();
var userObj3 = new ObjectID();
var access = 'auth';

const users = [{
  _id: userObj1,
  email: 'andy@amco.com',
  password: 'pooty123',
  tokens:[{
    access: 'auth',
    token: jwt.sign({_id: userObj1, access}, 'abc123').toString()
  }]
},
{
  _id: userObj2,
  email: 'ben@boon.com',
  password: 'slambam123',
  tokens:[{
    access: 'auth',
    token: jwt.sign({_id: userObj2, access}, 'abc123').toString()
  }]
},
{
  _id: userObj3,
  email: 'cat@chin.com',
  password: 'wook123'
}];


const todos = [{
  _id: new ObjectID(),
  text: 'first test todo',
  _creator: userObj1
}, {
  _id: new ObjectID(),
  text: 'second test todo',
  _creator: userObj2,
}, {
  _id: new ObjectID(),
  text: 'third test todo',
  _creator: userObj1,
  completed: true,
  completedAt: 333
}];

const populateTodos = (done) => {
    Todo.remove({}).then( () => {
      return Todo.insertMany(todos);
    }).then( () => done());
}

const populateUsers = (done) => {
    User.remove({}).then( () => {
      // return User.insertMany(users); // skips middleware
      var user1 = new User(users[0]).save();
      var user2 = new User(users[1]).save();
      var user3 = new User(users[2]).save();

      return Promise.all([user1, user2, user3]);

    }).then( () => done());
}

module.exports = { todos, populateTodos, users, populateUsers };

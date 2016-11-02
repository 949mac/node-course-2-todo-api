const { ObjectID } = require('mongodb');

const mongoose = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

// remove
// Todo.remove({}).then((result) => {
//   console.log(result);
// });

// findOneAndRemove
Todo.findOneAndRemove({_id: ObjectID('5819858a04722a9aae7bfc6b')}).then((todo) => {
  console.log(todo);
});

// findByIdAndRemove

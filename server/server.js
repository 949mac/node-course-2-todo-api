const config = require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb')
const _ = require('lodash');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then( (doc) => {
    res.send(doc);
  }).catch( (e) => {
    res.status(400).send(e);
  });

});


app.get('/todos', (req, res) => {
  // var todo = new Todo();

  Todo.find().then( (todos) => {
    res.send( {todos} );
  }).catch( (e) => {
    res.status(400).send(e);
  });

});

app.get('/todos/:id', (req, res) => {
  //res.send(req.params);
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(400).send();
  }

  Todo.findOne({_id: id }).then( (todo) => {
    if (!todo) {
        return res.status(404).send();
    }
    res.send( {todo} );

  }).catch( (e) => {
    res.status(400).send(e);
  });

});

// app.get('/todos', (req, res) => {
//
// });

app.delete('/todos/:id', (req, res) => {
  //get the id
  // validate the id
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(400).send();
  }

  Todo.findByIdAndRemove(id).then((todo) => {
    // No doc? Send 404
    if (!todo) {
        return res.status(404).send();
    }
    // Found. Send 200
    res.send( {todo} );

  }).catch( (e) => {
      res.status(400).send(e);
  });
});

app.patch('/todos/:id', (req, res) => {

  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(400).send();
  }

  var body = _.pick(req.body, ['text', 'completed']);

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime(); // unix epoch
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new:true}).then( (todo) => {
    if (!todo) {
        return res.status(404).send();
    }
    res.send( {todo} );

  }).catch((e) => {
      return res.status(400).send();
  });

})

app.listen(port, () => {
  console.log(`Started listening on port`, port);
});

module.exports = {app}

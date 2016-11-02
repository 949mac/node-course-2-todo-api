const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');
const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const todos = [{
  _id: new ObjectID(),
  text: 'first test todo'
}, {
  _id: new ObjectID(),
  text: 'second test todo'
}, {
  _id: new ObjectID(),
  text: 'third test todo',
  completed: true,
  completedAt: 333
}];

beforeEach( (done) => {
    Todo.remove({}).then( () => {
      return Todo.insertMany(todos);
    }).then( () => done());
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo test';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {                 // SuperTest
        expect(res.body.text).toBe(text); // Expect
      })
      .end( (err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({text}).then( (todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch( (e) => {done(e)});
      });
  });

  it('should not create a new todo on error', (done) => {
    var text = '';

    request(app)
      .post('/todos')
      .send({text})
      .expect(400)
      .expect((res) => {                 // SuperTest
        expect(res.body.text).toNotBe(text); // Expect
      })
      .end( (err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then( (todos) => {
          expect(todos.length).toBe(todos.length);
          done();
        }).catch( (e) => {done(e)});
      });
  });

});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {                 // SuperTest
        expect(res.body.todos.length).toBe(todos.length); // Expect
      })
      .end(done);
  })
});

describe('GET /todos/:id', () => {

  it('should return a todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {                 // SuperTest
        expect(res.body.todo.text).toBe(todos[0].text); // Expect
      })
      .end(done);
  })

  it('should return a 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${hexId}`)
      .expect(404)
      .end(done);
  })

  it('should return a 400 for non-object ids', (done) => {
    request(app)
      .get(`/todos/123`)
      .expect(400)
      .end(done);
  })
});

describe('DELETE /todos/:id', () => {

  it('should delete and return a todo doc', (done) => {
    request(app)
      .delete(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {                 // SuperTest
        expect(res.body.todo.text).toBe(todos[0].text); // Expect
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(todos[0]._id.toHexString()).then( (todo) => {
          expect(todo).toNotExist();
          done();
        }).catch( (e) => {done(e)});

      });
  });

  it('should return a 404 if the todo is not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .expect(404)
      .end(done);
  });

  it('should return a 400 if the ID is invalid', (done) => {

    request(app)
      .delete(`/todos/123`)
      .expect(400)
      .end(done);
  });

});

describe('PATCH /todos/:id', (param) => {
  it('shoud update the todo', (done) => {
    var body = {
      text: "My test update",
      completed: true
    }
    request(app)
      .patch(`/todos/${todos[0]._id.toHexString()}`)
      .send(body)
      .expect(200)
      .expect((res) => {                 // SuperTest
        expect(res.body.todo.text).toBe(body.text); // Expect
        expect(res.body.todo.completed).toBe(true); // Expect
        expect(res.body.todo.completedAt).toBeA('number'); // Expect
      })
      .end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    var body = {
      text: "My test update which is not completed",
      completed: false
    }
    request(app)
      .patch(`/todos/${todos[0]._id.toHexString()}`)
      .send(body)
      .expect(200)
      .expect((res) => {                 // SuperTest
        expect(res.body.todo.text).toBe(body.text); // Expect
        expect(res.body.todo.completed).toBe(false); // Expect
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });
});

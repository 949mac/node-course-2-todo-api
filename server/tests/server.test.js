const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');
const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed.js');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo test';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {                 // SuperTest
        expect(res.body.todos.length).toBe(2); // Expect
      })
      .end(done);
  })
});

describe('GET /todos/:id', () => {

  it('should return a todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  })

  it('should return a 400 for non-object ids', (done) => {
    request(app)
      .get(`/todos/123`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(400)
      .end(done);
  })


    it('should not return a todo doc belonging to another user', (done) => {
      request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .expect((res) => {                 // SuperTest
          expect(res.body).toEqual({}); // Expect
        })
        .end(done);
    })
});

describe('DELETE /todos/:id', () => {

  it('should delete and return a todo doc', (done) => {
    request(app)
      .delete(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect((res) => {                 // SuperTest
        expect(res.body.todo.text).toBe(todos[1].text); // Expect
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(todos[1]._id.toHexString()).then( (todo) => {
          expect(todo).toNotExist();
          done();
        }).catch( (e) => {done(e)});

      });
  });

  it('should not delete a todo belonging to someone else', (done) => {
    request(app)
      .delete(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(todos[0]._id.toHexString()).then( (todo) => {
          expect(todo).toExist();
          done();
        }).catch( (e) => {done(e)});

      });
  });

  it('should return a 404 if the todo is not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return a 400 if the ID is invalid', (done) => {

    request(app)
      .delete(`/todos/123`)
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
      .send(body)
      .expect(200)
      .expect((res) => {                 // SuperTest
        expect(res.body.todo.text).toBe(body.text); // Expect
        expect(res.body.todo.completed).toBe(true); // Expect
        expect(res.body.todo.completedAt).toBeA('number'); // Expect
      })
      .end(done);
  });

  it('shoud not update the todo of another user', (done) => {
    var body = {
      text: "My test update",
      completed: true
    }
    request(app)
      .patch(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .send(body)
      .expect(404)
      .end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    var body = {
      text: "My test update which is not completed",
      completed: false
    }
    request(app)
      .patch(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
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

describe('GET /users/me', () => {
  it('should return a user is authenticated', (done) => {
    request(app)
      .get(`/users/me`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {                 // SuperTest
        expect(res.body._id).toBe(users[0]._id.toHexString()); // Expect
        expect(res.body.email).toBe(users[0].email); // Expect
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get(`/users/me`)
      // .set('x-auth', 'users[0].tokens[0].token')
      .expect(401)
      .expect((res) => {                 // SuperTest
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    var body = { email: 'bigspender@gmail.com' , password: 'wookieCat$123'};
    request(app)
      .post(`/users`)
      .send(body)
      .expect(200)
      .expect((res) => {                 // SuperTest
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist(); // Expect
        expect(res.body.email).toBe(body.email); // Expect
      })
      .end( (err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email: body.email}).then((user) => {
          expect(user).toExist();
          expect(user.password).toNotBe(body.password);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return validation errors if password is invalid', (done) => {
    var body = { email: 'bigspender@gmail.com' , password: 'wook'};
    request(app)
      .post(`/users`)
      .send(body)
      .expect(400)
      .expect((res) => {                 // SuperTest
        expect(res.body.errors.password.kind).toBe('minlength'); // Expect
      })
      .end(done);

  });

  it('should not create user if email in use', (done) => {
    var body = { email: users[0].email , password: 'wookieCat$123'};
    request(app)
      .post(`/users`)
      .send(body)
      .expect(400)
      .expect((res) => {                 // SuperTest
      })
      .end(done);
  });
});

describe('POST /users/login', (param) => {
  var body = { email: users[1].email , password: users[1].password };
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send(body)
      .expect(200)
      .expect((res) => {                 // SuperTest
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist(); // Expect
        expect(res.body.email).toBe(body.email); // Expect
      })
      .end( (err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invalid login', (done) => {
    var body = { email: users[1].email , password: "obviousBADpass" };
    request(app)
      .post('/users/login')
      .send(body)
      .expect(403)
      .expect((res) => {                 // SuperTest
        expect(res.headers['x-auth']).toNotExist();
        expect(res.body).toEqual({}); // Expect
      })
      .end( (err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });

  })
})

describe('DELETE /users/me/token', () => {
  it('should remove the auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end( (err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  })
});

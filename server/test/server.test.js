const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server'); // same as: const app = require('./../server').app;
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');

const {todos, removeTodos, populateTodos, users, populateUsers} = require('./seed/seed');

var cs = require('./../../console.js');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe(cs.title('TODOS TEST'), () => {

  describe(cs.subtitle('POST /todos'), () => {
    beforeEach(removeTodos);

    it('should create a new todo', (done) => {
      var text = 'test todo text';

      request(app)
        .post('/todos')
        .set('x-auth', users[0].tokens[0].token)
        .send({text})
        .expect(200)
        .expect((res) => {
          expect(res.body.text).toBe(text);
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          Todo.find().then((todos) => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          }).catch((e) => done(e));
        });
    });

    it('should not create todo with invalid data', (done) => {
      request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.find().then((todos) => {
          expect(todos.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
    });
  });

  describe(cs.subtitle('GET /todos'), () => {
    it('should get all todos', (done) => {
        request(app)
        .get('/todos')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body.todos.length).toBe(1);
        })
        .end(done);
    });
  });

  describe(cs.subtitle('GET /todos/:id'), () => {
    it('should return todo doc', (done) => {
      request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
    });

    it('should not return todo doc created by other user', (done) => {
      request(app)
        .get(`/todos/${todos[1]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it('Should return 404 if todo not found', (done) => {
      var newID = new ObjectID;
      request(app)
        .get(`/todos/${newID.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it('Should return 404 for non-object ids', (done) => {
      request(app)
        .get('/todos/123')
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
  });

  describe(cs.subtitle('DELETE /todos/:id'), () => {
    it('should remove a todo', (done) => {
      var hexID = todos[1]._id.toHexString();
      // expect(ObjectID.isValid(hexID)).toBe(true);
      if(!ObjectID.isValid(hexID))
      {
        return console.log('Bad input: Invalid ID');
      }
      request(app)
        .delete(`/todos/${hexID}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo._id).toBe(hexID)
        })
        .end((err, res) => {
          if(err) {
            return done(err);
          }

          // query db using findbyid
          Todo.findById(hexID).then((todo) => {
            expect(todo).toBeFalsy();
            done();
          }).catch((e) => done());
        });
    });

    it('should not remove a todo from another user', (done) => {
      var hexID = todos[0]._id.toHexString();
      // expect(ObjectID.isValid(hexID)).toBe(true);
      if(!ObjectID.isValid(hexID))
      {
        return console.log('Bad input: Invalid ID');
      }
      request(app)
        .delete(`/todos/${hexID}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .end((err, res) => {
          if(err) {
            return done(err);
          }

          // query db using findbyid
          Todo.findById(hexID).then((todo) => {
            expect(todo).toBeTruthy();
            done();
          }).catch((e) => done());
        });
    });

    it('should return 404 if todo not found', (done) => {
      var hexID = new ObjectID().toHexString();

      request(app)
        .delete(`/todos/${hexID}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it('should return 404 if object id is invalid', (done) => {
      request(app)
        .delete(`/todos/123abc`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
  });

  describe(cs.subtitle('PATCH /todos/:id'), () => {
    it('should update the todo', (done) => {
      // grab id of first item
      var body = todos[0];
      var hexID = body._id.toHexString();
      body.completed = true;
      body.text = 'updated text';
      // update text, set completed true
      request(app)
        .patch(`/todos/${hexID}`)
        .set('x-auth', users[0].tokens[0].token)
        .send(body)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.completed).toBe(true);
          expect(res.body.todo.text).toBe(body.text);
          expect(typeof res.body.todo.completedAt).toBe('number');
        }).end(done);
    });

    it('should not update the todo from another user', (done) => {
      // grab id of first item
      var body = todos[0];
      var hexID = body._id.toHexString();
      body.completed = true;
      body.text = 'updated text';
      // update text, set completed true
      request(app)
        .patch(`/todos/${hexID}`)
        .set('x-auth', users[1].tokens[0].token)
        .send(body)
        .expect(404)
        .end(done);
    });

    it('should clear competedAt when todo is not completed', (done) => {
      // grab ud of second todo item
      var body = todos[1];
      var hexID = body._id.toHexString();
      // update textm set completed fakse
      body.completed = false;
      body.text = 'updated text 2';
      request(app)
        .patch(`/todos/${hexID}`)
        .set('x-auth', users[1].tokens[0].token)
        .send(body)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.completed).toBe(false);
          expect(res.body.todo.text).toBe(body.text);
          expect(res.body.todo.completedAt).toBeFalsy();
        }).end(done);
      // test is changed, completed false, completedAt is null .toBeFalsy
    })
  });
});

describe(cs.title('USERS TEST'), () => {
  describe(cs.subtitle('GET /users/me'), () => {
    it('should return user if authenticated', (done) => {
      // console.log(users[0]);
      request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
          //console.log(res.body);
          expect(res.body._id).toBe(users[0]._id.toHexString());
          expect(res.body.email).toBe(users[0].email);
        })
        .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
      request(app)
        .get('/users/me')
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({});
        })
        .end(done);
    });
  });

  describe(cs.subtitle('POST /users'), () => {
    it('should create a user', (done) => {
      var email = 'newuser@example.com';
      var password = 'password1!';

      request(app)
        .post('/users')
        .send({email, password})
        .expect(200)
        .expect((res) => {
          expect(res.headers['x-auth']).toBeTruthy();
          expect(res.body._id).toBeTruthy();
          expect(res.body.email).toBe(email);
        })
        .end((err) => {
          if (err) {
            return done(err);
          }

          User.findOne({email}).then((user) => {
            expect(user).toBeTruthy();
            expect(user.password).not.toBe(password);
            done();
          }).catch((e) => done(e));
        });
    });

    it('should return validation errors if email invalid', (done) => {
      var email = 'test@@example.com';
      var password = 'password1!';

      request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end((err) => done());
    });

    it('should return validation errors if password invalid', (done) => {
      var email = 'validemail_invalidpassword@example.com';
      var password = '1';
      request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end((err) => done());
    });

    it('should not create user if email is in use', (done) => {
      var email = users[0].email;
      var password = users[0].password;
      request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end((err) => done());
    });
  });
  beforeEach(populateUsers);
  describe(cs.subtitle('POST /users/login'), () => {
    it('should login user and return auth token', (done) => {
      var email = users[1].email;
      var password = users[1].password;
      request(app)
        .post('/users/login')
        .send({
          email,
          password
        })
        .expect(200)
        .expect((res) => {
          expect(res).toBeTruthy();
          expect(res.headers['x-auth']).toBeTruthy();
          expect(res.body.email).toEqual(email);
        })
        .end((err, res) => {
          if(err) {
            return done(err)
          }

          User.findById(users[1]._id).then((user) => {
            expect(user.toObject().tokens[1]).toMatchObject({
              access: 'auth',
              token: res.headers['x-auth']
            });
            done();
          }).catch((e) => done(e));
        });
    });

    it('should reject invalid login (wrong password)', (done) => {
      var email = users[1].email;
      var password = users[1].password + '1';
      request(app)
        .post('/users/login')
        .send({email, password})
        .expect(400)
        .expect((res) => {
          expect(res).toBeTruthy();
          expect(res.headers['x-auth']).toBeFalsy();
        })
        .end((err, res) => {
          if(err) {
            return done(err)
          }

          User.findById(users[1]._id).then((user) => {
            expect(user.tokens.length).toBe(1);
            done();
          }).catch((e) => done(e));
        });
    });

  });

  describe(cs.subtitle('DELETE /users/me/token'), () => {
    it('should remove auth token on logout', (done) => {
      var token = users[0].tokens[0].token;
      // console.log('test token:', users[0].tokens[0].token);
      request(app)
        .delete('/users/me/token')
        .set('x-auth', token)
        .expect(200)
        .end((err, res) => {
          if(err) {
            return done(err)
          }

          User.findById(users[0]._id).then((user) => {
            expect(user.tokens.length).toBe(0);
            done();
          }).catch((e) => done(e));
        });
    });
  });
});

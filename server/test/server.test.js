const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server'); // same as: const app = require('./../server').app;
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');

const {todos, removeTodos, populateTodos, users, populateUsers} = require('./seed/seed');

var cs = require('./../../console.js');

describe(cs.title('TODOS TEST'), () => {
  beforeEach(populateTodos);

  describe(cs.subtitle('POST /todos'), () => {
    beforeEach(removeTodos);

    it('should create a new todo', (done) => {
      var text = 'test todo text';

      request(app)
        .post('/todos')
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
        .expect(200)
        .expect((res) => {
          expect(res.body.todos.length).toBe(2);
        })
        .end(done);
    });
  });

  describe(cs.subtitle('GET /todos/:id'), () => {
    it('should return todo doc', (done) => {
      request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
    });

    it('Should return 404 if todo not found', (done) => {
      var newID = new ObjectID;
      request(app)
        .get(`/todos/${newID.toHexString()}`)
        .expect(404)
        .end(done);
    });

    it('Should return 404 for non-object ids', (done) => {
      request(app)
        .get('/todos/123')
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
            expect(todo).toNotExist();
            done();
          }).catch((e) => done());
        });
    });

    it('should return 404 if todo not found', (done) => {
      var hexID = new ObjectID().toHexString();

      request(app)
        .delete(`/todos/${hexID}`)
        .expect(404)
        .end(done);
    });

    it('should return 404 if object id is invalid', (done) => {
      request(app)
        .delete(`/todos/123abc`)
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
        .send(body)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.completed).toBe(true);
          expect(res.body.todo.text).toBe(body.text);
          expect(res.body.todo.completedAt).toBeA('number');
        }).end(done);
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
        .send(body)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.completed).toBe(false);
          expect(res.body.todo.text).toBe(body.text);
          expect(res.body.todo.completedAt).toNotExist();
        }).end(done);
      // test is changed, completed false, completedAt is null .toNotExist
    })
  });
});

describe(cs.title('USERS TEST'), () => {
  beforeEach(populateUsers);
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
          expect(res.headers['x-auth']).toExist();
          expect(res.body._id).toExist();
          expect(res.body.email).toBe(email);
        })
        .end((err) => {
          if (err) {
            return done(err);
          }

          User.findOne({email}).then((user) => {
            expect(user).toExist();
            expect(user.password).toNotBe(password);
            done();
          });
        });
    });

    it('should return validation errors if email invalid', (done) => {
      var email = '~+%$@example.com';
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
});

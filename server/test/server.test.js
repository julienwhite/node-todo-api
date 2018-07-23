const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server'); // same as: const app = require('./../server').app;
const {Todo} = require('./../models/todo');

const todos = [{
  _id: new ObjectID,
  text: 'First test todo'
},
{
  _id: new ObjectID,
  text: 'Second test todo',
  completed: true,
  completedAt: 888
}];

var count = 0;

describe('###### POST /todos ######', () => {
  beforeEach((done) => {
    Todo.remove({}).then(() => done());
  });

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

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

describe('###### GET /todos ######', () => {
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

describe('###### GET /todos/:id ######', () => {
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

describe('###### DELETE /todos/:id ######', () => {
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

describe('###### PATCH /todos/:id ######', () => {
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

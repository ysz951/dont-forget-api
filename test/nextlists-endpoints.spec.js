const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Lists Endpoints', function() {
  let db;
  const {
    testUsers,
    testItems,
    testLists,
  } = helpers.makeListsFixtures();
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe(`GET /api/nextlists`, () => {
    context(`Given no lists`, () => {
      beforeEach('insert users', () =>
        helpers.seedUsers(
          db,
          testUsers
        )
      );
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/nextlists')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, [])
      });
    });

    context('Given there are nextlists in the database', () => {
      beforeEach('insert lists', () =>
        helpers.seedLists(
          db,
          testUsers,
          testLists,
        )
      );
      it(`responds with 200 and all of the user's lists`, () => {
        const testUser = testUsers[0]
        const expectedNextlists =  helpers.makeExpectedNextLists(testUser, testLists);
        return supertest(app)
          .get('/api/nextlists')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedNextlists)
      });
    });
  });
  describe(`POST /api/nextlists`, () => {
    beforeEach('insert nextlists', () =>
      helpers.seedLists(
        db,
        testUsers,
        testLists,
      )
    );

    it(`creates a list, responding with 201 and the new list`, function() {
      this.retries(2);
      const testUser = testUsers[1];
      const newList = {
        list_name: 'Test new list'
      };
      return supertest(app)
        .post('/api/nextlists')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newList)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id')
          expect(res.body.list_name).to.eql(newList.list_name)
          const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
          const actualDate = new Date(res.body.date_created).toLocaleString()
          expect(actualDate).to.eql(expectedDate)
        })
        .expect(res =>
          db
            .from('dontforget_lists')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.list_name).to.eql(newList.list_name)
              const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
              const actualDate = new Date(row.date_created).toLocaleString()
              expect(actualDate).to.eql(expectedDate)
            })
        )
    });

    const requiredFields = ['list_name'];

    requiredFields.forEach(field => {
      const testUser = testUsers[1];
      const newList = {
        list_name: 'Test new list'
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newList[field];
        return supertest(app)
          .post('/api/nextlists')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(newList)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          })
      });
    })
    })
  describe(`GET /api/nextlists/:list_id`, () => {
    beforeEach('insert items', () =>
        helpers.seedLists(
        db,
        testUsers,
        testLists
        )
    );
    context(`Given no lists`, () => {
      it(`responds with 404 'list doesn't exist'`, () => {
        const listId = 123456;
        return supertest(app)
          .get(`/api/nextlists/${listId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
          .expect(404, { error: `list doesn't exist` })
      });
    });
    context(`Without the permit of lists`, () => {
        it(`responds with 404 'No permit'`, () => {
          const listId = 4;
          return supertest(app)
            .get(`/api/nextlists/${listId}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(404, { error: `No permit` })
        });
    });
    context('Given there are lists in the database', () => {

      it('responds with 200 and the specified recipe', () => {
        const listId = 2;
        const expectedItems = helpers.serializeBuyLists(testLists[listId - 1]);
        return supertest(app)
          .get(`/api/nextlists/${listId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedItems)
      });
    });
  });
  describe(`DELETE /api/nextlists/:list_id`, () => {
    context('Given there are comments in the database', () => {
      beforeEach('insert comments', () =>
        helpers.seedLists(
          db,
          testUsers,
          testLists,
        )
      );
      it('responds with 204 and removes the comment', () => {
        const idToRemove = 2;
        const testUser = testUsers[0];
        const deleteLists = testLists.filter(list => list.id !== idToRemove);
        const expectedDeleteLists = helpers.makeExpectedNextLists(testUser, deleteLists);
        return supertest(app)
          .delete(`/api/nextlists/${idToRemove}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/nextlists`)
              .set('Authorization', helpers.makeAuthHeader(testUser))
              .expect(expectedDeleteLists)
              
          )
      });
    });
  });
  describe(`PATCH /api/nextlists/:list_id`, () => {
    context('Given there are lists in the database', () => {
      beforeEach('insert lists', () =>
        helpers.seedLists(
          db,
          testUsers,
          testLists,
        )
      );
      it('responds with 204 and updates the list', () => {
        const idToUpdate = 2;
        const updateList = {
          list_name: 'updated list name'
        };
        const expectedList = helpers.serializeBuyLists({
          ...testLists[idToUpdate - 1],
          ...updateList,
        });
        return supertest(app)
          .patch(`/api/nextlists/${idToUpdate}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(updateList)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/nextlists/${idToUpdate}`)
              .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
              .expect(expectedList)
          )
      });
    });
  });
  describe(`GET /api/nextlists/:list_id/items`, () => {
    beforeEach('insert items', () =>
        helpers.seedItems(
        db,
        testUsers,
        testLists,
        testItems,
        )
    );
    context('Given there are lists in the database', () => {

      it('responds with 200 and all items in the list', () => {
        const listId = 2;
        const expectedItems = helpers.makeExpectedListItems(
          testUsers[0],
          testLists[listId - 1],
          testItems,
        );

        return supertest(app)
          .get(`/api/nextlists/${listId}/items`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedItems)
      });
    });

  });
});

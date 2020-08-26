const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('Lists Endpoints', function() {
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

  describe(`GET /api/buylists`, () => {
    context(`Given no lists`, () => {
      beforeEach('insert users', () =>
        helpers.seedUsers(
          db,
          testUsers
        )
      );
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/buylists')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, [])
      });
    });

    context('Given there are buylists in the database', () => {
      beforeEach('insert lists', () =>
        helpers.seedLists(
          db,
          testUsers,
          testLists,
        )
      );
      it(`responds with 200 and all of the user's lists`, () => {
        const testUser = testUsers[0]
        const expectedBuyLists =  helpers.makeExpectedBuyLists(testUser, testLists);
        return supertest(app)
          .get('/api/buylists')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedBuyLists)
      });
    });

    context(`Given an XSS attack list`, () => {
      const testUser = helpers.makeUsersArray()[0];
      const {
        maliciousList,
        expectedList,
      } = helpers.makeMaliciousList(testUser);
      beforeEach('insert malicious list', () => {
        return helpers.seedMaliciousList(
          db,
          testUser,
          maliciousList
        )
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/buylists`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body[0].list_name).to.eql(expectedList.list_name)
            
          })
      });
    });
  });
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
          .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
          .expect(200, [])
      });
    });

    context('Given there are buylists in the database', () => {
      beforeEach('insert lists', () =>
        helpers.seedLists(
          db,
          testUsers,
          testLists,
        )
      );
      it(`responds with 200 and all of the user's lists`, () => {
        const testUser = testUsers[1]
        const expectedBuyLists =  helpers.makeExpectedNextLists(testUser, testLists);
        return supertest(app)
          .get('/api/nextlists')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedBuyLists)
      });
    });
  });

  describe(`GET /api/buylists/:list_id`, () => {
    beforeEach('insert items', () =>
        helpers.seedItems(
        db,
        testUsers,
        testLists,
        testItems,
        )
    );
    context(`Given no lists`, () => {
      it(`responds with 404 'list doesn't exist'`, () => {
        const listId = 123456;
        return supertest(app)
          .get(`/api/buylists/${listId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `list doesn't exist` })
      });
    });
    context(`Without the permit of lists`, () => {
        it(`responds with 404 'No permit'`, () => {
          const listId = 3;
          return supertest(app)
            .get(`/api/buylists/${listId}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(404, { error: `No permit` })
        });
    });

    context('Given there are lists in the database', () => {

      it('responds with 200 and all items in the list', () => {
        const listId = 1;
        const expectedItems = helpers.makeExpectedListItems(
          testUsers[0],
          testLists[listId - 1],
          testItems,
        );

        return supertest(app)
          .get(`/api/buylists/${listId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedItems)
      });
    });

  });
  describe.only(`GET /api/nextlists/:list_id`, () => {
    beforeEach('insert items', () =>
        helpers.seedItems(
        db,
        testUsers,
        testLists,
        testItems,
        )
    );
    context(`Given no lists`, () => {
      it(`responds with 404 'list doesn't exist'`, () => {
        const listId = 123456;
        return supertest(app)
          .get(`/api/nextlists/${listId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
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

      it('responds with 200 and all items in the list', () => {
        const listId = 2;
        const expectedItems = helpers.makeExpectedListItems(
          testUsers[0],
          testLists[listId - 1],
          testItems,
        );

        return supertest(app)
          .get(`/api/nextlists/${listId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedItems)
      });
    });

  });

  
});

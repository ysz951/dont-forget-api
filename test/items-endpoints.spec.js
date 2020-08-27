const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const { expect } = require('chai');

describe('Items Endpoints', function() {
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

  describe(`POST /api/items`, () => {
    beforeEach('insert items', () =>
      helpers.seedItems(
        db,
        testUsers,
        testLists,
        testItems,
      )
    );

    it(`creates a item, responding with 201 and the new list`, function() {
      this.retries(2);
      const testUser = testUsers[0];
      const newList = {
        item_name: 'Test new item',
        list_id: testLists[0].id,
      };
      
      return supertest(app)
        .post('/api/items')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newList)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id')
          expect(res.body.item_name).to.eql(newList.item_name)
          const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
          const actualDate = new Date(res.body.date_created).toLocaleString()
          expect(actualDate).to.eql(expectedDate)
        })
        .expect(res =>
          db
            .from('dontforget_items')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.item_name).to.eql(newList.item_name)
              const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
              const actualDate = new Date(row.date_created).toLocaleString()
              expect(actualDate).to.eql(expectedDate)
            })
        )
    });

    const requiredFields = ['item_name', 'list_id'];

    requiredFields.forEach(field => {
      const testUser = testUsers[0];
      const newList = {
        item_name: 'Test new list',
        list_id: testLists[0].id,
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newList[field];
        return supertest(app)
          .post('/api/items')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(newList)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          })
      });
    })
    })
  describe(`GET /api/items/:item_id`, () => {
    beforeEach('insert items', () =>
        helpers.seedItems(
        db,
        testUsers,
        testLists,
        testItems,
        )
    );
    context(`Given no items`, () => {
      it(`responds with 404 'Item doesn't exist'`, () => {
        const itemId = 123456;
        return supertest(app)
          .get(`/api/items/${itemId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Item doesn't exist` })
      });
    });
    context('Given there are items in the database', () => {

      it('responds with 200 and the specified item', () => {
        const itemId = 1;
        const expectedItems = helpers.serializeBuyListItems(testItems[itemId - 1]);
        return supertest(app)
          .get(`/api/items/${itemId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedItems)
      });
    });
  });
  describe(`DELETE /api/items/:item_id`, () => {
    context('Given there are items in the database', () => {
      beforeEach('insert items', () =>
        helpers.seedItems(
            db,
            testUsers,
            testLists,
            testItems,
        )
      );
      it('responds with 204 and removes the comment', () => {
        const idToRemove = 1;
        const testUser = testUsers[0];
        const deleteItems = testItems.filter(item => item.id !== idToRemove);
        const expectedDeleteItems = deleteItems.map(helpers.serializeBuyListItems);
        // console.log()
        return supertest(app)
          .delete(`/api/items/${idToRemove}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(204)
          .expect(res =>
            db
              .from('dontforget_items')
              .select('*')
              .then(rows => {
                const actualRows = rows.map(helpers.serializeBuyListItems);
                expect(expectedDeleteItems).to.deep.equal(actualRows);
              })
          )
      });
    });
  });
  describe(`PATCH /api/items/:item_id`, () => {
    context('Given there are items in the database', () => {
      beforeEach('insert items', () =>
        helpers.seedItems(
          db,
          testUsers,
          testLists,
          testItems,
        )
      );
      it('responds with 204 and updates the list', () => {
        const idToUpdate = 1;
        const updateItem = {
          item_name: 'updated list name',
          list_id: testLists[0].id,
        };
        const expectedItem = helpers.serializeBuyListItems({
          ...testItems[idToUpdate - 1],
          ...updateItem,
        });
        return supertest(app)
          .patch(`/api/items/${idToUpdate}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(updateItem)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/items/${idToUpdate}`)
              .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
              .expect(expectedItem)
          )
      });
    });
  });
});

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      user_name: 'test-user-2',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      user_name: 'test-user-3',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ];
}

function makeListsArray(users) {
  return [
    {
      id: 1,
      list_name: 'test-list-1',
      type: 'Now',
      user_id: users[0].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),

    },
    {
      id: 2,
      list_name: 'test-list-2',
      type: 'Next',
      user_id: users[0].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      list_name: 'test-list-3',
      type: 'Now',
      user_id: users[1].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      list_name: 'test-list-4',
      type: 'Next',
      user_id: users[1].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 5,
      list_name: 'test-list-5',
      type: 'Now',
      user_id: users[2].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ];
}

function makeItemsArray(users, lists) {
  return [
    {
      id: 1,
      item_name: 'First test item!',
      list_id: lists[0].id,
      user_id: users[0].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      item_name: 'Second test item!',
      list_id: lists[1].id,
      user_id: users[0].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      list_id: lists[2].id,
      user_id: users[1].id,
      item_name: 'Third test item!',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      list_id: lists[3].id,
      user_id: users[1].id,
      item_name: 'Fourth test item!',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 5,
      list_id: lists[4].id,
      user_id: users[2].id,
      item_name: 'Fifth test item!',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ];
}


function serializeBuyLists(buyList) {
  return {
      id: buyList.id,
      list_name: buyList.list_name,
      date_created: buyList.date_created.toISOString()
  };
}

function serializeBuyListItems(listItem) {
  return {
      id: listItem.id,
      item_name: listItem.item_name,
      date_created: listItem.date_created.toISOString()
  };
}

function makeExpectedBuyLists(user, lists) {
  const expectedLists = lists
    .filter(list => list.user_id === user.id && list.type === "Now");
  return expectedLists.map(serializeBuyLists);
}

function makeExpectedNextLists(user, lists) {
  const expectedLists = lists
    .filter(list => list.user_id === user.id && list.type === "Next");
  return expectedLists.map(serializeBuyLists);
}

function makeExpectedListItems(user, list, items) {
  const expectedItems = items
    .filter(item => item.user_id === user.id && item.list_id === list.id);
  const serizeExpectedItem = expectedItems.map(serializeBuyListItems);
  return {'listItems': serizeExpectedItem, 'listName': list.list_name};
}



function makeMaliciousList(user) {
  const maliciousList = {
    id: 911,
    date_created: new Date(),
    list_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    type: 'Now',
    user_id: user.id
  };
  const expectedList = {
    ...maliciousList,
    list_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
  };
  return {
    maliciousList,
    expectedList,
  };
}

function makeListsFixtures() {
  const testUsers = makeUsersArray();
  const testLists = makeListsArray(testUsers);
  const testItems = makeItemsArray(testUsers, testLists);
  return { testUsers, testLists, testItems };
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        dontforget_users,
        dontforget_items,
        dontforget_lists
      `
    )
    .then(() =>
      Promise.all([
        trx.raw(`ALTER SEQUENCE dontforget_users_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE dontforget_items_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE dontforget_lists_id_seq minvalue 0 START WITH 1`),
        trx.raw(`SELECT setval('dontforget_users_id_seq', 0)`),
        trx.raw(`SELECT setval('dontforget_items_id_seq', 0)`),
        trx.raw(`SELECT setval('dontforget_lists_id_seq', 0)`),
      ])
    )
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db.into('dontforget_users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('dontforget_users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}



function seedLists(db, users, lists) {
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('dontforget_lists').insert(lists)
    await trx.raw(
      `SELECT setval('dontforget_lists_id_seq', ?)`,
      [lists[lists.length - 1].id],
    )
  })
}

function seedItems(db, users, lists, items) {
  return db.transaction(async trx => {
    await seedLists(db, users, lists)
    await trx.into('dontforget_items').insert(items)
    await trx.raw(
      `SELECT setval('dontforget_items_id_seq', ?)`,
      [items[items.length - 1].id],
    )
  })
}


function seedMaliciousList(db, user, list) {
  return db.transaction(async trx => {
      await seedUsers(trx, [user])
      await trx.into('dontforget_lists').insert([list])
  })
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeListsArray,
  cleanTables,
  makeAuthHeader,
  seedUsers,
  makeExpectedBuyLists,
  makeExpectedNextLists,
  makeExpectedListItems,
  serializeBuyLists,
  serializeBuyListItems,
  makeListsFixtures,
  seedUsers,
  seedLists,
  seedItems,
  seedMaliciousList,
  makeMaliciousList
};

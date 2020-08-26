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

function makeItemsArray() {
  return [
    {
      id: 1,
      item_name: 'First test item!',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      item_name: 'Second test item!',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      item_name: 'Third test item!',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      item_name: 'Fourth test item!',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 5,
      item_name: 'Fifth test item!',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 6,
      item_name: 'Sixth test item!',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ];
}

function makeitemToListArray() {
  return [
    {
      item_id: 1,
      list_id: 2,
    },
    {
      item_id: 3,
      list_id: 4,
    },
    {
      item_id: 2,
      list_id: 3,
    },
    {
      item_id: 5,
      list_id: 5,
    },
    {
      item_id: 4,
      list_id: 1,
    },
    {
      item_id: 6,
      list_id: 6,
    },
  ];
}

function makeExpectedCollection(recipes, recipeId) {
  const expectedCollections = recipes.filter(recipe => recipe.id === recipeId);
  return expectedCollections.map(recipe => {
    return {
      rec_id: recipe.id
    };
  });
}

function makeExpectedRecipe(users, recipe, categories, comments=[]) {
  const author = users
    .find(user => user.id === recipe.author_id);

  const number_of_comments = comments
    .filter(comment => comment.recipe_id === recipe.id)
    .length;
  const category = categories
    .find(category => category.id === recipe.category_id);
  return {
    id: recipe.id,
    name: recipe.name,
    content: recipe.content,
    date_created: recipe.date_created.toISOString(),
    img_src: recipe.img_src,
    number_of_comments,
    category: category ? category.name : null,
    author: {
      id: author.id,
      user_name: author.user_name,
      date_created: author.date_created.toISOString(),
      date_modified: author.date_modified || null,
    },
  };
}

function makeExpectedLists(user, lists) {
  const expectedLists = lists
    .filter(list => list.user_id === user.id);

  return 
}

function makeExpectedSearchRecipes(users, recipes, categories, query, comments=[]) {
  const expectedRecipes = recipes
    .filter(recipe => recipe.name.includes(query));

  return expectedRecipes.map(recipe => {
    const author = users.find(user => user.id === recipe.author_id)
    const category = categories.find(category => category.id === recipe.category_id)
    const number_of_comments = comments
      .filter(comment => comment.recipe_id === recipe.id)
      .length
    return {
      id: recipe.id,
      name: recipe.name,
      content: recipe.content,
      date_created: recipe.date_created.toISOString(),
      img_src: recipe.img_src,
      number_of_comments,
      category: category ? category.name : null,
      author: {
          id: author.id,
          user_name: author.user_name,
          date_created: author.date_created.toISOString(),
          date_modified: author.date_modified || null,
      }
    };
  });
}


function makeExpectedCategory(category) {
  return {
    id: category.id,
    name: category.name,
  };
}

function makeExpectedComment(users, comment) {
  const commentUser = users.find(user => user.id === comment.user_id);
  return {
    id: comment.id,
    content: comment.content,
    date_created: comment.date_created.toISOString(),
    recipe_id: comment.recipe_id,
    user: {
      id: commentUser.id,
      user_name: commentUser.user_name,
      date_created: commentUser.date_created.toISOString(),
      date_modified: commentUser.date_modified || null,
    }
  };
}

function makeExpectedRecipeComments(users, recipeId, comments) {
  const expectedComments = comments
    .filter(comment => comment.recipe_id === recipeId);

  return expectedComments.map(comment => {
    const commentUser = users.find(user => user.id === comment.user_id)
    return {
      id: comment.id,
      content: comment.content,
      date_created: comment.date_created.toISOString(),
      user: {
        id: commentUser.id,
        user_name: commentUser.user_name,
        date_created: commentUser.date_created.toISOString(),
        date_modified: commentUser.date_modified || null,
      }
    };
  });
}

function makeMaliciousRecipe(user, category) {
  const maliciousRecipe = {
    id: 911,
    date_created: new Date(),
    category_id: category.id,
    name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    img_src: null,
    author_id: user.id,
    content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  };
  const expectedRecipe = {
    ...makeExpectedRecipe([user], maliciousRecipe, [category]),
    name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  };
  return {
    maliciousRecipe,
    expectedRecipe,
  };
}

function makeRecipesFixtures() {
  const testUsers = makeUsersArray();
  const testCategories = makeCategoriesArray();
  const testRecipes = makeRecipesArray(testUsers, testCategories);
  const testComments = makeCommentsArray(testUsers, testRecipes);
  return { testUsers, testRecipes, testCategories, testComments };
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        dontforget_users,
        dontforget_items,
        dontforget_lists,
        dontforget_item_list
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

function seedItems(db, items) {
    return db.into('dontforget_items').insert(items)
     .then(() => 
        db.raw(
            `SELECT setval('dontforget_items_id_seq', ?)`,
            [items[items.length - 1].id],
        )
     )
}

function seedLists(db, users, lists) {
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('dontforget_lists').insert(lists)
    await trx.raw(
      `SELECT setval('dontforget_recipes_id_seq', ?)`,
      [lists[lists.length - 1].id],
    )
  })
}

function seedItemToList(db, users, items, lists, newRelation) {
  return db.transaction(async trx => {
    await seedLists(db, users, lists)
    await seedItems(db, items)
    await trx.into('dontforget_item_list').insert(newRelation)
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
  makeExpectedRecipe,
  makeExpectedRecipeComments,
  makeExpectedCategoryRecipes,
  makeExpectedCategory,
  makeMaliciousRecipe,
  makeListsArray,
  makeRecipesFixtures,
  cleanTables,
  makeAuthHeader,
  seedUsers,
  makeExpectedCollection,
  makeExpectedSearchRecipes,
  makeExpectedComment,
};

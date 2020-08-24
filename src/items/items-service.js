const xss = require('xss');

const ItemsService = {
  // getAllItems(db) {
  //   return db
  //     .from('dontforget_items AS comm')
  //     .select(
  //       'comm.id',
  //       'comm.content',
  //       'comm.date_created',
  //       'comm.recipe_id',
  //       db.raw(
  //         `json_strip_nulls(
  //           row_to_json(
  //             (SELECT tmp FROM (
  //               SELECT
  //                 usr.id,
  //                 usr.user_name,
  //                 usr.date_created,
  //                 usr.date_modified
  //             ) tmp)
  //           )
  //         ) AS "user"`
  //       )
  //     )
  //     .leftJoin(
  //       'dontforget_users AS usr',
  //       'comm.user_id',
  //       'usr.id',
  //     )
  // },
  // getById(db, id) {
  //   return ItemsService.getAllItems(db)
  //     .where('comm.id', id)
  //     .first()
  // },
  
  insertItem(db, newItem) {
    return db
      .insert(newItem)
      .into('dontforget_items')
      .returning('*')
      .then(([item]) => item)
      // .then(item =>
      //   ItemsService.getById(db, item.id)
      // )
  },
  
  // deleteItem(db, id) {
  //   return db('dontforget_items')
  //     .where({id})
  //     .delete()
  // },

  // updateItem(db, id, updateItem) {
  //   return db('dontforget_items')
  //     .where({ id })
  //     .update(updateItem)
  // },

  serializeItem(item) {
    return {
      id: item.id,
      item_name: xss(item.item_name),
      date_created: new Date(item.date_created),
    };
  }
};

module.exports = ItemsService;

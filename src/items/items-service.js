const xss = require('xss');

const ItemsService = {
  getById(db, id) {
    return db
          .from('dontforget_items')
          .select('*')
          .where({id})
          .first()
  },
  insertItem(db, newItem) {
    return db
      .insert(newItem)
      .into('dontforget_items')
      .returning('*')
      .then(([item]) => item)
  },
  
  deleteItem(db, id) {
    return db('dontforget_items')
      .where({id})
      .delete()
  },

  updateItem(db, id, updateItem) {
    return db('dontforget_items')
      .where({ id })
      .update(updateItem)
  },

  serializeItem(item) {
    return {
      id: item.id,
      item_name: xss(item.item_name),
      date_created: new Date(item.date_created),
    };
  }
};

module.exports = ItemsService;

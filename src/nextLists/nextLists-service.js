const xss = require('xss');

const NextListsService = {
  getAllNextLists(db, user_id) {
      return db
          .from('dontforget_lists')
          .select('*')
          .where({user_id}).andWhere('type', 'Next')
  },
  getNextListById(db, id) {
    return db
          .from('dontforget_lists')
          .select('*' )
          .where({id}).andWhere('type', 'Next')
          .first()
  },
  getListItems(db, id) {
    return db
      .from('dontforget_lists AS dl')
      .select(
        'item.id',
        'item.item_name AS item_name'
      )
      .join(
        'dontforget_items AS item',
        'dl.id',
        'item.list_id'
      )
      .where('dl.id', id).andWhere('type', 'Next')
      .orderBy('id', 'asc')
  },
  insertNextList(db, newNextList) {
    return db
      .insert(newNextList)
      .into('dontforget_lists')
      .returning('*')
      .then(([nextList]) => nextList)
  },
  deleteNextList(db, id) {
    return db('dontforget_lists')
      .where({id})
      .delete()
  },
  updateNextList(db, id, updateNextList) {
    return db('dontforget_lists')
      .where({ id })
      .update(updateNextList)
  },
  serializeNextLists(nextList) {
      return {
          id: nextList.id,
          list_name: xss(nextList.list_name),
      };
  },
  serializeNextListItems(listItem) {
    
    return {
        id: listItem.id,
        item_name: xss(listItem.item_name),
    };
},
};

module.exports = NextListsService;

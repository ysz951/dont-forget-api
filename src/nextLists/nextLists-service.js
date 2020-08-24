const xss = require('xss');

const NextListsService = {
  getAllNextLists(db, user_id) {
      return db
          .from('dontforget_lists')
          .select(
              '*'
          )
          .where({user_id}).andWhere('type', 'Next')
  },
  getNextListById(db, id) {
    return db
          .from('dontforget_lists')
          .select(
              '*'
          )
          .where({id})
          .first()
  },
  getListItems(db, id) {
      return db
          .from('dontforget_lists AS dl')
          .select(
            'item.id',
            'dl.list_name AS list_name',
            'item.item_name AS item_name',
            'user_id'
          )
          .join(
            'dontforget_item_list AS il',
            'dl.id',
            'il.list_id'
          )
          .join(
            'dontforget_items AS item',
            'il.item_id',
            'item.id'
          )
          .where('dl.id', id).andWhere('type', 'Next')
          // .where('dl.id', id).andWhere('dl.user_id', user_id).andWhere('type', 'Now')
    },
  insertNextList(db, newNextList) {
    // console.log(newNextList)
    return db
      .insert(newNextList)
      .into('dontforget_lists')
      .returning('*')
      .then(([nextList]) => nextList)
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
        list_name: xss(listItem.list_name),
        item_name: xss(listItem.item_name),
    };
},
};

module.exports = NextListsService;

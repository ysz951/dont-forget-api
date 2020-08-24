const xss = require('xss');

const itemToListService = {
    // getBuyListById(db, id) {
    //     return db
    //           .from('dontforget_lists')
    //           .select(
    //               '*'
    //           )
    //           .where({id})
    //           .first()
    //   },
    insertRelation(db, newRelation) {
    return db
      .insert(newRelation)
      .into('dontforget_item_list')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
}

  

module.exports = itemToListService;

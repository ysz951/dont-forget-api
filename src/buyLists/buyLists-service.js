const xss = require('xss');

const BuyListsService = {
  getAllBuyLists(db, user_id) {
      return db
          .from('dontforget_lists')
          .select('*')
          .where({user_id}).andWhere('type', 'Now')
  },
  getBuyListById(db, id) {
    return db
          .from('dontforget_lists')
          .select('*')
          .where({id}).andWhere('type', 'Now')
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
        .where('dl.id', id).andWhere('type', 'Now')
        .orderBy('id', 'asc')
  },
  insertBuyList(db, newBuyList) {
    // console.log(newBuyList)
    return db
      .insert(newBuyList)
      .into('dontforget_lists')
      .returning('*')
      .then(([buyList]) => buyList)
  },
  deleteBuyList(db, id) {
    return db('dontforget_lists')
      .where({id})
      .delete()
  },
  updateBuyList(db, id, updateBuyList) {
    return db('dontforget_lists')
      .where({ id })
      .update(updateBuyList)
  },

  serializeBuyLists(buyList) {
      return {
          id: buyList.id,
          list_name: xss(buyList.list_name),
      };
  },
  serializeBuyListItems(listItem) {
    
    return {
        id: listItem.id,
        item_name: xss(listItem.item_name),
    };
  },
  async checkListExists(req, res, next) {
    try {
      const list = await BuyListsService.getBuyListById(
          req.app.get('db'),
          req.params.list_id
      );
      if (!list)
        return res.status(404).json({
          error: `list doesn't exist`
        });
      if (list.user_id !== req.user.id) {
        return res.status(404).json({
          error: `No permit`
        });
      }
      res.list = list
      next();
    } catch (error) {
      next(error);
    }
  }
};

module.exports = BuyListsService;

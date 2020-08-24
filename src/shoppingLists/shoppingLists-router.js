const express = require('express');
const ShoppingListsService = require('./shoppingLists-service');
const { requireAuth } = require('../middleware/jwt-auth');
const shoppinglistsRouter = express.Router();

shoppinglistsRouter.route('/:list_id/')
  .all(requireAuth)
  .all(checkListExists)
  .get((req, res, next) => {
    ShoppingListsService.getListItems(
      req.app.get('db'),
      req.user.id,
      req.params.list_id
    )
      .then(listItems => {
        res.json({
          'listItems': listItems.map(ShoppingListsService.serializeBuyListItems),
          'listName': res.list.list_name
        })
      })
      .catch(next)
    
  })
/* async/await syntax for promises */
async function checkListExists(req, res, next) {
  try {
    const list = await ShoppingListsService.getBuyListById(
        req.app.get('db'),
        req.params.list_id
    );
    if (!list)
      return res.status(404).json({
        error: `list doesn't exist`
      });

    res.list = list
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = shoppinglistsRouter;

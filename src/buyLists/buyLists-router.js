const express = require('express');
const path = require('path');
const BuyListsService = require('./buyLists-service');
const { requireAuth } = require('../middleware/jwt-auth');
const buylistsRouter = express.Router();
const jsonBodyParser = express.json();

buylistsRouter
  .route('/')
  .get(requireAuth, (req, res, next) => {
    // console.log('ok')
    BuyListsService.getAllBuyLists(req.app.get('db'), req.user.id)
      .then(buylists => {
        res.json(buylists.map(BuyListsService.serializeBuyLists))
      })
      .catch(next)
  })
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { list_name, type } = req.body;
    const newBuyList = { list_name, type };
    console.log(newBuyList)
    for (const [key, value] of Object.entries(newBuyList))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
    newBuyList.user_id = req.user.id;
  
    BuyListsService.insertBuyList(
    req.app.get('db'),
    newBuyList
    )
      .then(buyList => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${buyList.id}`))
          .json(BuyListsService.serializeBuyLists(buyList))
      })
      .catch(next)
  })

buylistsRouter.route('/:list_id/')
  .all(requireAuth)
  .all(checkListExists)
  .get((req, res, next) => {
    BuyListsService.getListItems(
      req.app.get('db'),
      req.params.list_id
    )
      .then(listItems => {
        res.json({
          'listItems': listItems.map(BuyListsService.serializeBuyListItems),
          'listName': res.list.list_name
        })
      })
      .catch(next)
    
  })
/* async/await syntax for promises */
async function checkListExists(req, res, next) {
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

module.exports = buylistsRouter;

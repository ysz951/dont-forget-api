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
    const { list_name } = req.body;
    const newBuyList = { list_name };
    for (const [key, value] of Object.entries(newBuyList))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
    newBuyList.user_id = req.user.id;
    newBuyList.type = 'Now';
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

buylistsRouter.route('/:list_id')
  .all(requireAuth)
  .all(BuyListsService.checkListExists)
  .get((req, res) => {
    res.json(BuyListsService.serializeBuyLists(res.list))
  })
  .delete(jsonBodyParser, (req, res, next) => {
    console.log('ok')
    BuyListsService.deleteBuyList(
      req.app.get('db'),
      req.params.list_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const { list_name } = req.body;
    const ListToUpdate = { list_name };

    for (const [key, value] of Object.entries(ListToUpdate))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
    ListToUpdate.user_id = req.user.id;
    ListToUpdate.type = "Now";
    BuyListsService.updateBuyList(
      req.app.get('db'),
      req.params.list_id,
      ListToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })


buylistsRouter.route('/:list_id/items')
.all(requireAuth)
.all(BuyListsService.checkListExists)
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

module.exports = buylistsRouter;

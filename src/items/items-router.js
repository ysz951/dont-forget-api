const express = require('express');
const path = require('path');
const ItemsService = require('./items-service');
const { requireAuth } = require('../middleware/jwt-auth');

const itemsRouter = express.Router();
const jsonBodyParser = express.json();
// requireAuth, 
itemsRouter
  .route('/')
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { item_name, list_id } = req.body;
    const newItem = { item_name, list_id };
    for (const [key, value] of Object.entries(newItem))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
    newItem.user_id = req.user.id;
    
    ItemsService.insertItem(
      req.app.get('db'),
      newItem
    )
      .then(item => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${item.id}`))
          .json(ItemsService.serializeItem(item))
      })
      .catch(next)
    })
itemsRouter
  .route('/:item_id')
  .all(requireAuth)
  .all(checkItemExists)
  .get((req, res, next) => {
      res.json(ItemsService.serializeItem(res.item))
  })
  .delete(jsonBodyParser, (req, res, next) => {
    ItemsService.deleteItem(
      req.app.get('db'),
      req.params.item_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const { item_name, list_id } = req.body;
    const ItemToUpdate = { item_name, list_id };

    for (const [key, value] of Object.entries(ItemToUpdate))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
    ItemToUpdate.user_id = req.user.id;
    ItemsService.updateItem(
      req.app.get('db'),
      req.params.item_id,
      ItemToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
async function checkItemExists(req, res, next) {
  try {
    const item = await ItemsService.getById(
        req.app.get('db'),
        req.params.item_id
    )
    if (!item)
      return res.status(404).json({
        error: `Item doesn't exist`
      })

    if (item.user_id !== req.user.id) {
      return res.status(404).json({
        error: `No permit`
      });
    }
    res.item = item
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = itemsRouter;

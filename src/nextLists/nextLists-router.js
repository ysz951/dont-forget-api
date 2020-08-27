const express = require('express');
const path = require('path');
const NextListsService = require('./nextLists-service');
const { requireAuth } = require('../middleware/jwt-auth');
const nextlistsRouter = express.Router();
const jsonBodyParser = express.json();

nextlistsRouter
  .route('/')
  .get(requireAuth, (req, res, next) => {
    // console.log('ok')
    NextListsService.getAllNextLists(req.app.get('db'), req.user.id)
      .then(nextlists => {
        res.json(nextlists.map(NextListsService.serializeNextLists))
      })
      .catch(next)
  })
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { list_name } = req.body;
    const newNextList = { list_name };
    console.log(newNextList)
    for (const [key, value] of Object.entries(newNextList))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
    newNextList.user_id = req.user.id;
    newNextList.type = "Next";
    NextListsService.insertNextList(
    req.app.get('db'),
    newNextList
    )
      .then(nextList => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${nextList.id}`))
          .json(NextListsService.serializeNextLists(nextList))
      })
      .catch(next)
  })

nextlistsRouter.route('/:list_id/')
  .all(requireAuth)
  .all(checkListExists)
  .get((req, res) => {
    res.json(NextListsService.serializeNextLists(res.list))
  })
  .delete(jsonBodyParser, (req, res, next) => {
    console.log('ok')
    NextListsService.deleteNextList(
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
    ListToUpdate.type = "Next";
    NextListsService.updateNextList(
      req.app.get('db'),
      req.params.list_id,
      ListToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

nextlistsRouter.route('/:list_id/items')
  .all(requireAuth)
  .all(checkListExists)
  .get((req, res, next) => {
    NextListsService.getListItems(
      req.app.get('db'),
      req.params.list_id
    )
      .then(listItems => {
        res.json({
          'listItems': listItems.map(NextListsService.serializeNextListItems),
          'listName': res.list.list_name
        })
      })
      .catch(next)
  })
/* async/await syntax for promises */
async function checkListExists(req, res, next) {
  try {
    const list = await NextListsService.getNextListById(
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

module.exports = nextlistsRouter;

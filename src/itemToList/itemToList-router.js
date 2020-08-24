const express = require('express');
const path = require('path');
const itemToListService = require('./itemToList-service');
const { requireAuth } = require('../middleware/jwt-auth');

const itemToListRouter = express.Router();
const jsonBodyParser = express.json();


itemToListRouter
  .route('/')
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { item_id, list_id } = req.body;
    const newRelation = { item_id, list_id };

    for (const [key, value] of Object.entries(newRelation))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });

    itemToListService.insertRelation(
      req.app.get('db'),
      newRelation
    )
      .then(relation => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${relation.list_id}/${relation.item_id}`))
          .json(relation)
      })
      .catch(next)
    })
// usersRouter
//   .route('/collections/:rec_id')
//   .all(requireAuth)
//   .all(checkUserRecipeExists)
//   .delete(jsonBodyParser, (req, res, next) => {
    
//     UsersService.deleteRecipeForuser(
//       req.app.get('db'),
//       req.user.id,
//       req.params.rec_id
//     )
//       .then(numRowsAffected => {
//         res.status(204).end()
//       })
//       .catch(next)
//   })
// async function checkUserRecipeExists(req, res, next) {
//   try {
//     const rec = await UsersService.getRecipeForUser(
//       req.app.get('db'),
//       req.user.id,
//       req.params.rec_id
//     )
//     if (!rec)
//       return res.status(404).json({
//         error: `User doesn't exist`
//       });
//     next();
//   } catch (error) {
//     next(error);
//   }
// };
module.exports = itemToListRouter;

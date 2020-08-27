const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const authRouter = require('./auth/auth-router');
const usersRouter = require('./users/users-router');
const buyListsRouter = require('./buyLists/buyLists-router');
const nextListsRouter = require('./nextLists/nextLists-router');
const itemsRouter= require('./items/items-router');
const { NODE_ENV, CLIENT_ORIGIN } = require('./config');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

app.get('/', (req, res) => {
    res.send('Hello, world!')
});
app.use('/api/buylists', buyListsRouter);
app.use('/api/nextlists', nextListsRouter);
app.use('/api/items', itemsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

app.use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } };
    } else {
        console.error(error);
        response = { message: error.message, error };
    }
    res.status(500).json(response);
});

module.exports = app;
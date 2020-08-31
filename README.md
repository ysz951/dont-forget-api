# Dont Forget
A personal shopping memo app. Dont forget what you want!

## Features
* Automatically add all unchecked items to Next Time List.
* Authorization is required for all operations to protect user's data.
* Automatically delete the list with all items checked.
* Easy to understand and use.

## Demo
* [Live Demo](https://dont-forget-app.vercel.app/)

## Screenshoots
...

## Setting Up

- Install dependencies: `npm install`
- Create development and test databases: `createdb dontforget`, `createdb dontforget-test`
- Create database user: `createuser dontforget_server`
- Grant privileges to new user in `psql`:
  - `GRANT ALL PRIVILEGES ON DATABASE "dontforget" TO dontforget_server`
  - `GRANT ALL PRIVILEGES ON DATABASE "dontforget-test" TO dontforget_server`
- Prepare environment file: `cp example.env .env`
- Replace values in `.env` with your custom values.
- Bootstrap development database: `npm run migrate`
- Bootstrap test database: `npm run migrate:test`
- Clean database `npm run migrate -- 0`
- `.env` file should at list inclue 
```
NODE_ENV=development
PORT=8000
DATABASE_URL="postgresql://dontforget_server@localhost/dontforget"
TEST_DATABASE_URL="postgresql://dontforget_server@localhost/dontforget-test"
JWT_SECRET="change-this-secrect"
JWT_EXPIRY="3h".
```

### Configuring Postgres

For tests involving time to run properly, your Postgres database must be configured to run in the UTC timezone.

1. Locate the `postgresql.conf` file for your Postgres installation.
    - OS X, Homebrew: `/usr/local/var/postgres/postgresql.conf`
2. Uncomment the `timezone` line and set it to `UTC` as follows:

```
# - Locale and Formatting -

datestyle = 'iso, mdy'
#intervalstyle = 'postgres'
timezone = 'UTC'
#timezone_abbreviations = 'Default'     # Select the set of available time zone
```

## Sample Data

- To seed the database for development: `psql -U dontforget_server -d dontforget -a -f seeds/seed.dontforget_tables.sql`
- To clear seed data: `psql -U dontforget_server -d dontforget -a -f seeds/trunc.dontforget_tables.sql`

## Scripts

- Start application for development: `npm run dev`
- Run tests: `npm test`

## API Endpotins
### POST `/api/auth/login`

```js
// req.body
{
  username: String,
  password: String
}

// res.body
{
  authToken: String
}
```

### POST `/api/auth/refresh`

```js
// req.header
Authorization: Bearer ${token}

// res.body
{
  authToken: ${token}
}
```

### POST `/api/users/`

```js
// req.body
{
  username: String,
  password: String
}

// res.body
{
  name: String,
  username: String,
  date_created: Date
}
```

### Get `/api/buylists`

```js
// req.user
{
  id: ID
}

// res.body
[
 {
  id: ID,
  list_name: String,
  type: String,
  user_id: ID,
  date_created: Date
 }
]
```

### Post `/api/buylists`

```js
// req.user
{
  id: ID,
}

// req.body
{
  list_name: String
}

// res.body
{
  id: ID,
  list_name: String,
  type: String,
  user_id: ID,
  date_created: Date
}
```

### Get `/api/buylists/:list_id`

```js
// req.user
{
  id: ID
}

// req.params
{
  list_id: ID,
}

// res.body
{
  id: ID,
  list_name: String,
  type: String,
  user_id: ID,
  date_created: Date
}
```

### Delete `/api/buylists/:list_id`

```js
// req.user
{
  id: ID,
}

// req.params
{
  list_id: ID,
}

// res.body
{
  status: 204
}
```

### Patch `/api/buylists/:list_id`

```js
// req.user
{
  id: ID,
}

// req.params
{
  list_id: ID,
}

// req.body
{
  list_name: String
}

// res.body
{
  status: 204
}
```

### Get `/api/buylists/:list_id/items`

```js
// req.user
{
  id: ID
}

// req.params
{
  list_id: ID,
}

// res.body
[
  {
    id: ID,
    item_name: String,
    list_id: ID,
    user_id: ID,
    date_created: Date
  }
]
```

### Get `/api/nextlists`

```js
// req.user
{
  id: ID
}

// res.body
[
 {
  id: ID,
  list_name: String,
  type: String,
  user_id: ID,
  date_created: Date
 }
]
```

### Post `/api/nextlists`

```js
// req.user
{
  id: ID,
}

// req.body
{
  list_name: String
}

// res.body
{
  id: ID,
  list_name: String,
  type: String,
  user_id: ID,
  date_created: Date
}
```

### Get `/api/nextlists/:list_id`

```js
// req.user
{
  id: ID
}

// req.params
{
  list_id: ID,
}

// res.body
{
  id: ID,
  list_name: String,
  type: String,
  user_id: ID,
  date_created: Date
}
```

### Delete `/api/nextlists/:list_id`

```js
// req.user
{
  id: ID,
}

// req.params
{
  list_id: ID,
}

// res.body
{
  status: 204
}
```

### Patch `/api/nextlists/:list_id`

```js
// req.user
{
  id: ID,
}

// req.params
{
  list_id: ID,
}

// req.body
{
  list_name: String
}

// res.body
{
  status: 204
}
```

### Get `/api/nextlists/:list_id/items`

```js
// req.user
{
  id: ID
}

// req.params
{
  list_id: ID,
}

// res.body
[
  {
    id: ID,
    item_name: String,
    list_id: ID,
    user_id: ID,
    date_created: Date
  }
]
```

### Post `/api/items`

```js
// req.user
{
  id: ID,
}

// req.body
{
  item_name: String,
  list_id: ID
}

// res.body
{
  id: ID,
  item_name: String,
  list_id: ID,
  user_id: ID,
  date_created: Date
}
```

### Get `/api/items/:item_id`

```js
// req.user
{
  id: ID
}

// req.params
{
  item_id: ID,
}

// res.body
{
  id: ID,
  item_name: String,
  list_id: ID,
  user_id: ID,
  date_created: Date
}
```

### Delete `/api/items/:item_id`

```js
// req.user
{
  id: ID,
}

// req.params
{
  item_id: ID,
}

// res.body
{
  status: 204
}
```

### Patch `/api/items/:item_id`

```js
// req.user
{
  id: ID,
}

// req.params
{
  item_id: ID,
}

// req.body
{
  item_name: String
}

// res.body
{
  status: 204
}
```

## Built With
### Front-End
* #### HTML
  * Interactive Web
* #### CSS
  * Resonsive Layout
* #### React
  * Create React App
  * React Router
  * React Context
### Back-End
* #### Node and Express
  * Authentication via JWT
  * Restful API
* #### DataBase
  * Postgres SQL
  * Knex.js - SQL query builder

## Author
* **Shengyang Zhou** --- _Full-Stack_ --- [ysz951](https://github.com/ysz951)

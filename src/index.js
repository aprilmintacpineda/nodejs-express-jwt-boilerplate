/** @format */

const path = require('path');

global._require = module => require(path.join(__dirname, module));
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const multer = require('multer')({
  dest: path.join(__dirname, 'uploads_tmp')
});

// guards
const loggedInGuard = _require('guards/auth/loggedIn');

const { verify } = _require('libs/jwt');
const dbPool = _require('libs/dbPool');
const bodyParser = require('body-parser');
const { createSocketServer } = _require('websocket');

const app = express();
app.set('trust proxy', true);

if (process.env.NODE_ENV === 'development') app.use(require('cors')());

// error handler
app.use((error, request, response, next) => {
  if (error) {
    console.log('error handler', error);
    response.sendStatus(500);
  } else {
    next();
  }
});

// @guards
// auth0 is not logged in
app.use('/api/auth0', _require('guards/guest'));
// auth1 is logged in but must be unconfirmed
app.use('/api/auth1', loggedInGuard, _require('guards/auth/unconfirmedAccount'));
// auth2 is logged in and must be active
app.use('/api/auth2', loggedInGuard, _require('guards/auth/activeAccount'));

// auth0 endpoints
app.post(
  '/api/auth0/account/register',
  multer.single('profilePhoto'),
  _require('api/guest/account/register')
);
app.post('/api/auth0/account/login', bodyParser.json(), _require('api/guest/account/login'));

// auth2 endpoints
app.post('/account/session', _require('api/auth/session'));

const server = app.listen(process.env.PORT, () => {
  // eslint-disable-next-line
  console.log('listening to', process.env.PORT);
});

// web socket
const wsServer = createSocketServer(server);

server.on('upgrade', async (request, socket, head) => {
  try {
    const { url } = request;
    if (!/\/socket\?token=.*/.test(url)) throw new Error('Request upgrade on wrong url');
    const data = await verify(url.replace('/socket?token=', ''));
    const [[authUser]] = await dbPool.select('select * from users where id = ?', [data.id]);

    // user must be logged in
    if (!authUser) throw new Error('User is not logged in');

    // user account must have been confirmed first
    if (!authUser.account_status !== 'active') throw new Error('User account is not confirmed');

    wsServer.handleUpgrade(request, socket, head, ws => {
      // tell wsServer this has been authorized
      wsServer.emit('connection', ws, authUser);
    });
  } catch (error) {
    console.error(error); // eslint-disable-line
    socket.destroy();
  }
});

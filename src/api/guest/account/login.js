/** @format */

const { sign } = _require('libs/jwt');

async function login (request, response) {
  // request.body will be the json form data

  const authUser = {
    id: 'user-id',
    first_name: '123'
  };
  const token = await sign({ id: authUser.id });

  response.send({
    token,
    authUser
  });
}

module.exports = login;

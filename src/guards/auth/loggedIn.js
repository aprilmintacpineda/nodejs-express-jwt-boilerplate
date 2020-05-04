/** @format */

const dbPool = _require('libs/dbPool');
const { verify } = _require('libs/jwt');

module.exports = async (request, response, next) => {
  try {
    const data = await verify(request.headers.authorization);
    const [[authUser]] = await dbPool.select('select * from users where id = ?', [data.id]);

    if (!authUser) {
      console.log('user not found');
      response.sendStatus(403);
    } else {
      request.authUser = authUser;
      // request.authUser will be accessible on the next function
      next();
    }
  } catch (error) {
    console.error(error);
    response.sendStatus(500);
  }
};

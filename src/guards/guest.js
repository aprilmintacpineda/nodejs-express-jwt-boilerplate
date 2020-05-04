/** @format */

module.exports = ({ headers: { authorization } }, response, next) => {
  if (!authorization) {
    next();
  } else {
    console.log('user is logged in');
    response.sendStatus(403);
  }
};

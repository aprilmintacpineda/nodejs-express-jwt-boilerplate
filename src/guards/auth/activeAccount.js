/** @format */

module.exports = ({ authUser }, response, next) => {
  if (authUser && authUser.account_status === 'active') {
    next();
  } else {
    console.error('User account is not yet confirmed'); // eslint-disable-line
    response.sendStatus(403);
  }
};

/** @format */

module.exports = ({ authUser }, response, next) => {
  if (authUser.account_status === 'emailConfirmPending') {
    next();
  } else {
    console.error('User account is confirmed'); // eslint-disable-line
    response.sendStatus(403);
  }
};

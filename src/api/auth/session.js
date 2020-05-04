/** @format */

function session (request, response) {
  // request.authUser will be the requesting user based on the token.
  // it came from guards/loggedIn
  response.send(request.authUser);
}

module.exports = session;

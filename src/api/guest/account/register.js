/** @format */

function register (request, response) {
  // request.file is the profilePhoto
  // request.body will contain the JSON form data
  // it came from multer.single('profilePhoto')

  console.log(request);
  response.sendStatus(500);
}

module.exports = register;

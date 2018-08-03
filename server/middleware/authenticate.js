var {User} = require('./../models/user');

var authenticate = (req, res, next) => {
  var token = req.header('x-auth');
  console.log('@@@ Authenticating...');
  if(token)
  {
    var tokenShort = token.substr(token.length - 5);
    console.log('>>> GET /users/me: ****' + tokenShort);
  }
  User.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject();
    }
    req.user = user;
    req.token = token;
    next();
  }).catch((e) => {
    res.status(401).send();
  });
};

module.exports = {authenticate};

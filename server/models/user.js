const mongoose = require('mongoose');

// --- User
const User = mongoose.model('User', {
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  }
});

module.exports = {User};

// var newUser = new User({
//   email: 'tim@tim.com'
// });
//
// newUser.save().then((doc) => {
//   console.log('Saved user', doc);
// }, (e) => {
//   console.log('Unable to save: ' + e);
// });

const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwtConfig');

exports.loginUser = (username, password, callback) => {
  db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
    if (err) {
      return callback(err, null);
    }

    if (results.length > 0) {
      const token = jwt.sign({ id: results[0].id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      callback(null, token);
    } else {
      callback({ message: 'Invalid credentials' }, null);
    }
  });
};

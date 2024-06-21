const db = require('../config/db');

exports.createUser = (userData, callback) => {
  db.query('INSERT INTO user_data SET ?', userData, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result.insertId);
  });
};

exports.updateUser = (userId, userData, callback) => {
  db.query('UPDATE user_data SET ? WHERE id = ?', [userData, userId], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result.affectedRows);
  });
};

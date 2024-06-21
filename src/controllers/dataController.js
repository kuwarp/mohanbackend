const userService = require('../services/userService');
const { formatIndianDate } = require('../utils/customUtils');

exports.createUser = (req, res) => {
  const userData = { ...req.body, date: formatIndianDate(req.body.date) };

  userService.createUser(userData, (err, userId) => {
    if (err) {
      console.error('Error creating user:', err);
      return res.status(500).send('Server error');
    }
    res.status(200).json({ id: userId, ...userData });
  });
};

exports.updateUser = (req, res) => {
  const userId = req.params.id;
  const userData = { ...req.body, date: formatIndianDate(req.body.date) };

  userService.updateUser(userId, userData, (err, affectedRows) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).send('Server error');
    }
    if (affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User updated successfully' });
  });
};

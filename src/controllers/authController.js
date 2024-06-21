const authService = require('../services/authService');

exports.login = (req, res) => {
  const { username, password } = req.body;

  authService.loginUser(username, password, (err, token) => {
    if (err) {
      console.error('Error logging in:', err);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ token });
  });
};

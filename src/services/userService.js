const userModel = require('../models/userModels');
const { formatIndianDate } = require('../utils/customUtils');

exports.createUser = (userData, callback) => {
  const formattedUserData = { ...userData, date: formatIndianDate(userData.date) };
  userModel.createUser(formattedUserData, callback);
};

exports.updateUser = (userId, userData, callback) => {
  const formattedUserData = { ...userData, date: formatIndianDate(userData.date) };
  userModel.updateUser(userId, formattedUserData, callback);
};

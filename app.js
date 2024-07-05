
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const moment=require('moment-timezone')
const app = express();
const port = 3002;
app.use(cors());
app.use(bodyParser.json());
const pool = mysql.createPool({
  host: '89.117.27.52',
    user: 'u898742638_shrimohanbone',
    password: 'IgSHK39!',
    database: 'u898742638_shriMohanJi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
pool.getConnection((err)=>{
  if (err) {
        throw err;
      }
      console.log('MySQL connected...')
})
const convertToIST = (date) => {
  // const  date = new Date(dateStr);
  //   return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }).split(',')[0];
  // return moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD');
 return moment.tz(date, 'Asia/Kolkata').format('YYYY-MM-DD');
};

const generateCustomId = (callback) => {
  pool.query('SELECT customId FROM user_data ORDER BY id DESC LIMIT 1', (err, results) => {
    if (err) {
      return callback(err, null);
    }
    if (results.length > 0 && results[0].customId) {
      const lastId = results[0].customId;
      const lastNumericPart = parseInt(lastId.replace('SMBC0', ''), 10);
      const newNumericPart = lastNumericPart + 1;
      const newCustomId = `SMBC0${newNumericPart}`;
      return callback(null, newCustomId);
    } else {
      return callback(null, 'SMBC01');
    }
  });
};

// Login API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  pool.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      const token = jwt.sign({ id: result[0].id },  process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } else {
      console.log(res);
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

app.post('/submit-form', (req, res) => {
  generateCustomId((err, customId) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }

    const { date, sex, type, address, disease, otherDisease, caseDetail, totalVisit, name, age, dressing, dressingCost, medicines,outStandingAmount } = req.body;
    const medNames = medicines.map(med => med.name);
    const medPrices = medicines.map(med => med.price);

    const query = 'INSERT INTO user_data (customId, date, sex, TypeData, address, disease, otherDisease, caseDetail, TotalVisit, name, age, dressing, dressingCost, medhub, medhubPrice,outStandingAmount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [customId, date, sex, type, address, disease, otherDisease, caseDetail, totalVisit, name, age, dressing, dressingCost, JSON.stringify(medNames), JSON.stringify(medPrices),outStandingAmount];

    pool.query(query, values, (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send('Server error');
      }
      console.log(res);
      res.status(200).json({ id: result.insertId, customId, ...req.body });
    });
  });
});
app.get('/users', (req, res) => {
  pool.query('SELECT * FROM user_data', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).send('Server error');
    }

    const formattedResults = results.map(row => ({
      ...row,
      date: convertToIST(row.date)
    }));

    res.json(formattedResults);
  });
});


// app.put('/users/:id', (req, res) => {
//   const userId = req.params.id;
//   const { date, TotalVisit, medicines, dressing, dressingCost } = req.body;
//   const formattedDate = convertToIST(date);
//   const medNames=medicines.map(med=>med.name)
//   const medPrices=medicines.map(med=>med.price)

//   pool.query('SELECT previousDates, dressingHistory,medicineHistory FROM user_data WHERE id = ?', [userId], (err, results) => {
//     if (err) {
//       console.error('Error fetching history:', err);
//       return res.status(500).send('Server error');
//     }

//     let previousDates = results[0].previousDates ? JSON.parse(results[0].previousDates) : [];
//     let dressingHistory = results[0].dressingHistory ? JSON.parse(results[0].dressingHistory) : [];
//     let medicineHistory=results[0].medicineHistory?JSON.parse(results[0].medicineHistory):[];
//     pool.query('SELECT date,medhub,medhubPrice, dressing, dressingCost FROM user_data WHERE id = ?', [userId], (err, results) => {
//       if (err) {
//         console.error('Error fetching current data:', err);
//         return res.status(500).send('Server error');
//       }

//       if (results[0].date !== formattedDate) {
//         previousDates.push(results[0].date);
//       }

//       dressingHistory.push({
//         date: formattedDate,
//         dressing: results[0].dressing,
//         dressingCost: results[0].dressingCost,
//       });
//       const newMedicineEntry={
//         date:formattedDate,
//         medhub:medNames,
//         medhubPrice:medPrices,
//       }
//       medicineHistory.push(newMedicineEntry)
//       const query = 'UPDATE user_data SET date = ?, TotalVisit = ?,medhub= ?, medhubPrice = ?, previousDates = ?, dressing = ?, dressingCost = ?, dressingHistory = ?,medicineHistory = ? WHERE id = ?';
//       pool.query(query, [formattedDate, TotalVisit,  JSON.stringify(medNames), JSON.stringify(medPrices), JSON.stringify(previousDates), JSON.stringify(medicineHistory), dressing, dressingCost, JSON.stringify(dressingHistory), userId], (err, result) => {
//         if (err) {
//           console.error('Error updating user:', err);
//           return res.status(500).send('Server error');
//         }
//         res.status(200).send('User updated successfully');
//       });
//     });
//   });
// });

// working api 


app.put('/user/:id', (req, res) => {
  const userId = req.params.id;
  const { date, TotalVisit, medicines } = req.body;
  const formattedDate = convertToIST(date);
  const medNames = medicines.map(med => med.name);
  const medPrices = medicines.map(med => med.price);

  pool.query('SELECT previousDates, medicineHistory FROM user_data WHERE id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Error fetching date history:', err);
      return res.status(500).send('Server error');
    }

    let previousDates = results[0].previousDates ? JSON.parse(results[0].previousDates) : [];
    let medicineHistory = results[0].medicineHistory ? JSON.parse(results[0].medicineHistory) : [];

    pool.query('SELECT date, medhub, medhubPrice FROM user_data WHERE id = ?', [userId], (err, results) => {
      if (err) {
        console.error('Error fetching current data:', err);
        return res.status(500).send('Server error');
      }

      if (results[0].date !== formattedDate) {
        previousDates.push(results[0].date);
      }

      const newMedicineEntry = {
        date: formattedDate,
        medhub: medNames,
        medhubPrice: medPrices,
      };

      medicineHistory.push(newMedicineEntry);

      const query = 'UPDATE user_data SET date = ?, TotalVisit = ?, medhub = ?, medhubPrice = ?, previousDates = ?, medicineHistory = ? WHERE id = ?';
      pool.query(query, [formattedDate, TotalVisit, JSON.stringify(medNames), JSON.stringify(medPrices), JSON.stringify(previousDates), JSON.stringify(medicineHistory), userId], (err, result) => {
        if (err) {
          console.error('Error updating user:', err);
          return res.status(500).send('Server error');
        }
        res.status(200).send('User updated successfully');
      });
    });
  });
});
app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  const { date, TotalVisit,outStandingAmount, medicines, dressing, dressingCost } = req.body;
  const formattedDate = convertToIST(date);

  pool.query('SELECT * FROM user_data WHERE id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user data:', err);
      return res.status(500).send('Server error');
    }

    const userData = results[0];
    const currentMedicineHistory = userData.medicineHistory ? JSON.parse(userData.medicineHistory) : [];
    const currentDressingHistory = userData.dressingHistory ? JSON.parse(userData.dressingHistory) : [];
    
    const newMedicineHistory = {
      date: formattedDate,
      medhub: medicines.map(med => med.name),
      medhubPrice: medicines.map(med => med.price),
      dressing: dressing,
      dressingCost: dressingCost,
    };

    if (userData.date !== formattedDate) {
      currentMedicineHistory.push(newMedicineHistory);
      currentDressingHistory.push(newMedicineHistory);
    }

    const query = 'UPDATE user_data SET date = ?, TotalVisit = ?, outStandingAmount= ?, medicineHistory = ?, dressingHistory = ?, previousDates = ? WHERE id = ?';
    pool.query(query, [formattedDate, TotalVisit,outStandingAmount, JSON.stringify(currentMedicineHistory), JSON.stringify(currentDressingHistory), JSON.stringify(currentMedicineHistory.map(item => item.date)), userId], (err, result) => {
      if (err) {
        console.error('Error updating user:', err);
        return res.status(500).send('Server error');
      }
      res.status(200).send('User updated successfully');
    });
  });
});

// app.put('/users/:id', (req, res) => {
//   const userId = req.params.id;
//   const { date, TotalVisit, medicines, dressing, dressingCost } = req.body;
//   const formattedDate = convertToIST(date);
//   const medNames = medicines.map(med => med.name);
//   const medPrices = medicines.map(med => med.price);

//   pool.query('SELECT previousDates, dressingHistory, medicineHistory FROM user_data WHERE id = ?', [userId], (err, results) => {
//     if (err) {
//       console.error('Error fetching history:', err);
//       return res.status(500).send('Server error');
//     }

//     let previousDates = results[0].previousDates ? JSON.parse(results[0].previousDates) : [];
//     let dressingHistory = results[0].dressingHistory ? JSON.parse(results[0].dressingHistory) : [];
//     let medicineHistory = results[0].medicineHistory ? JSON.parse(results[0].medicineHistory) : [];

//     pool.query('UPDATE user_data SET date = ?, TotalVisit = ?, medhub = ?, medhubPrice = ?, previousDates = ?, dressing = ?, dressingCost = ?, dressingHistory = ?, medicineHistory = ? WHERE id = ?',
//       [formattedDate, TotalVisit, JSON.stringify(medNames), JSON.stringify(medPrices), JSON.stringify(previousDates), dressing, dressingCost, JSON.stringify(dressingHistory), JSON.stringify(medicineHistory), userId],
//       (err, result) => {
//         if (err) {
//           console.error('Error updating user:', err);
//           return res.status(500).send('Server error');
//         }
//         res.status(200).send('User updated successfully');
//       });
//   });
// });


// app.put('/users/:id', (req, res) => {
//   const userId = req.params.id;
//   const { date, TotalVisit,medicines,dressing, dressingCost } = req.body;
//   const formattedDate = convertToIST(date);
// const medNames=medicines.map(med=>med.name)
// const medPrices=medicines.map(med=>med.price)

//   pool.query('SELECT previousDates,dressingHistory,medicineHistory FROM user_data WHERE id = ?', [userId], (err, results) => {
//     if (err) {
//       console.error('Error fetching date history:', err);
//       return res.status(500).send('Server error');
//     } 

//     let previousDates = results[0].previousDates ? JSON.parse(results[0].previousDates) : [];
//     let dressingHistory = results[0].dressingHistory ? JSON.parse(results[0].dressingHistory) : [];
//     let medicineHistory=results[0].medicineHistory?JSON.parse(results[0].medicineHistory):[];

//     pool.query('SELECT date,medhub,medhubPrice,dressing, dressingCost FROM user_data WHERE id = ?', [userId], (err, results) => {
//       if (err) {
//         console.error('Error fetching current date:', err);
//         return res.status(500).send('Server error');
//       }

//       if (results[0].date !== formattedDate) {
//         previousDates.push(results[0].date);
//       }

//       const newMedicineEntry={
//         date:formattedDate,
//         medhub:medNames,
//         medhubPrice:medPrices,
//       }
//       medicineHistory.push(newMedicineEntry)

//       const newDressingHistory={
//         date:formattedDate,
//         dressing:dressing,
//         dressingCost:dressingCost,
//       }
//       dressingHistory.push(newDressingHistory)

//       const query = 'UPDATE user_data SET date = ?, TotalVisit = ?,medhub= ?, medhubPrice = ?, previousDates = ?,dressing = ?, dressingCost = ?, dressingHistory = ?, medicineHistory = ? WHERE id = ?';
//       pool.query(query, [formattedDate, TotalVisit,  JSON.stringify(medNames), JSON.stringify(medPrices), JSON.stringify(previousDates), JSON.stringify(medicineHistory), dressing, dressingCost, JSON.stringify(dressingHistory), userId], (err, result) => {
//         if (err) {
//           console.error('Error updating user:', err);
//           return res.status(500).send('Server error');
//         }
//         console.log(res);
//         res.status(200).send('User updated successfully');
//       });
//     });
//   });
// });
app.delete('/users/delete/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM user_data WHERE id = ?';

  pool.query(sql, [id], (err, result) => {
      if (err) {
          console.error('Error deleting record:', err);
          res.status(500).send('Internal Server Error');
          return;
      }
      if (result.affectedRows === 0) {
          res.status(404).send('Record not found');
          return;
      }
      res.send('Record deleted successfully');
  });
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});





// alter working code


// require('dotenv').config();
// const express = require('express');
// const jwt = require('jsonwebtoken');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const mysql = require('mysql2');
// const moment=require('moment-timezone')
// const app = express();
// const port = 3002;


// app.use(cors());
// app.use(bodyParser.json());
// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });
// pool.getConnection((err)=>{
//   if (err) {
//         throw err;
//       }
//       console.log('MySQL connected...')
// })

// const convertToIST = (date) => {
//   // const  date = new Date(dateStr);
//   //   return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }).split(',')[0];
//   return moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD');
// };

// const generateCustomId = (callback) => {
//   pool.query('SELECT customId FROM user_data ORDER BY id DESC LIMIT 1', (err, results) => {
//     if (err) {
//       return callback(err, null);
//     }
//     if (results.length > 0 && results[0].customId) {
//       const lastId = results[0].customId;
//       const lastNumericPart = parseInt(lastId.replace('SMBC0', ''), 10);
//       const newNumericPart = lastNumericPart + 1;
//       const newCustomId = `SMBC0${newNumericPart}`;
//       return callback(null, newCustomId);
//     } else {
//       return callback(null, 'SMBC01');
//     }
//   });
// };

// // Login API
// app.post('/api/login', (req, res) => {
//   const { username, password } = req.body;

//   pool.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, result) => {
//     if (err) throw err;

//     if (result.length > 0) {
//       const token = jwt.sign({ id: result[0].id },  process.env.JWT_SECRET, { expiresIn: '1h' });
//       res.json({ token });
//     } else {
//       console.log(res);
//       res.status(401).json({ message: 'Invalid credentials' });
//     }
//   });
// });

// app.post('/submit-form', (req, res) => {
//   generateCustomId((err, customId) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).send('Server error');
//     }

//     const { date, sex, type, address, disease, otherDisease, caseDetail, totalVisit, name, age, dressing, dressingCost, medicines } = req.body;
//     const medNames = medicines.map(med => med.name);
//     const medPrices = medicines.map(med => med.price);

//     const query = 'INSERT INTO user_data (customId, date, sex, TypeData, address, disease, otherDisease, caseDetail, TotalVisit, name, age, dressing, dressingCost, medhub, medhubPrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
//     const values = [customId, date, sex, type, address, disease, otherDisease, caseDetail, totalVisit, name, age, dressing, dressingCost, JSON.stringify(medNames), JSON.stringify(medPrices)];

//     pool.query(query, values, (err, result) => {
//       if (err) {
//         console.error('Error executing query:', err);
//         return res.status(500).send('Server error');
//       }
//       console.log(res);
//       res.status(200).json({ id: result.insertId, customId, ...req.body });
//     });
//   });
// });
// app.get('/users', (req, res) => {
//   pool.query('SELECT * FROM user_data', (err, results) => {
//     if (err) {
//       console.error('Error fetching users:', err);
//       return res.status(500).send('Server error');
//     }

//     const formattedResults = results.map(row => ({
//       ...row,
//       date: convertToIST(row.date)
//     }));

//     res.json(formattedResults);
//   });
// });




// app.put('/users/:id', (req, res) => {
//   const userId = req.params.id;
//   const { date, TotalVisit } = req.body;
//   const formattedDate = convertToIST(date);

//   pool.query('SELECT previousDates FROM user_data WHERE id = ?', [userId], (err, results) => {
//     if (err) {
//       console.error('Error fetching date history:', err);
//       return res.status(500).send('Server error');
//     }

//     let previousDates = results[0].previousDates ? JSON.parse(results[0].previousDates) : [];
//     pool.query('SELECT date FROM user_data WHERE id = ?', [userId], (err, results) => {
//       if (err) {
//         console.error('Error fetching current date:', err);
//         return res.status(500).send('Server error');
//       }

//       if (results[0].date !== formattedDate) {
//         previousDates.push(results[0].date);
//       }

//       const query = 'UPDATE user_data SET date = ?, TotalVisit = ?, previousDates = ? WHERE id = ?';
//       pool.query(query, [formattedDate, TotalVisit, JSON.stringify(previousDates), userId], (err, result) => {
//         if (err) {
//           console.error('Error updating user:', err);
//           return res.status(500).send('Server error');
//         }
//         console.log(res);
//         res.status(200).send('User updated successfully');
//       });
//     });
//   });
// });
// app.delete('/users/delete/:id', (req, res) => {
//   const id = req.params.id;
//   const sql = 'DELETE FROM user_data WHERE id = ?';

//   pool.query(sql, [id], (err, result) => {
//       if (err) {
//           console.error('Error deleting record:', err);
//           res.status(500).send('Internal Server Error');
//           return;
//       }
//       if (result.affectedRows === 0) {
//           res.status(404).send('Record not found');
//           return;
//       }
//       res.send('Record deleted successfully');
//   });
// });
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });


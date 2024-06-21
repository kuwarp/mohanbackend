// const express = require('express');
// const jwt = require('jsonwebtoken');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const mysql = require('mysql2');

// const app = express();
// const port = 3002;

// app.use(cors());
// app.use(bodyParser.json());

// const db = mysql.createConnection({
//   host: '89.117.27.52',
//   user: 'u898742638_shrimohanbone',
//   password: 'IgSHK39!',
//   database: 'u898742638_shriMohanJi',
// });

// db.connect(err => {
//     if (err) {
//         throw err;
//     }
//     console.log('MySQL connected...');
// });

// const pool = mysql.createPool({
//   host: '89.117.27.52',
//   user: 'u898742638_shrimohanbone',
//   password: 'IgSHK39!',
//   database: 'u898742638_shriMohanJi',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// const generateCustomId = (callback) => {
//     pool.query('SELECT customId FROM user_data ORDER BY customId DESC LIMIT 1', (err, results) => {
//               if (err) {
//                   return callback(err, null);
//               }
//               if (results.length > 0) {
//                   const lastId = results[0].customId;
//                   const lastNumericPart = parseInt(lastId.replace('SMBC0', ''), 10);
//                   const newNumericPart = lastNumericPart + 1;
//                   const newCustomId = `SMBC0${newNumericPart}`;
//                   return callback(null, newCustomId);
//               } else {
//                   return callback(null, 'SMBC01');
//               }
//           });
//   };

// // login API

// let JWT_TOKEN='shrimohanjitoken'
// app.post('/api/login',(req,res)=>{
//     const {username,password}=req.body;

//     pool.query('SELECT * FROM users WHERE username= ? AND password =?',[username,password],(err,result)=>{
// if(err) throw err

// if(result.length>0){
//     const token = jwt.sign({id:result[0].id},JWT_TOKEN,{expiresIn:'1h'})
//     res.json({token})
// }
// else{
//     res.status(401).json({message:'Invalid credentials'})
// }
//     })

// })


// // Database retrivel queries



//   app.post('/submit-form', (req, res) => {
//   generateCustomId((err)=>{
//     if(err){
//         console.error(err);
//         return res.status(500).send('server error')

        
//     }

//     const {customId, date, sex, type, address, disease, otherDisease, caseDetail, totalVisit, name, age } = req.body;

//  const query = 'INSERT INTO user_data (customId, date, sex, TypeData, address, disease, otherDisease, caseDetail, TotalVisit, name, age) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
//   pool.query(query, [customId,date, sex, type, address, disease, otherDisease, caseDetail, totalVisit, name, age], (err, result) => {
//       if (err) {
//           console.error('Error executing query:', err);
//           return res.status(500).send('Server error');
//       }
//       console.log('Query result:', result);
//       res.status(200).send('Form submitted successfully');
//       res.json({ id: result.insertId, customId, ...req.body });
//   });
//   })
// });


// app.get('/users', (req, res) => {
//   pool.query('SELECT * FROM user_data', (err, results) => {
//       if (err) {
//           console.error('Error fetching users:', err);
//           return res.status(500).send('Server error');
//       }
//       res.json(results);
//   });
// });
// app.put('/users/:id', (req, res) => {
//   const userId = req.params.id;
//   const { date, TotalVisit } = req.body;

//   pool.query('SELECT previousDates FROM user_data WHERE id = ?', [userId], (err, results) => {
//       if (err) {
//           console.error('Error fetching date history:', err);
//           return res.status(500).send('Server error');
//       }

//       let previousDates = results[0].previousDates ? JSON.parse(results[0].previousDates) : [];
//       pool.query('SELECT date FROM user_data WHERE id = ?', [userId], (err, results) => {
//           if (err) {
//               console.error('Error fetching current date:', err);
//               return res.status(500).send('Server error');
//           }

//           if (results[0].date !== date) {
//               previousDates.push(results[0].date);
//           }

//           const query = 'UPDATE user_data SET date = ?, TotalVisit = ?, previousDates = ? WHERE id = ?';
//           pool.query(query, [date, TotalVisit, JSON.stringify(previousDates), userId], (err, result) => {
//               if (err) {
//                   console.error('Error updating user:', err);
//                   return res.status(500).send('Server error');
//               }
//               res.status(200).send('User updated successfully');
//           });
//       });
//   });
// });




// app.listen(port, () => {
//     console.log(`Server running on port ${port}`);
// });




const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 3002;

app.use(cors());
app.use(bodyParser.json());
require('dotenv').config();
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.connect(err => {
  if (err) {
    throw err;
  }
  console.log('MySQL connected...');
});

const pool = mysql.createPool({
  host: '89.117.27.52',
  user: 'u898742638_shrimohanbone',
  password: 'IgSHK39!',
  database: 'u898742638_shriMohanJi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


const formatIndianDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

app.get('/users', (req, res) => {
  pool.query('SELECT * FROM user_data', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).send('Server error');
    }

    // For PostgreSQL
    // const formattedResults = results.rows.map(row => ({
    //   ...row,
    //   date: formatIndianDate(row.date)
    // }));

    // For MySQL
    const formattedResults = results.map(row => ({
      ...row,
      date: formatIndianDate(row.date)
    }));

    console.log(formattedResults);
    res.json(formattedResults);
  });
});
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
      const token = jwt.sign({ id: result[0].id }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } else {
      console.log(res);
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

// Submit Form Endpoint
app.post('/submit-form', (req, res) => {
  generateCustomId((err, customId) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }

    const { date, sex, type, address, disease, otherDisease, caseDetail, totalVisit, name, age } = req.body;

    const query = 'INSERT INTO user_data (customId, date, sex, TypeData, address, disease, otherDisease, caseDetail, TotalVisit, name, age) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [customId, date, sex, type, address, disease, otherDisease, caseDetail, totalVisit, name, age];

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

// Get Users
// app.get('/users', (req, res) => {
//   pool.query('SELECT * FROM user_data', (err, results) => {
//     if (err) {
//       console.error('Error fetching users:', err);
//       return res.status(500).send('Server error');
//     }
//     console.log(results);
//     res.json(results);
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
//       date: row.date.toISOString().split('T')[0] 
//     }));

//     console.log(formattedResults);
//     res.json(formattedResults);
//   });
// });
// Update User
app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  const { date, TotalVisit } = req.body;
  const formattedDate = new Date(date).toISOString().split('T')[0];

  pool.query('SELECT previousDates FROM user_data WHERE id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Error fetching date history:', err);
      return res.status(500).send('Server error');
    }

    let previousDates = results[0].previousDates ? JSON.parse(results[0].previousDates) : [];
    pool.query('SELECT date FROM user_data WHERE id = ?', [userId], (err, results) => {
      if (err) {
        console.error('Error fetching current date:', err);
        return res.status(500).send('Server error');
      }

      if (results[0].date !== formattedDate) {
        previousDates.push(results[0].date);
      }

      const query = 'UPDATE user_data SET date = ?, TotalVisit = ?, previousDates = ? WHERE id = ?';
      pool.query(query, [formattedDate, TotalVisit, JSON.stringify(previousDates), userId], (err, result) => {
        if (err) {
          console.error('Error updating user:', err);
          return res.status(500).send('Server error');
        }
        console.log(res);
        res.status(200).send('User updated successfully');
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const userController = require('./src/controllers/dataController');
// const authController = require('./src/controllers/authController');
// const authMiddleware = require('./src/middleware/authMiddle');

// dotenv.config();

// const app = express();
// const port = process.env.PORT || 3002;

// app.use(cors());
// app.use(bodyParser.json());

// // Routes
// app.post('/api/login', authController.login);
// app.post('/api/users', authMiddleware, userController.createUser);
// app.put('/api/users/:id', authMiddleware, userController.updateUser);

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
//   console.log(process.env.DB_HOST);
// console.log(process.env.DB_USER);
// // Log other environment variables as needed

// });
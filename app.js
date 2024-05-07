const express = require('express');
const compression = require('compression');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const app = express();
const jwt = require('jsonwebtoken');


const connection = mysql.createConnection({
  host: 'sql10.freemysqlhosting.net',
  user: 'sql10704485', 
  password: 'MnKb4CWS36', 
  database: 'sql10704485',
});


connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database!');
});

app.use(cors()); 

app.use(bodyParser.json());
app.use(compression());



app.post('/signingup', (req, res) => {
  const { username, email, password } = req.body;
  console.log('Inside server signup');
  
  const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  connection.query(sql, [username, email, password], (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      res.status(500).send('Error inserting user');
      return;
    }
    console.log('User inserted:', result);
    res.status(200).send('User inserted successfully');
  });
});

app.post('/checkLogin', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  connection.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error('Error', err);
      res.status(500).send('Error');
      return;
    }

    if (result.length > 0) {
     
      const token = jwt.sign({ username }, 'basic', { expiresIn: '1m' });
      
      res.status(200).json({ message: 'Login successful', token, user: result[0] });
    } else {
      
      console.log('User not found');
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

app.post('/addExpense', (req, res) => {
  const { username, month, item, budget } = req.body;
  const selectQuery = 'SELECT * FROM budgets WHERE username = ? AND month = ? AND item = ?';
  connection.query(selectQuery, [username, month, item], (err, result) => {
    if (err) {
      console.error('Error ', err);
      res.status(500).json({ error: 'Error' });
      return;
    }
    if (result.length > 0) {
      const updatedBudget = parseFloat(result[0].budget) + parseFloat(budget);
      const updateQuery = 'UPDATE budgets SET budget = ? WHERE username = ? AND month = ? AND item = ?';
      connection.query(updateQuery, [updatedBudget, username, month, item], (updateErr) => {
        if (updateErr) {
          console.error('Error updating:', updateErr);
          res.status(500).json({ error: 'Error updating' });
          return;
        }
        console.log('Record updated successfully');
        res.status(200).json({ message: 'Record updated successfully' });
      });
    } else {
      const insertQuery = 'INSERT INTO budgets (username, month, item, budget) VALUES (?, ?, ?, ?)';
      connection.query(insertQuery, [username, month, item, budget], (insertErr) => {
        if (insertErr) {
          console.error('Error inserting:', insertErr);
          res.status(500).json({ error: 'Error inserting' });
          return;
        }
        console.log('New record inserted successfully');
        res.status(200).json({ message: 'New record inserted successfully' });
      });
    }
  });
});


app.post('/addCapacity', (req, res) => {
  const { username, month, item, capacity } = req.body;

  const selectQuery = `
    SELECT * FROM budgets 
    WHERE username = ? AND month = ? AND item = ?
  `;

  connection.query(selectQuery, [username, month, item], (selectErr, selectResults) => {
    if (selectErr) {
      console.error('Error selecting data:', selectErr);
      return res.status(500).json({ message: 'Error retrieving data' });
    }

    if (selectResults.length > 0) {
     
      const updateQuery = `
        UPDATE budgets 
        SET capacity = ? 
        WHERE username = ? AND month = ? AND item = ?
      `;

      connection.query(updateQuery, [capacity, username, month, item], (updateErr, updateResults) => {
        if (updateErr) {
          console.error('Error updating capacity:', updateErr);
          return res.status(500).json({ message: 'Error updating capacity' });
        }
        return res.json({ message: 'Capacity updated for existing record' });
      });
    } else {
      
      const insertQuery = `
        INSERT INTO budgets (username, month, item, budget, capacity) 
        VALUES (?, ?, ?, 0, ?)
      `;

      connection.query(insertQuery, [username, month, item, capacity], (insertErr, insertResults) => {
        if (insertErr) {
          console.error('Error inserting:', insertErr);
          return res.status(500).json({ message: 'Error creating' });
        }
        return res.json({ message: 'New record created with capacity' });
      });
    }
  });
});

app.get('/getExpensesByMonth', (req, res) => {
  const { username, month } = req.query;
  const query = `SELECT * FROM budgets WHERE username = ? AND month = ?`;
  connection.query(query, [username, month], (error, results) => {
    if (error) {
      console.error('Error fetching budget data:', error);
      res.status(500).json({ error: 'An error occurred while fetching budget data.' });
    } else {
      res.status(200).json(results); 
    }
  });
});

module.exports = app;

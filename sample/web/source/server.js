const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  axios.get(process.env.API_SERVER_URL+'/transactions')
    .then(response => {
      const transactions = response.data;
      console.log(transactions);
      const tableRows = transactions.map(transaction => {
        return `<tr>
                  <td>${transaction.transaction_id}</td>
                  <td>${transaction.description}</td>
                  <td>${transaction.value}</td>
                </tr>`;
      });
      const table = `<table>
            <thead>
                <tr>
                <th>Transaction ID</th>
                <th>Description</th>
                <th>Value</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows.join('')}
            </tbody>
        </table>`;
      res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Transaction Table</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    padding: 20px;
                }
                h2 {
                    color: #333;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    padding: 8px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
                th {
                    background-color: #f2f2f2;
                    font-weight: bold;
                    color: #333;
                }
                form {
                    margin-top: 20px;
                }
                input[type="text"] {
                    padding: 8px;
                    margin-right: 10px;
                }
                button {
                    padding: 8px 16px;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <h2>Transaction List</h2>
            ${table}
            <h2>Add New Transaction</h2>
            <form action="/transaction" method="post">
                <input type="text" name="description" placeholder="Description">
                <input type="text" name="value" placeholder="Value">
                <button type="submit">Add Transaction</button>
            </form>
        </body>
        </html>`);
    })
    .catch(error => {
        console.error('Error fetching transactions:', error);
        res.status(500).send('Error fetching transactions');
    });
});

app.post('/transaction', (req, res) => {
    const { description, value } = req.body;
    if (!description || !value) {
      return res.status(400).send('Description and value are required');
    }
    axios.post(process.env.API_SERVER_URL + '/transaction', {
      description,
      value
    })
    .then(response => {
      res.redirect('/');
    })
    .catch(error => {
      console.error('Error adding transaction:', error);
      res.status(500).send('Error adding transaction');
    });
  });
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  
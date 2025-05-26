// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const mysql = require('mysql2');
// const fs = require('fs');
// const csv = require('csv-parser');
// const path = require('path');

// const app = express();
// const PORT = 3000;

// // const db = mysql.createConnection({
// //   host: 'localhost',
// //   user: 'root',
// //   password: '2042', // Replace with your MySQL root password
// //   database: 'mixed-types.csv'
// // });

// // Middleware
// app.use(bodyParser.json());
// app.use(cors());
// app.use(express.static(path.join(__dirname)));

// // MySQL Database Connection
// // const db = mysql.createConnection({
// //   host: 'localhost',
// //   user: 'root',
// //   password: '',
// //   database: 'sampledb'
// // });

// // // Connect to the database
// // db.connect((err) => {
// //   if (err) {
// //     console.error('MySQL connection error:', err);
// //     console.log('Falling back to CSV file for search functionality');
// //   } else {
// //     console.log('Connected to MySQL database');
// //   }
// // });

// // Function to search in CSV file
// function searchInCSV(query) {
//   return new Promise((resolve, reject) => {
//     const results = [];
//     const csvPath = path.join(__dirname, 'data.csv');
    
//     if (!fs.existsSync(csvPath)) {
//       return reject({ error: 'CSV file not found' });
//     }

//     fs.createReadStream(csvPath)
//       .pipe(csv())
//       .on('data', (row) => {
//         // Convert all values to lowercase for case-insensitive search
//         const rowValues = Object.values(row).map(val => 
//           val.toString().toLowerCase()
//         );
        
//         // Check if any value in the row contains the query
//         if (rowValues.some(val => val.includes(query.toLowerCase()))) {
//           results.push(row);
//         }
//       })
//       .on('end', () => {
//         if (results.length > 0) {
//           resolve(results);
//         } else {
//           reject({ error: 'No results found for your search' });
//         }
//       })
//       .on('error', (error) => {
//         reject({ error: 'Error processing CSV file: ' + error.message });
//       });
//   });
// }

// // Endpoint to handle user queries
// app.post('/query', (req, res) => {
//   const userQuery = req.body.query;

//   if (!userQuery || userQuery.trim() === '') {
//     return res.status(400).json({ error: 'Please provide a search query' });
//   }

//   // Try to search in MySQL database first
//   const sqlQuery = `
//     SELECT * FROM people 
//     WHERE 
//       Name LIKE ? OR 
//       Description LIKE ? OR 
//       ID LIKE ? OR 
//       Age LIKE ? OR
//       Score LIKE ? OR
//       Active LIKE ? OR
//       DateOfBirth LIKE ? OR
//       JoinDate LIKE ?
//   `;
  
//   const searchParam = `%${userQuery}%`;
//   const params = Array(8).fill(searchParam);

//   db.query(sqlQuery, params, (err, results) => {
//     if (err) {
//       // If MySQL query fails, fall back to CSV search
//       console.error('MySQL query error:', err);
//       searchInCSV(userQuery)
//         .then(csvResults => {
//           res.json({ 
//             source: 'CSV', 
//             results: csvResults.slice(0, 10),  // Limit to 10 results
//             totalResults: csvResults.length
//           });
//         })
//         .catch(error => {
//           res.status(404).json(error);
//         });
//     } else if (results && results.length > 0) {
//       // If MySQL query returns results
//       res.json({ 
//         source: 'MySQL', 
//         results: results.slice(0, 10),  // Limit to 10 results
//         totalResults: results.length
//       });
//     } else {
//       // If no results from MySQL, try CSV
//       searchInCSV(userQuery)
//         .then(csvResults => {
//           res.json({ 
//             source: 'CSV', 
//             results: csvResults.slice(0, 10),
//             totalResults: csvResults.length
//           });
//         })
//         .catch(error => {
//           res.status(404).json(error);
//         });
//     }
//   });
// });

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
// // botMessage.textContent = `Bot: ${error.message || 'Sorry, I could not process your request.'}`;
// // messages.appendChild(botMessage);

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));



// Function to search in JSON file
function searchInJSON(query) {
  return new Promise((resolve, reject) => {
    const jsonPath = path.join(__dirname, 'data.json');

    if (!fs.existsSync(jsonPath)) {
      return reject({ error: 'JSON file not found' });
    }

    fs.readFile(jsonPath, 'utf8', (err, data) => {
      if (err) {
        return reject({ error: 'Error reading JSON file: ' + err.message });
      }

      try {
        const jsonData = JSON.parse(data);
        const results = jsonData.filter((item) => {
          // Convert all values to lowercase for case-insensitive search
          return Object.values(item).some((val) =>
            val.toString().toLowerCase().includes(query.toLowerCase())
          );
        });

        if (results.length > 0) {
          resolve(results);
        } else {
          reject({ error: 'No results found in JSON file' });
        }
      } catch (parseError) {
        reject({ error: 'Error parsing JSON file: ' + parseError.message });
      }
    });
  });
}

// Function to search in CSV file
function searchInCSV(query) {
  return new Promise((resolve, reject) => {
    const results = [];
    const csvPath = path.join(__dirname, 'people-100.csv');

    if (!fs.existsSync(csvPath)) {
      return reject({ error: 'CSV file not found' });
    }

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Convert all values to lowercase for case-insensitive search
        const rowValues = Object.values(row).map((val) =>
          val.toString().toLowerCase()
        );

        // Check if any value in the row contains the query
        if (rowValues.some((val) => val.includes(query.toLowerCase()))) {
          results.push(row);
        }
      })
      .on('end', () => {
        if (results.length > 0) {
          resolve(results);
        } else {
          reject({ error: 'No results found in DATABASE file' });
        }
      })
      .on('error', (error) => {
        reject({ error: 'Error processing CSV file: ' + error.message });
      });
  });
}

// Endpoint to handle user queries
app.post('/query', (req, res) => {
  const userQuery = req.body.query;

  if (!userQuery || userQuery.trim() === '') {
    return res.status(400).json({ error: 'Please provide a search query' });
  }

  // First search in JSON file
  searchInJSON(userQuery)
    .then((jsonResults) => {
      res.json({
        source: 'JSON',
        results: jsonResults.slice(0, 10), // Limit to 10 results
        totalResults: jsonResults.length,
      });
    })
    .catch(() => {
      // If no results in JSON, search in CSV file
      searchInCSV(userQuery)
        .then((csvResults) => {
          res.json({
            source: 'CSV',
            results: csvResults.slice(0, 10), // Limit to 10 results
            totalResults: csvResults.length,
          });
        })
        .catch((error) => {
          res.status(404).json(error);
        });
    });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


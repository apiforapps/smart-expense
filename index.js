const express = require('express');
const path = require('path');
require('colors');

const app = express();

// Serve frontend
app.use(express.static('build'));

app.get('*', (req, res) =>
  res.sendFile('index.html', { root: path.join(__dirname, 'build') })
);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server running  on port ${PORT}`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server and exit process
  server.close(() => process.exit(1));
});

module.exports = app;

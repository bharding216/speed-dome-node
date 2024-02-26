const cors = require('cors');

// Allow requests from your frontend domain
const corsOptions = {
  origin: 'https://www.speeddomeengineering.com',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Enable sending cookies and other credentials
};

module.exports = cors(corsOptions);
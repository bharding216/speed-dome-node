const express = require('express');
const db = require('./config/database');
const bodyParser = require('body-parser');
const cors = require('cors');
const indexController = require('./src/controllers/indexController');
const app = express();

const corsOptions = {
    origin: '*',
  };

app.get('/', indexController.handleRootRequest);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Just in case: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html

const express = require('express');
const db = require('./src/config/database');
const bodyParser = require('body-parser');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();
const PORT = 3000;

const corsOptions = {
    origin: '*',
  };

app.use(cors(corsOptions));
app.use(bodyParser.json());

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

const productRoutes = require('./src/routes/productRoutes');
// const orderRoutes = require('./src/routes/orderRoutes');

app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

module.exports.handler = serverless(app);

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

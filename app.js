// Just in case: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html

const express = require('express');
const db = require('./src/config/database');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

const productRoutes = require('./src/routes/productRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');


if (process.env.ENVIRONMENT === 'local') {
    const corsOptions = {
        origin: 'http://localhost:5173',
    };

    app.use(cors(corsOptions));
}


app.use('/api/products', productRoutes);
app.use('/api', paymentRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

module.exports.handler = serverless(app);

if (process.env.ENVIRONMENT === 'local') {
    console.log('Running locally');

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

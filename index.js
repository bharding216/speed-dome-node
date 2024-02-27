const express = require('express');
const serverless = require('serverless-http');

const app = express();

// Your Express routes and middleware setup

module.exports.handler = serverless(app);

const express = require('express');
const helmet = require("helmet");
const fileParser = require('express-multipart-file-parser');

const health = require('./health');
const task = require('./task');

const app = express();

// security
app.use(helmet());

// file upload
app.use(fileParser);

// init server
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// entry points
app.use("/task", task);
app.get("/", health);

exports.mainApp = app;
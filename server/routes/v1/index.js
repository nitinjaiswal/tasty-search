var express = require('express');
var app = module.exports = require('express')();
var router = express.Router();

app.use('/gourmet', require('./gourmet'));

const express = require('express');
const app = module.exports = require('express')();

const router = express.Router();

const functions = require('functions'),
  filter = functions.filter;
const response = require('response'),
  genericResponseV3 = response.common.genericResponseV3;
const resources = require('resources');
const controllers = require('controllers');
const gourmetResource = resources.gourmet.gourmet;
const gourmetController = controllers.gourmet.gourmet;


router.route('/tastySearch')
  .get(filter.unAuthFilter, gourmetResource.tastySearchResource, gourmetController.tastySearchController, genericResponseV3)
  
app.use('/', router)

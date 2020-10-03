var mongoose = require('converse-db-client').mongoose;

/**
 * @description Mongoose Schema for visitor
 */
var visitorSchema = new mongoose.Schema({
  intentName: {
    type: String,
    required: true
  },
  entities:{
    type: Object,
    required: false
  },
  response:{
    type: Object,
    required: false
  },
  createdAt: {
    type: Date,
    format: Date,
    required: true
  },
  lastModifiedAt: {
    type: Date,
    format: Date,
    required: false
  }

});

module.exports = mongoose.model('NLPresponse', visitorSchema, 'NLPresponse');

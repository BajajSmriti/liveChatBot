var mongoose = require('converse-db-client').mongoose;

/**
 * @description Mongoose Schema for visitor
 */
var visitorSchema = new mongoose.Schema({
  visitorId: {
    type: String,
    required: true
  },
  channelId: {
    type: String,
    required: true
  },
  chatMessage:{
    type: Object,
    required: false
  },
  response:{
    type: Object,
    required: false
  },
  startTimestamp: {
    type: Date,
    format: Date,
    required: true
  },
  lastUpdatedTimestamp: {
    type: Date,
    format: Date,
    required: false
  }

});

module.exports = mongoose.model('visitor', visitorSchema, 'visitor');

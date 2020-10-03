const responseModel = require('../models/response');

async function getVisitorfromSessionId(sessionId) {
  return responseModel.findOne(
    {
      "sessionId": sessionId
    }
  )
    .then(function (sessionId) {
      return sessionId;
    })
    .catch(function (err) {
      // throw the error to be handled by the endpoint
      console.error("getVisitorfromSessionId error: ",err)
      return 500;
    });
}

async function saveNLPResponse(nlpDetails) {
  return responseModel.create(nlpDetails)
    .then(function (nlpDetails) {
      return nlpDetails;
    })
    .catch(function (err) {
      // throw the error to be handled by the endpoint
      console.error("saveNLPResponse error: ",err)
      return 500;
    });
}

module.exports = {
    saveNLPResponse,
    getVisitorfromSessionId
}
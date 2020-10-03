const visitorModel = require('../models/visitor');

async function getVisitorfromSessionId(sessionId) {
  return visitorModel.findOne(
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

async function saveVisitor(visitorDetails) {
  return visitorModel.create(visitorDetails)
    .then(function (visitorDetails) {
      return visitorDetails;
    })
    .catch(function (err) {
      // throw the error to be handled by the endpoint
      console.error("saveVisitor error: ",err)
      return 500;
    });
}

async function updateVisitorId(channelId,visitorId){
  let fieldsToUpdate = {
    'visitorId': visitorId
  };
  return visitorModel.findOneAndUpdate({
    // find the details by the visitorId
    "channelId": channelId,
  }, fieldsToUpdate, {
      // will return the updated document
      new: true,
      runValidators: true,
    })
    .then(function (visitorDetails) {
      return visitorDetails;
    })
    .catch(function (err) {
      // throw the error to be handled by the endpoint
      console.error("updateVisitor error: ",err)
      return 500;
    });
}

async function updateVisitor(channelId,flag) {
  let fieldsToUpdate = {
    'flag': flag,
    'lastUpdatedTimestamp': Date.now()
  };
  return visitorModel.findOneAndUpdate({
    // find the details by the visitorId
    "channelId": channelId,
  }, fieldsToUpdate, {
      // will return the updated document
      new: true,
      runValidators: true,
    })
    .then(function (visitorDetails) {
      return visitorDetails;
    })
    .catch(function (err) {
      // throw the error to be handled by the endpoint
      console.error("updateVisitor error: ",err)
      return 500;
    });
}

async function updateVisitorSessionReq(sessionId,userInput,cb) {
  let sessionReq= await getVisitorfromSessionId(sessionId)
  if (sessionReq && sessionReq != 500) {
    sessionReq.initialSessionReq.sessionId = sessionId
    sessionReq.initialSessionReq.userInput = userInput
    let fieldsToUpdate = {
      'sessionId': sessionId,
      'initialSessionReq': sessionReq.initialSessionReq
    };
    return visitorModel.findOneAndUpdate({
      // find the details by the visitorId
      'sessionId': sessionId
    }, fieldsToUpdate, {
      // will return the updated document
      new: true,
      runValidators: true,
    })
      .then(function (visitorDetails) {
        cb(null, visitorDetails);
      })
      .catch(function (err) {
        // throw the error to be handled by the endpoint
        cb(err);
      });
  }
}

async function updateChatMessage(channelId,chatMessage) {
    let fieldsToUpdate = {
      'chatMessage': chatMessage
    };
    return visitorModel.findOneAndUpdate({
      // find the details by the visitorId
      "channelId": channelId,
    }, fieldsToUpdate, {
      // will return the updated document
      new: true,
      runValidators: true,
    })
      .then(function (visitorDetails) {
        return visitorDetails;
      })
      .catch(function (err) {
        // throw the error to be handled by the endpoint
        console.error("updateChatMessage error:", err)
        return 500;
      });
}

async function updateVisitorResponse(sessionId,response) {
  let sessionReq= await getVisitorfromSessionId(sessionId)
  if (sessionReq && sessionReq != 500) {

    sessionReq.responseZen = response
    let fieldsToUpdate = {
      'responseZen': sessionReq.responseZen
    };
    return visitorModel.findOneAndUpdate({
      // find the details by the visitorId
      "sessionId": sessionId,
    }, fieldsToUpdate, {
      // will return the updated document
      new: true,
      runValidators: true,
    })
      .then(function (visitorDetails) {
        return visitorDetails;
      })
      .catch(function (err) {
        // throw the error to be handled by the endpoint
        console.error("updateVisitorResponse error: ", err)
        return 500;
      });
  }
}

async function getVisitorChannelId(channelId) {
  return visitorModel.findOne(
    {
      "channelId": channelId
    }
  )
    .then(function (visitor) {
      return visitor;
    })
    .catch(function (err) {
      // throw the error to be handled by the endpoint
      console.error("getVisitorChannelId error: ",err)
      return 500;
    });
}

async function deleteVisitor(visitorId){
  return visitorModel.deleteMany(
      {
          "visitorId": visitorId
      }
  )
      .then(function (visitorId) {
          return visitorId;
      })
      .catch(function (err) {
          // throw the error to be handled by the endpoint
          console.error("getVisitor error: ", err)
          return 500;
      });

}

module.exports = {
    saveVisitor,
    updateVisitor,
    updateVisitorSessionReq,
    updateVisitorResponse,
    getVisitorfromSessionId,
    updateChatMessage,
    getVisitorChannelId,
    updateVisitorId,
    deleteVisitor
}
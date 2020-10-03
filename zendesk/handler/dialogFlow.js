const dialogflow = require('dialogflow');
const uuid = require('uuid');
const nlpResponse = require('../handler/responseDBHandler');
const helper = require('../utils/helper');

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function controller(webSocket, channelId, content, projectId = 'paymentbot-fxja') {
    try{
    // A unique identifier for the given session
    const sessionId = uuid.v4();

    // Create a new session
    const sessionClient = new dialogflow.SessionsClient();
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);

    // The text query request.
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                // The query to send to the dialogflow agent
                text: content,
                // The language used by the client (en-US)
                languageCode: 'en-US',
            },
        },
    };

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    console.log('Detected intent');
    const result = responses[0].queryResult;
    console.log("!!!!!!!!!!! " + JSON.stringify(result))
    // Save Intent

    let intentDetails;
    if (result.fulfillmentMessages[0].platform == "PLATFORM_UNSPECIFIED") {
        intentDetails = {
            intentName: result.intent.displayName,
            entities: "",
            createdAt: Date.now(),
            response: result.fulfillmentText
        }
        helper.responseHandler(webSocket, channelId, result.fulfillmentText)
    }
    else {
        intentDetails = {
            intentName: result.intent.displayName,
            entities: "",
            createdAt: Date.now(),
            response: result.fulfillmentMessages[0]
        }
        helper.responseHandler(webSocket, channelId, result.fulfillmentMessages[0])

    }
    await nlpResponse.saveNLPResponse(intentDetails)

    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
    } else {
        console.log(`  No intent matched.`);
    }
}catch(err){
    console.log("ERRRRRRRRRRR ", err)
}
}

module.exports = { controller };
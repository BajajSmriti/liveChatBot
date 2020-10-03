
const WebSocket = require("ws"); // https://github.com/websockets/ws
const request = require("superagent"); // https://github.com/visionmedia/superagent
const ACCESS_TOKEN = "dtdM8FoAuWQ8ZkwwDZfhPmCRCVhjhDJHUyYYEmE9U6QSBfMB00LY0CgzZJVJcuIv";
const express = require('express');
const app = express();
const port = 3000;
const visitorDBHandler = require("./handler/visitorDBHandler");
require('./utils/dotenv');
const adapterConfig = require("./config/default");
const db = require('converse-db-client');
db.dbConnect(adapterConfig.mongo);
const dialogflow = require("./handler/dialogFlow");

app.get('/healthCheck', (req, res) => {
  res.send(200)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

const CHAT_API_URL = "https://chat-api.zopim.com/graphql/request";
const REQUEST_ID = {
  MESSAGE_SUBSCRIPTION: 1,
  UPDATE_AGENT_STATUS: 2,
  SEND_MESSAGE: 3,
  GET_DEPARTMENTS: 4,
  TRANSFER_TO_DEPARTMENT: 5,
  SEND_QUICK_REPLIES: 6,
  SEND_CAROUSEL: 7
};
const SUBSCRIPTION_DATA_SIGNAL = "DATA";
const TYPE = {
  VISITOR: "Visitor"
};

const channelsToBeTransferred = [];
let messageSubscriptionId;

async function generateNewAgentSession(access_token) {
  const query = `mutation($access_token: String!) {
        startAgentSession(access_token: $access_token) {
            websocket_url
            session_id
            client_id
        }
    }`;
  const variables = { access_token };

  console.log("[startAgentSession] Request sent");

  return await request
    .post(CHAT_API_URL)
    .set({
      "Content-Type": "application/json"
    })
    .send({ query, variables });
}

async function startAgentSession() {
  try {
    const startAgentSessionResp = (await generateNewAgentSession(ACCESS_TOKEN))
      .body;

    if (
      startAgentSessionResp.errors &&
      startAgentSessionResp.errors.length > 0
    ) {
      console.log("[startAgentSession] Invalid access token");
    } else {
      console.log(
        "[passwordStartAgentSession] Successfully start agent session"
      );

      const { websocket_url } = startAgentSessionResp.data.startAgentSession;

      connectWebSocket(websocket_url);
    }
  } catch (err) {
    console.log("[startAgentSession] Request fail");
    console.log(err.response.error.text);
  }
}

function connectWebSocket(websocket_url) {
  let webSocket = new WebSocket(websocket_url);
  let pingInterval;

  function cleanup() {
    detachEventListeners(webSocket);
    clearInterval(pingInterval);
  }

  function handleOpen() {
    console.log(`[WebSocket] Successfully connected to ${websocket_url}`);

    /*************************************************
     * Periodic ping to prevent WebSocket connection *
     * time out due to idle connection               *
     *************************************************/
    pingInterval = setInterval(() => {
      webSocket.send(
        JSON.stringify({
          sig: "PING",
          payload: +new Date()
        })
      );
    }, 5000);

    /***********************
     * Update agent status *
     ***********************/
    const updateAgentStatusQuery = {
      payload: {
        query: `mutation {
                    updateAgentStatus(status: ONLINE) {
                        node {
                            id
                        }
                    }
                }`
      },
      type: "request",
      id: REQUEST_ID.UPDATE_AGENT_STATUS
    };
    webSocket.send(JSON.stringify(updateAgentStatusQuery));
    console.log("[updateAgentStatus] Request sent");

    /************************
     * Message subscription *
     ************************/
    const messageSubscriptionQuery = {
      payload: {
        query: `subscription {
                    message {
                        node {
                            id
                            content
                            channel {
                                id
                            }
                            from {
                                __typename
                                display_name
                            }
                        }
                    }
                }`
      },
      type: "request",
      id: REQUEST_ID.MESSAGE_SUBSCRIPTION
    };
    webSocket.send(JSON.stringify(messageSubscriptionQuery));
    console.log("[message] Subscription request sent");
  }

  function handleClose() {
    console.log("[WebSocket] Connection closed abnormally. Reconnecting.");
    cleanup();
    connectWebSocket(websocket_url);
  }

  async function handleMessage(message) {
    const data = JSON.parse(message);

    if (data.sig === "EOS") {
      console.log("[data] Received EOS signal. Starting a new agent session.");
      cleanup();
      startAgentSession();
    }

    // Listen to successful message subscription request
    if (data.id === REQUEST_ID.MESSAGE_SUBSCRIPTION) {
      if (data.payload.errors && data.payload.errors.length > 0) {
        console.log("[message] Failed to subscribe to message");
      } else {
        messageSubscriptionId = data.payload.data.subscription_id;
        console.log("[message] Successfully subscribe to message");
      }
    }

    // Listen to successful update agent status request
    if (data.id === REQUEST_ID.UPDATE_AGENT_STATUS) {
      if (data.payload.errors && data.payload.errors.length > 0) {
        console.log("[updateAgentStatus] Failed to update agent status");
      } else {
        console.log("[updateAgentStatus] Successfully update agent status");
      }
    }

    if (data.id === REQUEST_ID.SEND_MESSAGE) {
      if (data.payload.errors && data.payload.errors.length > 0) {
        console.log("[sendMessage] Failed to send message to visitor");
      } else {
        console.log("[sendMessage] Successfully to send message to visitor");
      }
    }

    if (data.id === REQUEST_ID.SEND_CAROUSEL) {
      if (data.payload.errors && data.payload.errors.length > 0) {
        console.log("[sendMessage] Failed to send carousel to visitor","\n",JSON.stringify(data.payload));
      } else {
        console.log("[sendMessage] Successfully to send carousel to visitor");
      }
    }

    if (data.id === REQUEST_ID.SEND_QUICK_REPLIES) {
      if (data.payload.errors && data.payload.errors.length > 0) {
        console.log("[sendQuickReplies] Failed to send message to visitor");
      } else {
        console.log(
          "[sendQuickReplies] Successfully to send message to visitor"
        );
      }
    }

    // Listen to chat messages from the visitor
    if (
      data.sig === SUBSCRIPTION_DATA_SIGNAL &&
      data.subscription_id === messageSubscriptionId &&
      data.payload.data
    ) {
      const chatMessage = data.payload.data.message.node;
      const sender = chatMessage.from;

      if (sender.__typename === TYPE.VISITOR) {
        console.log(
          `[message] Received: '${chatMessage.content}' from: '${
          sender.display_name
          }'`
        );

        if (chatMessage.content.toLowerCase().includes("transfer")) {
          channelsToBeTransferred.push(chatMessage.channel.id);

          /*****************************************************************
           * Get current departments information for transferring the chat *
           *****************************************************************/
          const getDepartmentsQuery = {
            payload: {
              query: `query {
                                departments {
                                    edges {
                                        node {
                                            id
                                            name
                                            status
                                        }
                                    }
                                }
                            }`
            },
            type: "request",
            id: REQUEST_ID.GET_DEPARTMENTS
          };

          webSocket.send(JSON.stringify(getDepartmentsQuery));
        } else {
          /*************************
           * Reply back to visitor *
           *************************/
          //READ operation
          let visitorDetails = await visitorDBHandler.getVisitorChannelId(chatMessage.channel.id)

          //UPDATE lastupdatets and response

          if (visitorDetails && visitorDetails != 500) {
            //DELETE visitor's data after every 1 year (1 day here)- lastup
            let upTime = new Date(visitorDetails.startTimestamp.setTime(visitorDetails.startTimestamp.getTime() + (24 * 60 * 60 * 1000)))
            console.log("Expected Time: ", upTime)
            console.log("Current Time: ", new Date())
            console.log("comparison: ", upTime <= new Date())
            //if more than 1 day, delete the vistor history
            if (upTime <= new Date()) {
              let deletedDetails = await visitorDBHandler.deleteVisitor(visitorDetails.visitorId)
              if (deletedDetails) {
                console.log("Deleted Visitor data ", visitorDetails.visitorId)
              }
            }
          }
          let newVisitorDetails = {
            "visitorId": sender.display_name,
            "channelId": chatMessage.channel.id,
            "chatMessage": chatMessage,
            "response": {},
            "startTimestamp": Date.now()
          }
          //CREATE operation
          let saveVisitor = await visitorDBHandler.saveVisitor(newVisitorDetails)
          if (saveVisitor) {
            console.log("Visitor details saved successfully")
            // Sending the user input to dialogflow controller
            await dialogflow.controller(webSocket, saveVisitor.channelId,chatMessage.content);
          }
        }
      }
    }
  }

  function attachEventListeners(ws) {
    ws.addListener("open", handleOpen);
    ws.addListener("close", handleClose);
    ws.addListener("message", handleMessage);
  }

  function detachEventListeners(ws) {
    ws.removeListener("open", handleOpen);
    ws.removeListener("close", handleClose);
    ws.removeListener("message", handleMessage);
  }

  attachEventListeners(webSocket);
}

startAgentSession();

// keep the script running
process.stdin.resume();

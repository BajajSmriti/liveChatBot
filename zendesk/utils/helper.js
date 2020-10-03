const REQUEST_ID = {
    SEND_MESSAGE: 3,
    SEND_CAROUSEL: 7
  };
  
  
  function responseHandler(webSocket, channelId, msg){

    if(typeof(msg)!="string"){
        let result = msg.carouselSelect.items

        console.log("ppppppppppp", `${result[0].title}`,`${result[0].image.accessibilityText}`)

        const panelTemplate={
            payload:{
                query: `mutation {
                          sendPanelTemplateCarousel(
                              channel_id:"${channelId}",
                              fallback:{
                                msg:"${result[0].title}",
                                options: ["${result[0].title}"]
                              },
                              items:[
                                {
                                    panel: {
                                      heading: "${result[0].title}",
                                      paragraph: "${result[0].image.accessibilityText}",
                                      image_url: "${result[0].image.imageUri}",
                                      action: {
                                        value: "${result[0].image.imageUri}"
                                      }
                                    },
                                    buttons: [
                                      {
                                        action: {
                                          type: QUICK_REPLY_ACTION,
                                          value: "${result[0].title}"
                                        },
                                        text: "${result[0].title}"
                                      }
                                    ]
                                },
                                {
                                    panel: {
                                      heading: "${result[1].title}",
                                      paragraph: "${result[1].image.accessibilityText}",
                                      image_url: "${result[1].image.imageUri}",
                                      action: {
                                        value: "${result[1].image.imageUri}"
                                      }
                                    },
                                    buttons: [
                                      {
                                        action: {
                                          type: QUICK_REPLY_ACTION,
                                          value: "${result[1].title}"
                                        },
                                        text: "${result[1].title}"
                                      }
                                    ]
                                }
                              ]
                          ){
                            success
                           }
                           
                        }`
            },
            type: "request",
            id: REQUEST_ID.SEND_CAROUSEL
        }
        
        webSocket.send(JSON.stringify(panelTemplate));


    }else{
        /*************************
         * Simple response *
         *************************/

        const sendMessageQuery = {
            payload: {
                query: `mutation {
                            sendMessage(
                                channel_id: "${channelId}",
                                msg: "${msg}"
                            ) {
                                success
                              }
                          }`
            },
            type: "request",
            id: REQUEST_ID.SEND_MESSAGE
        };

        webSocket.send(JSON.stringify(sendMessageQuery));
    }

}

module.exports={responseHandler}
module.exports =
{
  "app": {
    "adapter": {
      "endpoint": process.env.ENDPOINT,
      "name": process.env.NAME,
      "port": process.env.PORT,
      "port_socket": process.env.PORT_SOCKET
    },
    "zendesk":{
      "accessToken" : process.env.ACCESS_TOKEN,
      "chatApiUrl" : process.env.CHAT_API_URL
    }
  },
  "mongo": {
    "host": process.env.MONGO_HOST,
    "port": process.env.MONGO_PORT,
    "dbName": process.env.DB_NAME,
    "timeout": process.env.TIMEOUT,
  "username": process.env.USER_NAME,
  "password": process.env.PASSWORD
  }
}

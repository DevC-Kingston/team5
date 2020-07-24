const axios = require("axios");

exports.sendQuickreply = (recipientId, message) => {
  try {
    axios.post(
      "https://graph.facebook.com/v7.0/me/messages",
      {
        recipient: { id: recipientId },
        messaging_type: "RESPONSE",
        message: message,
      },
      {
        params: { access_token: process.env.ACCESS_TOKEN },
      },
      (err) => {
        if (err) {
          console.log("Error sending message: ", err);
        }
      }
    );
  } catch (error) {
    console.log("#####  ERROR SENDING MESSAGE  #####");
    console.log(error.response.status);
  }

  return;
};

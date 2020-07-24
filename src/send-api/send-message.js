const axios = require("axios");

// generic function sending messages
exports.sendMessage = async (recipientId, message) => {
  await axios.post(
    "https://graph.facebook.com/v7.0/me/messages",
    {
      recipient: { id: recipientId },
      message: message,
    },
    {
      params: { access_token: process.env.ACCESS_TOKEN },
    }
  );

  return;
};

// // generic function sending messages
// exports.sendMessage = (recipientId, message) => {
//   try {
//     axios.post(
//       "https://graph.facebook.com/v7.0/me/messages",
//       {
//         recipient: { id: recipientId },
//         message: message,
//       },
//       {
//         params: { access_token: process.env.ACCESS_TOKEN },
//       },
//       (err) => {
//         if (err) {
//           console.log("Error sending message: ", err);
//         }
//       }
//     );
//   } catch (error) {
//     console.log("#####  ERROR SENDING MESSAGE  #####");
//     console.log(error.response.status);
//   }

//   return;
// };

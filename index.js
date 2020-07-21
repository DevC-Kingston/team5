const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { get_started, item_search } = require("./src/templates/postbacks");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("webhook is listening"));

app.get("/", (req, res) => {
  res.send("Hi I am a chatbot!!");
});

// Adds support for GET requests to our webhook
app.get("/webhook", (req, res) => {
  // Your verify token. Should be a random string.
  let { VERIFY_TOKEN } = process.env;

  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// Creates the endpoint for our webhook
app.post("/webhook", (req, res) => {
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === "page") {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // Gets the message. entry.messaging is an array, but
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      // console.log(webhook_event);

      if (webhook_event.message && webhook_event.message.text) {
        handleMessageEvent(webhook_event);
      } else if (webhook_event.postback) {
        handlePostbackEvent(webhook_event);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

let itemPostbackFlag;
let message;

const handlePostbackEvent = async (event) => {
  const { first_name } = await getUserPersonalInfo(event.sender.id);
  
  switch (event.postback.payload) {

    case "get_started":
      itemPostbackFlag = false
      message = get_started(first_name);
      sendMessage(event.sender.id, message);
      console.log("-----------> GET STARTED event");
      break;

    case "item_search":
      itemPostbackFlag = true;
      message = item_search(); //cant declare variable twice cause variable is 'case' scoped
      sendMessage(event.sender.id, message);
      console.log("-----------> Item search postback event");
      break;

    case "food_search":
      message = {text: "Please enter the name of the food or ingredient you are searching for"};
      sendMessage(event.sender.id, message);
      break;
    
    case "machine_search":
      message = {text: "Please enter the name of the appliance or machinery you are searching for"};
      sendMessage(event.sender.id, message);
      break;
    
    case "fashion_search":
      message = {text: "Please enter the name of the clothing item you are searching for"};
      sendMessage(event.sender.id, message);
      //maybe accept a picture for this and search similar options?
      break;

    default:
      console.log("---------> Postback Event");
    /**@todo do something here */
  }
};

const handleMessageEvent = (event) => { 
  console.log("Message received Event");
  console.log(event);
};

async function getUserPersonalInfo(recipientId) {
  const response = await axios.get(
    `https://graph.facebook.com/${recipientId}?fields=first_name,last_name&access_token=${process.env.ACCESS_TOKEN}`
  );
  const {first_name, last_name} = response.data;
  return {first_name, last_name};
}

// generic function sending messages
function sendMessage(recipientId, message) {
  console.log(`----------> ID: ${recipientId}`);
  try{
    axios.post(
      "https://graph.facebook.com/v7.0/me/messages",
      {
        recipient: { id: recipientId },
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
}

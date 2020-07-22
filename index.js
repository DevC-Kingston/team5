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

let converstionStates = [
  "getting_started",
  "item_search",
  "food_search",
  "machine_search",
  "fashion_search",
];
let message;
// Creates the endpoint for our webhook
app.post("/webhook", (req, res) => {
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === "page") {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(async (entry) => {
      // Gets the message.entry.messaging is an array, but will only contain one message, hence index 0
      let webhook_event = entry.messaging[0];

      //user need to be stored in the database so we can track the conversational state

      if (webhook_event.postback) {
        payload = await handlePostbackEvent(webhook_event);
      }

      if (webhook_event.message && webhook_event.message.text) {
        handleMessageEvent(webhook_event, payload);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

const handlePostbackEvent = async (event) => {
  const { first_name } = await getUserPersonalInfo(event.sender.id);
  let payload = event.postback.payload;

  switch (payload) {
    case "get_started":
      currentState = payload;
      message = get_started(first_name);
      sendMessage(event.sender.id, message);
      console.log("-----------> GET STARTED event");
      break;

    case "item_search":
      currentState = payload;
      message = item_search(); //cant declare variable twice cause variable is 'case' scoped
      sendMessage(event.sender.id, message);
      console.log("Item search postback event");
      break;

    case "food_search":
      currentState = payload;
      message = {
        text:
          "Please enter the name of the food or ingredient you are searching for",
      };
      sendMessage(event.sender.id, message);
      break;

    case "machine_search":
      currentState = payload;
      message = {
        text:
          "Please enter the name of the appliance or machinery you are searching for",
      };
      sendMessage(event.sender.id, message);
      break;

    case "fashion_search":
      currentState = payload;
      message = {
        text:
          "Please enter the name of the clothing item you are searching for",
      };
      sendMessage(event.sender.id, message);
      //maybe accept a picture for this and search similar options?
      break;

    default:
      console.log("---------> Postback Event");
    /**@todo do something here */
  }
  return payload;
};

const handleMessageEvent = async (event, payload) => {
  console.log("Message received Event");
  const userID = event.sender.id;
  // searchAppliance(event.message.text,event);
  // searchClothes(event.message.text,event);
  // searchFood(event.message.text,event);

  const { first_name } = await getUserPersonalInfo(event.sender.id);
  const greeting = firstTrait(event.message.nlp, "wit$greetings");
  const thanks = firstTrait(event.message.nlp, "wit$thanks");
  const bye = firstTrait(event.message.nlp, "wit$bye");
  let item = event.message.text; //user message containing item ordered

  if (greeting && greeting.confidence) {
    currentState = payload;
    message = get_started(first_name);
    sendMessage(event.sender.id, message);
    return payload;
  } else {
    //send default message
  }

  //fetch userid from database based on userID
  //read the users currentState
  //switch statement with current state

  switch (payload) {
    case "food_search":
      currentState = "database";
      message = { text: "Checking our Food section" }; // actually check database here
      sendMessage(event.sender.id, message);
      break;

    case "machine_search":
      currentState = "database";
      message = { text: "Checking our appliances section" }; // actually check database here
      sendMessage(event.sender.id, message);
      break;

    case "fashion_search":
      currentState = "database";
      message = { text: "Checking our clothes section" }; // actually check database here
      sendMessage(event.sender.id, message);
      break;
    
    default:
      message = { text: `Your message was ${item}`}; // actually check database here
      sendMessage(event.sender.id, message);
  }

  return;
};

async function getUserPersonalInfo(recipientId) {
  const response = await axios.get(
    `https://graph.facebook.com/${recipientId}?fields=first_name,last_name&access_token=${process.env.ACCESS_TOKEN}`
  );
  const { first_name, last_name } = response.data;
  return { first_name, last_name };
}

// generic function sending messages
function sendMessage(recipientId, message) {
  console.log(`----------> ID: ${recipientId}`);
  try {
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

  return;
}

//Functions for searching the database.
// This one searches appliances
function searchAppliance(itemname, event) {
  console.log(`----------> Item to search for :${itemname}`);
  axios({
    method: "POST",
    url: "https://us-central1-luk-fi-it-chatbot.cloudfunctions.net/lukfiit",
    headers: {},
    data: {
      actionn: "checkitemappliance",
      item: itemname,
    },
  })
    .then((res) => {
      //Here is where you'd send the result (res) as a message to the user. The result is already in the appropriate format
      //ie. the result is in this format:
      //res {
      //messages: [ {text: 'Nutribullet 12 PC🔌 \n' +'\n' +  '📌 You can find it at this location:123 Constant Spring Rd\n' +  '\n' +  ' 💵 Cost:10,500 JMD'  } ]
      //}
      console.log("res", res.data);
      sendMessage(event.sender.id, res.data);
    })
    .catch((err) => {
      console.log("error in request", err);
    });
  return;
}

// This one searches food
function searchFood(itemname, event) {
  console.log(`----------> Item to search for :${itemname}`);
  axios({
    method: "POST",
    url: "https://us-central1-luk-fi-it-chatbot.cloudfunctions.net/lukfiit",
    headers: {},
    data: {
      actionn: "checkitemfood",
      item: itemname,
    },
  })
    .then((res) => {
      //Here is where you'd send the result (res) as a message to the user. The result is already in the appropriate format
      console.log("res", res.data);
      sendMessage(event.sender.id, res.data);
    })
    .catch((err) => {
      console.log("error in request", err);
    });
  return;
}

// This one searches clothes.
function searchClothes(itemname, event) {
  console.log(`----------> Item to search for :${itemname}`);
  axios({
    method: "POST",
    url: "https://us-central1-luk-fi-it-chatbot.cloudfunctions.net/lukfiit",
    headers: {},
    data: {
      actionn: "checkitemclothes",
      item: itemname,
    },
  })
    .then((res) => {
      //Here is where you'd send the result (res) as a message to the user. The result is already in the appropriate format
      console.log("res", res.data);
      sendMessage(event.sender.id, res.data);
    })
    .catch((err) => {
      console.log("error in request", err);
    });
  return;
}

//NLP
function firstTrait(nlp, name) {
  return nlp && nlp.entities && nlp.traits[name] && nlp.traits[name][0];
}
``;

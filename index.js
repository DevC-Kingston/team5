const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { get_started } = require("./src/templates/postbacks");

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
  "food_search",
  "machine_search",
  "fashion_search",
];
let message;
// Creates the endpoint for our webhook
app.post("/webhook", (req, res) => {
  let body = req.body;
  let payload;
  // Checks this is an event from a page subscription
  if (body.object === "page") {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(async function (entry) {
      res.status(200).send("EVENT_RECEIVED");

      // Gets the message.entry.messaging is an array, but will only contain one message, hence index 0
      let webhook_event = entry.messaging[0];

      await searchids(webhook_event.sender.id);

      if (webhook_event.postback) {
        handlePostbackEvent(webhook_event);
      }

      if (webhook_event.message && webhook_event.message.text) {
        handleMessageEvent(webhook_event);
      }
    });

    // Returns a '200 OK' response to all requests
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

const handlePostbackEvent = async (event) => {
  let userID = event.sender.id;
  let payload = event.postback.payload;
  const { first_name } = await getUserPersonalInfo(userID);

  switch (payload) {
    case "get_started":
      addID(userID, payload);
      message = get_started(first_name);
      sendMessage(userID, message);
      console.log("GET STARTED EVENT");
      break;

    case "food_search":
      console.log("<--- Search food POSTBACK case --->");
      addID(userID, payload);
      message = {
        text:
          "Please enter the name of the food or ingredient you are searching for",
      };
      sendMessage(userID, message);
      break;

    case "machine_search":
      console.log("<--- machine Search food POSTBACK case --->");

      addID(userID, payload);
      message = {
        text:
          "Please enter the name of the appliance or machinery you are searching for",
      };
      sendMessage(userID, message);
      break;

    case "fashion_search":
      console.log("<--- fashion_search POSTBACK case --->");
      addID(userID, payload);
      message = {
        text:
          "Please enter the name of the clothing item you are searching for",
      };
      sendMessage(userID, message);
      //maybe accept a picture for this and search similar options?
      break;

    default:
      console.log("---------> Postback Event");
    /**@todo do something here */
  }
  return;
};

const handleMessageEvent = async (event) => {
  console.log("Message received Event");

  // searchAppliance(event.message.text,event);
  // searchClothes(event.message.text,event);
  // searchFood(event.message.text,event);
  let userID = event.sender.id;
  const { first_name } = await getUserPersonalInfo(userID);
  const greeting = firstTrait(event.message.nlp, "wit$greetings");
  // const thanks = firstTrait(event.message.nlp, "wit$thanks");
  // const bye = firstTrait(event.message.nlp, "wit$bye");
  let itemName = event.message.text; //user message containing item ordered

  console.log("EVENT --> ", event.message.nlp);

  if (greeting && greeting.confidence) {
    addID(userID, "get_started");
    message = get_started(first_name);
    return sendMessage(userID, message);
  }
  console.log("-------------------------------------------------");
  let payload = await searchids(userID);
  console.log("payload", payload);
  console.log("-------------------------------------------------");

  // console.log(`FROM HANDLE MESSAGE -> ${payload}`);

  switch (payload) {
    case "food_search":
      console.log("<--- Search food in Handle message case --->");
      addID(userID, "database_food");
      const { resMessage, success } = await searchFood(itemName);
      console.log("SUCCESS ---> ", success);
      if (success) {
        sendMessage(userID, resMessage);
      }
      //consider handling quick reply in search function
      //sendQuickreply(userID, message);
      break;

    case "machine_search":
      console.log("<--- machine_search in Handle message case --->");
      addID(userID, "database_machine");
      const { resMessage, success } = await searchAppliance(itemName);
      console.log("SUCCESS ---> ", success);
      if (success){
        sendMessage(userID, resMessage);
      }
      //sendQuickreply(userID, message);
      break;

    case "fashion_search":
      console.log("<--- fashion_search in Handle message case --->");
      addID(userID, "database_fashion");
      const { resMessage, success } = await searchClothes(itemName);
      console.log("SUCCESS ---> ", success);
      if (success) {
        sendMessage(userID, resMessage);
      }
      //sendQuickreply(recipientId);
      break;

    default:
      addID(userID, "get_started");
      sendMessage(userID, { text: "I couldn't understand your request" });
      message = get_started(first_name);
      return sendMessage(userID, message);
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

function sendQuickreply(recipientId) {
  try {
    axios.post(
      "https://graph.facebook.com/v7.0/me/messages",
      {
        recipient: { id: recipientId },
        messaging_type: "RESPONSE",
        message: {
          text: "Please Select one of the following:",
          quick_replies: [
            {
              content_type: "text",
              title: "🚚 Delivery",
              payload: "delivery",
            },
            {
              content_type: "text",
              title: "🛍️ Pick-up",
              payload: "pickup",
            },
          ],
        },
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
async function searchAppliance(itemname) {
  let resMessage = null;
  let success = false;
  console.log(`----------> Item to search for :${itemname}`);
  const req = await axios({
    method: "POST",
    url: "https://us-central1-luk-fi-it-chatbot.cloudfunctions.net/lukfiit",
    headers: {},
    data: {
      actionn: "checkitemappliance",
      item: itemname,
    },
  });
  const res = await req;
  resMessage = res.data.messages[0];
  success = res.data.success;

  return { resMessage, success };
  //   .then((res) => {
  //     //Here is where you'd send the result (res) as a message to the user. The result is already in the appropriate format
  //     //ie. the result is in this format:
  //     //res {
  //     //messages: [ {text: 'Nutribullet 12 PC🔌 \n' +'\n' +  '📌 You can find it at this location:123 Constant Spring Rd\n' +  '\n' +  ' 💵 Cost:10,500 JMD'  } ]
  //     //}
  //     console.log("res", res.data);
  //     sendMessage(event.sender.id, res.data);
  //   })
  //   .catch((err) => {
  //     console.log("error in request", err);
  //   });
  // return;
}

// This one searches food
async function searchFood(itemname) {
  let resMessage = null;
  let success = false;
  console.log(`----------> Item to search for :${itemname}`);
  const req = await axios({
    method: "POST",
    url: "https://us-central1-luk-fi-it-chatbot.cloudfunctions.net/lukfiit",
    headers: {},
    data: {
      actionn: "checkitemfood",
      item: itemname,
    },
  });
  const res = await req;
  resMessage = res.data.messages[0];
  success = res.data.success;

  return { resMessage, success };
  //     .then((res) => {
  //       resMessage = res.data.messages[0];
  //       success = res.data.success;
  //       return { resMessage, success };
  //     })
  //     .catch((err) => {
  //       console.log("error in searchFood function -->", err);
  //       return { resMessage, success };
  //     });
  //   return { resMessage, success };
}

// This one searches clothes.
async function searchClothes(itemname) {
  let resMessage = null;
  let success = false;
  console.log(`----------> Item to search for :${itemname}`);
  const req = await axios({
    method: "POST",
    url: "https://us-central1-luk-fi-it-chatbot.cloudfunctions.net/lukfiit",
    headers: {},
    data: {
      actionn: "checkitemclothes",
      item: itemname,
    },
  });
  const res = await req;
  resMessage = res.data.messages[0];
  success = res.data.success;

  return { resMessage, success };
  //   .then((res) => {
  //     //Here is where you'd send the result (res) as a message to the user. The result is already in the appropriate format
  //     console.log("res", res.data);
  //     sendMessage(event.sender.id, res.data);
  //   })
  //   .catch((err) => {
  //     console.log("error in request", err);
  //   });
  // return;
}

//Seach for ids and return the current state
async function searchids(uid) {
  console.log(`----------> ID to search for :${uid}`);
  const res = await axios({
    method: "POST",
    url: "https://us-central1-luk-fi-it-chatbot.cloudfunctions.net/lukfiit",
    headers: {},
    data: {
      actionn: "searchIDs",
      uid: uid.toString(),
    },
  });
  const data = await res.data;

  return data;
  //   .then((res) => {
  //     console.log("THIS IS THE SEARCH ID FUNCTION:");
  //     if (res.data == "User ID not found") {
  //       console.log(`NOT FOUND -> ${res.data}`);
  //       return addID(uid, "get_started");
  //     } else {
  //       console.log(`FOUND -> ${res.data}`);
  //       return res.data;
  //     }
  //   })
  //   .catch((err) => {
  //     console.log("error in request -->", err.headers);
  //   });

  // return;
}

//Add or update an id with the current state
function addID(uid, cs) {
  console.log(`----------> ID to add :${uid}`);
  axios({
    method: "POST",
    url: "https://us-central1-luk-fi-it-chatbot.cloudfunctions.net/lukfiit",
    headers: {},
    data: {
      actionn: "addIDs",
      uid: uid.toString(),
      currentS: cs,
    },
  })
    .then((res) => {
      console.log("UPDATES STATE --->", res.data);
      return { uid, success: true };
    })
    .catch((err) => {
      console.log("error in request", err);
      return { uid: null, success: false };
    });
  return;
}

//NLP
function firstTrait(nlp, name) {
  return nlp && nlp.entities && nlp.traits[name] && nlp.traits[name][0];
}

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { get_started } = require("./src/templates/postbacks");
const { deliveryReply, locationReply } = require("./src/templates/quickReply");
const { sendQuickreply } = require("./src/send-api/quick-reply");
const { sendMessage } = require("./src/send-api/send-message");

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

let message;
// Creates the endpoint for our webhook
app.post("/webhook", (req, res) => {
  let body = req.body;
  // Checks this is an event from a page subscription
  if (body.object === "page") {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(async function (entry) {
      res.status(200).send("EVENT_RECEIVED");

      // Gets the message.entry.messaging is an array, but will only contain one message, hence index 0
      let webhook_event = entry.messaging[0];
      let sender_psid = webhook_event.sender.id;

      await searchids(sender_psid);

      if (webhook_event.message) {
        handleMessageEvent(webhook_event.message, sender_psid);
      }

      // if (webhook_event.message && webhook_event.message.quick_reply) {
      //   handleQuickReply(webhook_event);
      // }

      if (webhook_event.postback) {
        handlePostbackEvent(webhook_event);
      }
    });

    // Returns a '200 OK' response to all requests
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

const handleQuickReply = async (event) => {
  console.log("EVENT QUICK REPLY", event);
  let userId = event.sender.id;
  let payload = event.message.quick_reply.payload;
  const { first_name } = await getUserPersonalInfo(userId);

  switch (payload) {
    case "delivery":
      addID(userId, payload);
      let location = await locationReply();
      sendQuickreply(userId, location);
      break;

    case "pickup":
      addID(userId, payload);
      sendMessage(userId, { text: "location of item should go here" });
      break;

    default:
      console.log("---------> Postback Event");
    /**@todo do something here */
  }
  return;
};

const handlePostbackEvent = async (event) => {
  let userId = event.sender.id;
  let payload = event.postback.payload;
  const { first_name } = await getUserPersonalInfo(userId);

  switch (payload) {
    case "get_started":
      addID(userId, payload);
      message = get_started(first_name);
      sendMessage(userId, message);
      console.log("GET STARTED EVENT");
      break;

    case "food_search":
      addID(userId, payload);
      message = {
        text:
          "Please enter the name of the food or ingredient you are searching for",
      };
      sendMessage(userId, message);
      break;

    case "machine_search":
      addID(userId, payload);
      message = {
        text:
          "Please enter the name of the appliance or machinery you are searching for",
      };
      sendMessage(userId, message);
      break;

    case "fashion_search":
      addID(userId, payload);
      message = {
        text:
          "Please enter the name of the clothing item you are searching for",
      };
      sendMessage(userId, message);
      //maybe accept a picture for this and search similar options?
      break;

    default:
      console.log("---------> Postback Event");
    /**@todo do something here */
  }
  return;
};

const handleMessageEvent = async (messageEvent, userId) => {
  console.log("Message received Event");
  const { first_name } = await getUserPersonalInfo(userId);

  const greeting = firstTrait(messageEvent.nlp, "wit$greetings");

  if (greeting && greeting.confidence) {
    addID(userId, "get_started");
    message = get_started(first_name);
    return sendMessage(userId, message);
  }

  let payload = await searchids(userId);

  /**Handle all text event here */
  if (messageEvent.text) {
    let itemName = messageEvent.text;

    switch (payload) {
      case "food_search":
        console.log("<--- Search food in Handle message case --->");
        addID(userId, "database_food");
        const { food, success: foodSuccess } = await searchFood(itemName);
        console.log("foodSuccess TYPE---> ", typeof foodSuccess);
        console.log("foodSuccess ---> ", foodSuccess);
        if (foodSuccess) {
          return sendMessage(userId, {
            text: `${itemName} was found for ${food.cost}`,
          }).then(() => {
            let deliveryMessage = deliveryReply();
            return sendQuickreply(userId, deliveryMessage);
          });
        } else {
          return sendMessage(userId, {
            text: `${itemName} was not found`,
          });
        }
        break;

      case "machine_search":
        console.log("<--- machine_search in Handle message case --->");
        addID(userId, "database_machine");
        const { appliance, success: macSuccess } = await searchAppliance(
          itemName
        );
        console.log("SUCCESS ---> ", macSuccess);
        if (macSuccess) {
          sendMessage(userId, {
            text: `${itemName} was found for ${appliance.cost}`,
          }).then(() => {
            let deliveryMessage = deliveryReply();
            return sendQuickreply(userId, deliveryMessage);
          });
        } else {
          sendMessage(userId, {
            text: `${itemName} was not found`,
          });
        }
        //sendQuickreply(userId, message);
        break;

      case "fashion_search":
        console.log("<--- fashion_search in Handle message case --->");
        addID(userId, "database_fashion");
        const { clothes, success } = await searchClothes(itemName);
        console.log("SUCCESS ---> ", success);
        if (success) {
          sendMessage(userId, {
            text: `${itemName} was found for ${clothes.cost}`,
          }).then(() => {
            let deliveryMessage = deliveryReply();
            return sendQuickreply(userId, deliveryMessage);
          });
        } else {
          sendMessage(userId, {
            text: `${itemName} was not found`,
          });
        }
        //sendQuickreply(recipientId);
        break;

      default:
        payload = await searchids(userId);
        if (!(payload === "delivery" || payload === "pickup")) {
          addID(userId, "get_started");
          sendMessage(userId, { text: "I couldn't understand your request" });
          message = get_started(first_name);
          return sendMessage(userId, message);
        }
    }

    return;
  } else if (messageEvent.quick_reply) {
    /**Handle quick reply */

    return;
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

//Functions for searching the database.
// This one searches appliances
async function searchAppliance(itemname) {
  let appliance = null;
  let success = false;
  console.log(`----------> Item to search for :${itemname}`);
  const req = await axios({
    method: "POST",
    url: "https://us-central1-luk-fi-it-chatbot.cloudfunctions.net/lukfiit",
    headers: {},
    data: {
      actionn: "checkitemappliance",
      item: itemname.toLowerCase(),
    },
  });
  const res = await req;
  appliance = res.data.product;
  success = res.data.success;

  return { appliance, success };
}

// This one searches food
async function searchFood(itemname) {
  let food = null;
  let success = false;
  console.log(`----------> Item to search for :${itemname}`);
  const req = await axios({
    method: "POST",
    url: "https://us-central1-luk-fi-it-chatbot.cloudfunctions.net/lukfiit",
    headers: {},
    data: {
      actionn: "checkitemfood",
      item: itemname.toLowerCase(),
    },
  });
  const res = await req;
  food = res.data.product;
  success = res.data.success;

  return { food, success };
}

// This one searches clothes.
async function searchClothes(itemname) {
  let clothes = null;
  let success = false;
  console.log(`----------> Item to search for :${itemname}`);
  const req = await axios({
    method: "POST",
    url: "https://us-central1-luk-fi-it-chatbot.cloudfunctions.net/lukfiit",
    headers: {},
    data: {
      actionn: "checkitemclothes",
      item: itemname.toLowerCase(),
    },
  });
  const res = await req;
  clothes = res.data.product;
  success = res.data.success;

  return { clothes, success };
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

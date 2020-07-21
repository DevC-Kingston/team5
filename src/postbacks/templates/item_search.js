function item_search(first_name) {
  message = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [
          {
            // title: "Main Menu",
            subtitle: "Ah, searching for an item I see. Choose one of the following",
            buttons: [
              {
                type: "postback",
                title: "Food/Ingredients 🥞🥦",
                payload: "food_search",
              },
              {
                type: "postback",
                title: "Appliances/Machinery 🔌",
                payload: "machine_search",
              },
              {
                type: "Clothes/Fashion 👔👗",
                title: "Looking for an item?",
                payload: "item_search",
              },
            ],
          },
        ],
      },
    },
  };

  return message;
}

module.exports = item_search;

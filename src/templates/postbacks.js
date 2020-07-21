exports.item_search = () => {
  message = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [
          {
            title: "Item Search Menu",
            subtitle:
              "Ah, searching for an item I see. Choose one of the following",
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
                type: "postback",
                title: "Clothes/Fashion 👔👘",
                payload: "fashion_search",
              },
            ],
          },
        ],
      },
    },
  };

  return message;
};

exports.get_started = (first_name) => {
  message = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [
          {
            title: "Main Menu",
            subtitle: `Hello ${first_name}. How may I help you?`,
            buttons: [
              {
                type: "postback",
                title: "Ordering Food",
                payload: "food",
              },
              {
                type: "postback",
                title: "Ordering Groceries",
                payload: "grocery",
              },
              {
                type: "postback",
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
};

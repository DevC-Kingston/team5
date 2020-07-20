function get_started(first_name) {
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
                title: "Speak to an Agent",
                payload: "agent",
              },
            ],
          },
        ],
      },
    },
  };

  return message;
}

module.exports = get_started;

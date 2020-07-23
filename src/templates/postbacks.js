exports.get_started = () => {
  message = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [
          {
            title: `Hi there ${first_name} ! 👋`,
            subtitle: `How may I assist?`,
            // title: "Item Search Menu",
            // subtitle:
            //   "Ah, searching for an item I see. Choose one of the following",
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

// exports.get_started = (first_name) => {
//   message = {
//     attachment: {
//       type: "template",
//       payload: {
//         template_type: "generic",
//         elements: [
//           {
//             title: `Hi there ${first_name} ! 👋`,
//             subtitle: `How may I assist?`,
//             buttons: [
//               {
//                 type: "postback",
//                 title: "I want to Order food",
//                 payload: "food",
//               },
//               {
//                 type: "postback",
//                 title: "I want to get some Groceries",
//                 payload: "grocery",
//               },
//               {
//                 type: "postback",
//                 title: "I'm looking for something?",
//                 payload: "item_search",
//               },
//             ],
//           },
//         ],
//       },
//     },
//   };

//   return message;
// };

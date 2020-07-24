exports.deliveryReply = () => {
  message = {
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
  };
  return message;
};

exports.locationReply = () => {
  message = {
    text: "Please share location:",
    quick_replies: [
      {
        content_type: "location",
      },
    ],
  };

  return message;
};

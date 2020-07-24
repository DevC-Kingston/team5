# Luk fi it

**Team Members**: Kimberly Marsden, Shamar Webster, Jamie James, Sonneil Wellington, Khamali Powell

## Inspiration
Here in Jamaica, you can ask anyone about the manner in which they usually go about finding any product they plan on purchasing and they will tell you the same thing, "I just check the closest store". This isn’t uncommon or unnatural, when considering just how much Jamaicans walk. The tendency to visit “shop around” to find the very product that they are searching for Jamaicans will often wonder about until by chance they find the item. This is especially true in our own Jamaican farmer's market: "Town". 

But in the wake of the current global pandemic, we are forced to face the fact that we don’t have the ability to freely move about, as we previously could; and now we  have to adapt to a brand-new lifestyle. Being aware of the current societal climate, “Luk Fi It” was developed, this bot is our own way of reducing face to face interaction with each other and to reduce the usual head traffic that is associated with it.

## What it does
This Chatbot idea proposed to reduce the number of places that we have to visit in order to locate a product. To solve this, we locate the items of the users by integrating with stores that carry them and then provide the user with the information about the item and the location(s) if they wish to collect the item. We also collect their address so that the item can be delivered if desired.

## List your Chatbot’s features and use cases
1. **Looking for items** - We link people with product from the comfort of home

2. **Display** - We give details on the product and the location of the item if they wish to pickup


## How we built it
Tech Stack & Documentation:

* Chatbot - We created a chatbot for Facebook messenger with node.js and firebase to host the database and integrated Wit.ai to aid with NLP. This was done while utilizing the Facebook GraphAPI to communicate to users on a facebook page.


## Challenges we ran into
1. While linking the google cloud platform to allow the user to parse user uploaded images using the vision API there was an issue with possibly the image compression resulting in the images being too low quality when to be analyzed when tested.

2. Linking the database of choice "firebase" to our chatbot so we could pool the inventory from the different vendors that would be registered with us and run the queries that would pull the item the user is looking for this also resulted in issues with viewing the address.

3. We spent quite a while trying to implement the location quick reply feature, upon extensive testing we realised it was deprecated which forced us to rethink the structure of the conversations in order to complete the conversation naturally.
 
 
## Accomplishments that we're proud of
We are proud of participating in this two week long process where we all managed to stay committed and complete a working project. we all have limited prior experiences and for some, were completely out of their comfort zone. However, despite all these challenges we learned to work together accomodationg each other's weaknesses and schedules to make this happen. We all learned as we went along and combined our respective traits and knowledge to achieve this goal while using some of the most recent and advanced software development tools, services, and frameworks to create a new experience on a platform we all know and love.

## What we learned
* To be patient with each other as each individual has their strengths and can contribute something even if it's not the code as this challenge is about more than that.

* We have learned presentations skills and best practices, how to develop an idea from concept to a business and how to pitch that idea in to convince others of its potential to solve a problem

* We have also learned technical skills like how to handle programming challenges, problem solving, debugging tips, new CLI commands, databasing, NLP with wit.ai, how to read and interpret documentation, github collaboration and many more.



## What's next for “Luk fi it”
Product Roadmap - next features for example
1. Iteration for getting product-market fit
2. Allowing users to use audio input to purchase items through the chatbot
3. Adding an OCR to allow users to take pictures of their shopping lists
4. Improving conversational flow
5. Adding Delivery option by using reverse-geocoding to turn latitude/longitude into human readable addresses


## Built With - provide the tech stack used
* Node.js
* Firebase
* Heroku


## Try it out
https://github.com/DevC-Kingston/team5
https://devc-kingston.github.io/team5/



ction with each other and to reduce the usual head traffic that is associated with it.


## What it does
This Chatbot idea proposed to reduce the number of places that we have to visit in order to locate a product. To solve this, we locate the items of the users by integrating with stores that carry them and then provide the user with the information about the item and the location(s) if they wish to collect the item. We also collect their address so that the item can be delivered if desired.

## List your Chatbot’s features and use cases
1. **Looking for items** - We link people with product from the comfort of home

2. **Display** : We give details on the product and the location of the item if they wish to pickup


## How we built it
Tech Stack & Documentation:
*Chatbot - We created a chatbot for Facebook messenger with node.js and firebase to host the database and integrated Wit.ai to aid with NLP. This was done while utilizing the Facebook GraphAPI to communicate to users on a facebook page.


## Challenges we ran into
1. While linking the google cloud platform to allow the user to parse user uploaded images using the vision API there was an issue with possibly the image compression resulting in the images being too low quality when to be analyzed when tested.

2. Linking the database of choice "firebase" to our chatbot so we could pool the inventory from the different vendors that would be registered with us and run the queries that would pull the item the user is looking for this also resulted in issues with viewing the address.
 
 
## Accomplishments that we're proud of
* We are proud of joining our first project to the boot camp for the first time. We have no experience before and we learned as we went along, we have combined all our individual traits and knowledge areas to come together to develop this using some of the most recent and advanced software development tools, services, and frameworks out there to create a platform with an impact into.



## What we learned
* To be patient with each other as each individual has their strengths and can contribute something even if it's not the code as this challenge is about more than that.

* We have learned presentations skills and best practices, how to develop an idea from concept to a business and how to pitch that idea in to convince others of its potential to solve a problem

* We have learned about the complexity in databasing. We have done research on how to effectively use databases as well as Messenger API to improve or bot's functionality.



## What's next for “Luk fi it”
Product Roadmap - next features for example
1. Iteration for getting product-market fit
2. Allowing users to use audio input to purchase items through the chatbot
3. Adding an OCR to allow users to take pictures of their shopping lists


## Built With - provide the tech stack used
* Node.js
* Firebase
* Heroku


## Try it out
https://github.com/DevC-Kingston/team5
https://devc-kingston.github.io/team5/



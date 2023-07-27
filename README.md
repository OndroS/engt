
## Demo

Link here: https://engt-app-2bca5b002fbb.herokuapp.com/ 

## Install & run

### engt-api
`npm install`

`npm start`

### engt-app
`yarn install`

`yarn start`

## Description

Backend is built in a combination of nodejs, graphql and mongodb. I chose Mongodb because of my experience from previous projects and also because of the limited time to deliver the solution. Therefore I chose for me the well-known path, to limit the risk of not meeting the deadline or necessary requirements.  

Overall, it was my first experience working with GraphQL and naturally, it required a day of testing, learning and basically getting to know each other before our first date. 

Frontend is built by create-react-app. Because of the apparent simplicity of UI requirements (but complexity in logic) and because of limited time, I chose the simplest possible approach. Very simple code structure, only logically-required components, no fancy libraries, UI built with simple bootstrap and simple CSS just to serve the purpose.  

Almost every function and important piece of code is followed by explanatory comments for better orientation and readability of code.

Let me shortly explain the delivered/not-delivered requirements:

1. Implement backend in nodejs etc. - DONE 
2. Implement a database - DONE in mongodb
3. Create list of 5 to 10 questions - DONE
4. User should be able to select an answer etc... - DONE
5. Store the user answers in the DB - DONE - when browsing the code, you'll probably notice the register/login resolvers. My motivation was to implement a user register/login to simulate the real assignment environment of some academy website. Unfortunately, I realized that I don't have enough time to deliver this so I decided to abandon this idea.
6. Calculate and display user results - DONE 
7. Implement appropriate error handling and etc. - DONE - very basic validation using just useState and error handling done simply at resolvers.
8. Utilize docker - DONE PARTIALLY - I've prepared the Docker file and docker-compose only
9. (10,11,12)BONUS - Unfortunately, I was looking forward to utilizing the OpenAI API but due to limited time and dealing with other responsibilities and commitments during the week I wasn't able to even start this :(

In case of any questions, suggestions, or anything, I'll be happy to discuss it directly in a meeting. 

Looking forward to your feedback.
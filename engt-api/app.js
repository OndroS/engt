const express = require('express')
const graphqlHttp = require('express-graphql')
const mongoose = require('mongoose')
const graphqlSchema = require('./graphql/schema')
const graphqlResolvers = require('./graphql/resolvers')
const cors = require('cors');
const verify = require('./utils/verify')


const app = express()

app.use(cors())

// Middleware to verify token and set the user in the context
app.use(async (req, res, next) => {
    try {
      const user = await verify(req); // Implement verifyToken function to extract user from token
      req.context = { user }; // Set the user in the context object
      next();
    } catch (error) {
      req.context = {}; // Clear the user in the context if token verification fails
      next();
    }
  });


app.use('/graphql', graphqlHttp((req) =>({
    schema: graphqlSchema,
    context: req.context,
    rootValue: graphqlResolvers,
    graphiql: true
})))

const uri = `mongodb://localhost:27017/graphqlapi`
const options = { useNewUrlParser: true, useUnifiedTopology: true }

mongoose.connect(uri, options)
    .then(() => app.listen(8080, console.log('Server is running')))
    .catch(error => { throw error })

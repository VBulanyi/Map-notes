require('dotenv').config()
const path = require('path')
const http = require('http')

const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const mongoose = require('mongoose')
const Note = require('./models/Note')

const { findOrCreateUser } = require('./controllers/userController')

const typeDefs = require('./typeDefs')
const resolvers = require('./resolvers')

const app = express()

app.use(express.static('client/build'))

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req, connection }) => {
        let authToken = null
        let currentUser = null
        try {
            if (connection) {
                return { ...connection.context, Note }
            }
            authToken = req.headers.authorization
            if (authToken) {
                currentUser = await findOrCreateUser(authToken)
            }
        } catch (err) {
            console.error(`Unable to authenticate user with token ${authToken}`)
        }
        return { currentUser, Note }
    },
})

server.applyMiddleware({ app })

if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useFindAndModify: false,
    })
    .then(() => console.log('DB connected...'))
    .catch(err => console.error(err))

const PORT = process.env.PORT || 4000

const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

httpServer.listen({ port: PORT }, () => {
    console.log(
        `Server listening on port ${PORT}`,
        server.graphqlPath,
        server.subscriptionsPath
    )
})
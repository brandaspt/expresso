const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const errorHandler = require("errorhandler")
const apiRouter = require("./api/api")

const PORT = process.env.PORT || 4000

const app = express()

// Middlewares
app.use(express.json())
app.use(cors())
app.use(morgan("dev"))

// Routes
app.use("/api", apiRouter)

// Error Handler
app.use(errorHandler())

// Start server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})

module.exports = app

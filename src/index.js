const express = require("express")
const route = require("./route/route")
const mongoose = require("mongoose")
const app = express()

app.use(express.json())
mongoose.set('strictQuery', false)
mongoose.connect("mongodb+srv://gaurav:Grv20072000@cluster0.3fqqw8s.mongodb.net/gaurav")
    .then(() => console.log("Mongodb is connected"))
    .catch(err => console.log(err))

app.use("/", route)

app.listen(3000, function () {
    console.log("Express ap running on port ", +(3000))
})
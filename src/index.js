const express = require("express")
const route = require("./route/route.js")
const mongoose = require("mongoose")
const app = express()

app.use(express.json())

mongoose.connect("mongodb+srv://gaurav:Grv20072000@cluster0.3fqqw8s.mongodb.net/groupXDatabase",
{
    useNewUrlParser:true
})
.then(()=>console.log("Mongodb is connected"))
.catch((err)=>console.log(err))

app.use("/",route)

app.listen(process.env.port||3000,function(){
    console.log("Express ap running on port ",+(process.env.port||3000))
})
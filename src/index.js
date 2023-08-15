const express = require('express');
const bodyParser = require('body-parser');
const userRouter = require('./routes/userRoutes');
//const noteRouter = require('./routes/noteRoutes');
const app= express();

const mongoose = require("mongoose");

app.use(express.json());
app.use(bodyParser.json());


app.use((req,res,next)=>{
    console.log("HTTP Method - "+req.method+", URL -"+req.url);
    next();
})

app.use("/users",userRouter);
//app.use("/note",noteRouter);


mongoose.connect("mongodb+srv://anirudh:anirudh@cluster1.1qj1qet.mongodb.net/").then(()=>{
    app.listen(5000,()=>{
        console.log("Server started on port number:5000");
    }); 
})
.catch((error)=>{
    console.log(error);
})


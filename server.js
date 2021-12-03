const express = require("express");
const app = express();
var morgan = require("morgan");
const AdminRoutes = require("./Routes/restaurant");
require("dotenv").config();
// const DishRoutes = require('./Routes/dishes');
const UserRoutes = require("./Routes/user");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
var cors = require("cors");
const path = require('path')

app.use(morgan("dev"));
app.use(cors());
app.use(bodyparser.json());
app.use(
  bodyparser.urlencoded({
    extended: true,
  })
);
console.log("mongo uri",process.env);
mongoose.connect(
  process.env.MONGO_URI,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  },
  () => {
    console.log("Connected");
  }
);

app.use("/api/restaurant", AdminRoutes);
app.use("/api/user", UserRoutes);

//Serve ststic assets if in production
if(process.env.NODE_ENV === "production"){
  //Set static folder
  app.use(express.static('client/build'))
  app.get('*',(req,res)=>{
    res.sendFile(path.resolve(__dirname, '../client','build','index.html'))
  })
}


const PORT = process.env.PORT || 7000;
app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server Started at port: ${PORT}`);
  }
});

const express = require("express");
var cors = require('cors');
var bodyParser = require('body-parser');
var admin = require("firebase-admin");

var serviceAccount = require("./healthapp-b1891-firebase-adminsdk-p31p2-fa43138c94.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://healthapp-b1891.firebaseio.com"
});

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/hello", (req, res) => {
  console.log("ping");
  // Get a database reference to our posts
  var db = admin.database();
  var ref = db.ref("server/saving-data/healthapp-b1891");

  var usersRef = ref.child("users");
  usersRef.set({
    vishwa1: {
      date_of_birth: "June 23, 1912",
      full_name: "Alan Turing"
    },
    krish1: {
      date_of_birth: "December 9, 1906",
      full_name: "Grace Hopper"
    }
  }, function(error) {
    if (error) {
      console.log("Data could not be saved." + error);
    } else {
      console.log("Data saved successfully.");
    }
  });
  

  res.json({message: "Hello health app Backend!"});
});

app.get('/hi', (req, res) => {

  // Get a database reference to our posts
  var db = admin.database();
  var ref = db.ref("server/saving-data/healthapp-b1891/users");

  // Attach an asynchronous callback to read the data at our posts reference
  ref.on("value", function(snapshot) {
    console.log(snapshot.val());
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });


  res.json({message: "hi"})
})

app.post("/register", (req, res) => {
  const {username, password} = req.body;
  console.log(username, password);
  res.json({username, password})
});

const port = 8080;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

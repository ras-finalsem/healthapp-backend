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

app.post("/register", (req, res) => {
  const {username, password} = req.body;
  console.log(username, password);
  
  const userObj = {
    [username]: {username, password}
  };

  // Get a database reference to our posts
  var db = admin.database();
  var ref = db.ref("server/saving-data/healthapp-b1891");
  var usersRef = ref.child(`users/${username}`);

  let message;
  usersRef.once('value').then(function(snapshot) {
    const response = snapshot.val();
    if(response && response[username]) {
      message = "user exists";
      res.json({message})
    } else {
      usersRef.set(userObj , function(error) {
        if (error) {
          message = "something went wrong";
        } else {
          message = "User created";
        }
        res.json({message})
      }); 
    } 
  });
});

app.post('/login', function(req, res) {
  const {username, password} = req.body;
  console.log(username, password);

  // Get a database reference to our posts
  var db = admin.database();
  var ref = db.ref("server/saving-data/healthapp-b1891");
  var usersRef = ref.child(`users/${username}`);

  usersRef.once('value').then(function(snapshot) {
    const response = snapshot.val();
    if(response && response[username]) {
      if(response[username].password === password) {
        res.json({message: "success"});
      } else {
        res.json({message: "incorrect username or password"});
      }
    } else {
      res.json({message: "user does not exist"})
    } 
  });
});

const port = 8080;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

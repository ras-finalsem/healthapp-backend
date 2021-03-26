const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require("firebase-admin");

const request = require("request");
const constants = require('./constants');

const serviceAccount = require("./healthapp-b1891-firebase-adminsdk-p31p2-fa43138c94.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://healthapp-b1891.firebaseio.com"
});

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post("/register", (req, res) => {
  const {username, password, userType} = req.body;
  
  const userObj = {
    username, password, userType
  };

  // Get a database reference to our posts
  var db = admin.database();
  var ref = db.ref("server/saving-data/healthapp-b1891");
  var usersRef = ref.child(`users/${username}`);

  //  check if username already exists
  usersRef.once('value').then(function(snapshot) {
    const response = snapshot.val();
    let message;
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

  // Get a database reference to our posts
  var db = admin.database();
  var ref = db.ref("server/saving-data/healthapp-b1891");
  var usersRef = ref.child(`users/${username}`);

  usersRef.once('value').then(function(snapshot) {
    const response = snapshot.val();
    let message;
    if(response) {
      if(response.password === password) {
        message = "success";
      } else {
        message = "incorrect username or password";
      }
    } else {
      message = "user does not exist";
    } 
    res.json({message});
  });
});

app.get('/illnessesList', function(req, res) {

  const {authToken} = constants;

  const options = {
    method: 'GET',
    url: `https://sandbox-healthservice.priaid.ch/symptoms?token=${authToken}&format=json&language=en-gb`
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    body = JSON.parse(body);
    res.json({body});
  });
})

app.post('/getIllness', function(req, res) {
  const {symptomIDs, yearOfBirth, gender} = req.body,
        {authToken} = constants;

  const symptoms = symptomIDs.join(",")

  const options = {
    method: 'GET',
    url: `https://sandbox-healthservice.priaid.ch/symptoms/proposed?symptoms=[${symptoms}]&gender=${gender}&year_of_birth=${yearOfBirth}&token=${authToken}&format=json&language=en-gb`
  };
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    body = JSON.parse(body);
    res.json({body});
  });
});


app.post('/bookAppointment', (req, res) => {
  const {username, name, date, selectedSymptoms, status} = req.body;

  var db = admin.database();
  var ref = db.ref("server/saving-data/healthapp-b1891");
  var usersRef = ref.child(`users`);

  usersRef.child(username).update({
    appointment: {
      hospital: name,
      appointmentDate: date,
      symptoms: selectedSymptoms, 
      status
    }
  });

  res.json("appointment created");
});


app.get('/getDoctors', (req, res) => {
  var db = admin.database();
  var ref = db.ref("server/saving-data/healthapp-b1891");
  ref.orderByChild('userType');

  

});


const port = 8080;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

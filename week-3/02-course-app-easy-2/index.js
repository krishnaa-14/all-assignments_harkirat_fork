const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const MY_SECRET_KEY = 'SECRET_KEY'

function authenticateRouteUsingJWT(req, res, next) {

  var token = req.headers["authorization"].split(" ")[1];
  jwt.verify(token, MY_SECRET_KEY, function(err, data) {
    if(err) {
      res.send(err);
    }
    else {
      req.user = data;
      next();
    }
  })

}

// Admin authentication Middle Ware. 

function adminAuthenticationMiddleWare(req, res, next) {

  var admin = req.headers;

  var adminExists = false;
  for(var i = 0; i < ADMINS.length; i++) {
    if(ADMINS[i].username === admin.username && ADMINS[i].password === admin.password) {
      adminExists = true;
    }
  }

  if(adminExists) {
    next();
  }
  else {
    res.send("Admin Authentication Failed !!! ")
  }

}

function userAuthenticationMiddleWare(req, res, next) {

  var userCreds = req.headers;
  var user = USERS.find(currUser => currUser.username === userCreds.username && currUser.password === userCreds.password);

  if(user) {
    req.user = user;
    next();
  }
  else {
    res.send("User Authentication Failed !!! ");
  }

}

// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  var user = req.headers;

  if(user.username && user.password) {

    var token = jwt.sign({
      username: user.username
    }, MY_SECRET_KEY)

    ADMINS.push(user);
    res.send({
      Message : "Admin Created Successfully !",
      Token : token
    });
  }

  res.send("Admin creation Failed. Try Again !!")

});

app.post('/admin/login', adminAuthenticationMiddleWare, (req, res) => {
  // logic to log in admin

  var user = req.headers;

  var token = jwt.sign({
    username: user.username
  }, MY_SECRET_KEY)

  res.send({
    Message : "Admin Logged In !! ",
    Token : token
  })

});

app.post('/admin/courses', authenticateRouteUsingJWT, (req, res) => {
  // logic to create a course

  var courseBody = req.body;
  var courseId = Date.now();

  courseBody["courseId"] = courseId;

  COURSES.push(courseBody);
  res.send({
    "message" : "Course Created SuccessFully !",
    "courseId" : courseId
  });

});

app.put('/admin/courses/:courseId', authenticateRouteUsingJWT, (req, res) => {
  // logic to edit a course

  var courseId = parseInt(req.params.courseId);
  var index = COURSES.findIndex(course => course.courseId === courseId);
 
  var updatedCourseBody = Object.assign(COURSES[index], req.body);

  if(index != -1) {
    COURSES[index] = updatedCourseBody;
    console.log(updatedCourseBody);
    console.log(COURSES);
    res.send("Course Updated Successfully !")
  }

  else {
    res.send("Course Updation Failed !")
  }

});

app.get('/admin/courses', authenticateRouteUsingJWT, (req, res) => {
  // logic to get all courses

  res.send(COURSES);

});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user

  var userDetails = req.headers;
  userDetails["purchasedCourses"] = [];
  // console.log(userDetails);

  // headers

  // Even when you add "purchasedCourses" in userDetails, it is also getting reflected in req.headers. 
  // Because of objects. 


  // console.log(req.headers);

  if(userDetails.username && userDetails.password) {
    USERS.push(userDetails);

    var token = jwt.sign({
      username : userDetails.username
    }, MY_SECRET_KEY)

    res.send({
      Message : "User Created Successfully", 
      Token : token
    });
  }

  else {
    res.send("User Creation Failed");
  }

});

app.post('/users/login', userAuthenticationMiddleWare, (req, res) => {
  // logic to log in user

  var userDetails = req.headers;

  var token = jwt.sign({
    username : userDetails.username
  }, MY_SECRET_KEY)

  res.send({
    Message : "User Logged In Successfully !! ",
    Token : token
  })
});

app.get('/users/courses', authenticateRouteUsingJWT, (req, res) => {
  // logic to list all courses

  res.send(COURSES);

});

app.post('/users/courses/:courseId', authenticateRouteUsingJWT, (req, res) => {
  // logic to purchase a course
  var courseId = parseInt(req.params.courseId);
  var index = COURSES.findIndex(course => course.courseId === courseId)

  var user = USERS.find(currUser => currUser.username === req.user.username);

  if(index != -1) {
    user.purchasedCourses.push(COURSES[index]);
    res.send("Course Purchased Successfully !")
  }
  else {
    res.send("Course Not found")
  }
});

app.get('/users/purchasedCourses', authenticateRouteUsingJWT, (req, res) => {
  // logic to view purchased courses

  var user = USERS.find(currUser => currUser.username === req.user.username);

  res.send(user.purchasedCourses);
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

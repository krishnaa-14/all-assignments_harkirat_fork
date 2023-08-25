const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

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
    ADMINS.push(user);
    res.send("Admin Created Successfully !");
  }

  res.send("Admin creation Failed. Try Again !!")

});

app.post('/admin/login', adminAuthenticationMiddleWare, (req, res) => {
  // logic to log in admin

  res.send("Admin Logged In !! ")

});

app.post('/admin/courses', adminAuthenticationMiddleWare, (req, res) => {
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

app.put('/admin/courses/:courseId', adminAuthenticationMiddleWare, (req, res) => {
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

app.get('/admin/courses', adminAuthenticationMiddleWare, (req, res) => {
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

  USERS.push(userDetails);

  if(userDetails.username && userDetails.password) {
    res.send("User Created Successfully");
  }

  else {
    res.send("User Creation Failed");
  }

});

app.post('/users/login', userAuthenticationMiddleWare, (req, res) => {
  // logic to log in user

  res.send("User Logged In Successfully !! ")
});

app.get('/users/courses', userAuthenticationMiddleWare, (req, res) => {
  // logic to list all courses

  res.send(COURSES);

});

app.post('/users/courses/:courseId', userAuthenticationMiddleWare, (req, res) => {
  // logic to purchase a course
  var courseId = parseInt(req.params.courseId);
  var index = COURSES.findIndex(course => course.courseId === courseId)

  if(index != -1) {
    req.user.purchasedCourses.push(COURSES[index]);
    res.send("Course Purchased Successfully !")
  }
  else {
    res.send("Course Not found")
  }
});

app.get('/users/purchasedCourses', userAuthenticationMiddleWare, (req, res) => {
  // logic to view purchased courses

  res.send(req.user.purchasedCourses);

});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

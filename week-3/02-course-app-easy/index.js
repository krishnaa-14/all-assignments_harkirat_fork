const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

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

app.post('/admin/login', (req, res) => {
  // logic to log in admin

  var user = req.headers;

  // This authentication we need to do it globally instead of doing for every route, 
  // We need to use middlewares for that. 

  var adminExists = false;
  for(var i = 0; i < ADMINS.length; i++) {
    if(ADMINS[i].username === user.username && ADMINS[i].password === user.password) {
      adminExists = true;
    }
  }

  if(adminExists) {
    res.send("Logged In Successfully !")
  }
  else {
    res.send("Admin Not found");
  }


});

app.post('/admin/courses', (req, res) => {
  // logic to create a course

  var user = req.headers;
  var courseBody = req.body;
  var courseId = Date.now();

  var adminExists = false;
  for(var i = 0; i < ADMINS.length; i++) {
    if(ADMINS[i].username === user.username && ADMINS[i].password === user.password) {
      adminExists = true;
    }
  }

  if(!adminExists) {
    res.send("Admin Authentication Failed");
  }

  else {

    courseBody["courseId"] = courseId;

    COURSES.push(courseBody);
    res.send({
      "message" : "Course Created SuccessFully !",
      "courseId" : courseId
    });

  }

});

app.put('/admin/courses/:courseId', (req, res) => {
  // logic to edit a course

  var user = req.headers;
  var courseId = parseInt(req.params.courseId);
  var index = COURSES.findIndex(course => course.courseId === courseId);
 
  var updatedCourseBody = Object.assign(COURSES[index], req.body);
  

  console.log(courseId);

  console.log(index);
  console.log(COURSES);
  console.log(courseId);

  var adminExists = false;
  for(var i = 0; i < ADMINS.length; i++) {
    if(ADMINS[i].username === user.username && ADMINS[i].password === user.password) {
      adminExists = true;
    }
  }

  if(adminExists && index != -1) {
    COURSES[index] = updatedCourseBody;
    console.log(updatedCourseBody);
    console.log(COURSES);
    res.send("Course Updated Successfully !")
  }

  else {
    res.send("Course Updation Failed !")
  }


});

app.get('/admin/courses', (req, res) => {
  // logic to get all courses

  var user = req.headers;

  var adminExists = false;
  for(var i = 0; i < ADMINS.length; i++) {
    if(ADMINS[i].username === user.username && ADMINS[i].password === user.password) {
      adminExists = true;
    }
  }

  if(adminExists) {
    res.send(COURSES);
  }
  else {
    res.send("Not able to fetch Courses.");
  }

});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user

  var userDetails = req.headers;
  userDetails["purchasedCourses"] = [];
  console.log(userDetails);

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

app.post('/users/login', (req, res) => {
  // logic to log in user

  var userDetails = req.headers;
  var userExists = false;

  for(var i = 0; i < USERS.length; i++) {
    if(USERS[i].username === userDetails.username && USERS[i].password === userDetails.password) {
      userExists = true;
      break;
    }
  }

  if(userExists) {
    res.send("Logged In Successfully !");
  }
  else {
    res.send("User Not signed up")
  }

});

app.get('/users/courses', (req, res) => {
  // logic to list all courses

  var userDetails = req.headers;
  var userExists = false;

  for(var i = 0; i < USERS.length; i++) {
    if(USERS[i].username === userDetails.username && USERS[i].password === userDetails.password) {
      userExists = true;
      break;
    }
  }

  if(userExists) {
    res.send(COURSES);
  }

});

app.post('/users/courses/:courseId', (req, res) => {
  // logic to purchase a course
  var courseId = parseInt(req.params.courseId);
  var index = COURSES.findIndex(course => course.courseId === courseId)
  // purchasedCourses.push(COURSES[index]);

  var user = req.headers;

  var userIndex = USERS.findIndex(currUser => currUser.username === user.username && currUser.password === user.password);

  if(index != -1) {
    USERS[userIndex].purchasedCourses.push(COURSES[index]);
    res.send("Course Purchased Successfully !")
  }
  else {
    res.send("Course Not found")
  }
});

app.get('/users/purchasedCourses', (req, res) => {
  // logic to view purchased courses
  var user = req.headers;
  var userIndex = USERS.findIndex(currUser => currUser.username === user.username && currUser.password === user.password);

  if(userIndex != -1) {
    res.send(USERS[userIndex].purchasedCourses);
  }
  else {
    res.send("There are no purchased courses");
  }


});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

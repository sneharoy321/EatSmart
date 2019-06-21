var express = require('express');
var router = express.Router();

var config = require('config');
var mysqlConfig = config.get('mysql');

var mysql = require('mysql');

var con = mysql.createConnection(mysqlConfig);

// connects to the mySQL
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!"); 
});

/* The Pages and stuff */  
//-----------------------------------------------------------------------------------------
router.get('/login', function(req, res, next) {// ALL OF THESE basically render the pages passes title parameter and if login page passes in the user
  res.render('login', { title: 'EatSmart Login' });
});
router.get('/search', function(req, res, next) {
  res.render('search', { title: 'EatSmart Search' });
});
router.get('/home', function(req, res, next) {
  res.render('home', { title: 'EatSmart Home' });
});
router.get('/', function(req, res, next) {
  res.render('home', { title: 'EatSmart Home' }); 
});
router.get('/new-user', function(req, res, next) {
  res.render('new-user', { title: 'EatSmart New User',"user":{} });
});
router.get('/check-in', function(req, res, next) {
  if(req.session.user){
    res.render('check-in', { title: 'EatSmart Check In',"user":req.session.user});
  }
  else{ 
    res.redirect("/login");
  }
});
router.get('/diet', function(req, res, next) {
  if(req.session.user){
    res.render('diet', { title: 'EatSmart Diet',"user":req.session.user});
  }  
  else{ 
    res.redirect("/login");
  } 
});
router.get('/dietHistory', function(req, res, next) {
  if(req.session.user){
    res.render('dietHistory', { title: 'EatSmart Diet History',"user":req.session.user, "items":req.session.items});
  }
  else{ 
    res.redirect("/login");  
  }
});
router.get('/setGoalsForm', function(req, res, next) {
  if(req.session.user){
    res.render('setGoalsForm', { title: 'EatSmart Set Diet Goals',"user":req.session.user});
  }
  else{ 
    res.redirect("/login");  
  }
});


router.get('/goals', function(req, res, next) {
  console.log(req.session.user)
  var today = new Date().toISOString().substr(0, 10);
  var lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  console.log(lastWeek);
  if(req.session.user){
    var sql = `SELECT nutritionSum FROM eatsmart.DietHistory WHERE userId= "${req.session.user.id}" AND dateTime BETWEEN 
    '${lastWeek.toISOString().substring(0,10)} 00:00:00' AND '${today} 23:59:59'`;
    //returns everything eaten in that date   

    console.log(sql); 
    con.query(sql, function (err, result) {//result is an array of JSon objects and stuff
      if (err) throw err;
        //console.log(result);// this prints out the correct value of a json object array of each meal
      if(req.session.user){
        console.log(result);
          var nutritionSumItem = {
              "calories": 0,
              "protein": 0,
              "fat":0,
              "carbohydrate":0,
              "potassium":0,
              "vitaminA":0
          };  
          // console.log("REACHED")
          for(var i in result){ 
            var nutritionSum = JSON.parse(result[i].nutritionSum);
            nutritionSumItem.calories += Math.round(nutritionSum.calories/7);
            nutritionSumItem.protein += Math.round(nutritionSum.protein/7);
            nutritionSumItem.fat += Math.round(nutritionSum.fat/7);
            nutritionSumItem.carbohydrate += Math.round(nutritionSum.carbohydrates/7);
            nutritionSumItem.potassium += Math.round(nutritionSum.potassium/7);
            nutritionSumItem.vitaminA += Math.round(nutritionSum.vitaminA/7);
          }
          // console.log("HERE")
          console.log(nutritionSumItem);
          //console.log(user.calorieGoal + "calorie Goal"); 
          res.render('goals',{title:"Eat Smart Goals", "user":req.session.user, "nutritionSumItem":nutritionSumItem});
      } 
      else{
        res.redirect("/login"); 
      }
    });
  }
  else{ 
    res.redirect("/login");  
  }
});


router.get('/dashboard', function(req, res, next) {
  if(req.session.user){ 
    res.render('dashboard', { title: 'EatSmart Dashboard',"user":req.session.user});
  }
  else{
    res.redirect("/login");
  }
}); 
router.get('/profile', function(req, res, next) {
  if(req.session.user){
    res.render('profile', { title: 'EatSmart Profile',"user":req.session.user});
  } 
  else{
    res.redirect("/login"); 
  }  
}); 
//------------------------------------------------------------------------------------------
//this is for the log in validation thingy 
//pass in variable into the body of the form
// checks the email if valid then the password 
// if valid add the user to the middle wear (excuse spelling) session
router.post('/login', function(req, res, next) {
  var sql = `SELECT * FROM eatsmart.user WHERE email= "${req.body.email}"`;
  console.log(sql); 
  con.query(sql, function (err, results) { // later version check for duplicates
    if (err) throw err;
    console.log("Result: " + JSON.stringify(results,null,2));
    if(results.length == 0){ // this means no user with that email
      res.redirect('/new-user');
      return;
    }
    //means email exists if passes this point
    //to do: make sure there isnt more than one user * for later version
    if(results[0].password == req.body.password){
      req.session.user=results[0];
      res.redirect('/dashboard');
      return;
    }
    //reaches here means no password match
    var message = `incorrect password for user ${req.body.email} `;
    res.render('login', { 
      "title": 'EatSmart Login', 
      "message": message 
    });  
  }); 
});
 
//creates new user from the form in new-user.pug 
router.post('/new-user', function(req, res, next) { 
    // for a later version check to make sure no duplicate usernames
    console.log("the date is" + req.body.date);
    var sql = `INSERT INTO eatsmart.user (name, email,city,password,height,weight,calorieGoal,carbohydrateGoal,proteinGoal,potassiumGoal,fatGoal,vitaminAGoal) VALUES 
                  ('${req.body.name}', '${req.body.email}','${req.body.city}','${req.body.password}','${req.body.height}','${req.body.weight}','${req.body.calorieGoal}','${req.body.carbohydrateGoal}','${req.body.proteinGoal}','${req.body.potassiumGoal}','${req.body.fatGoal}','${req.body.vitaminAGoal}')`;
    //insert into is like the sql syntax for adding stuff
    console.log(sql);
    con.query(sql, function (err, results) { // added it into database
       if (err) throw err;
      console.log("added");
      req.session.user=results[0];
      res.redirect('/dashboard');
    }); 
        
});

//logs the weight and height with a time stamp so later on I can show progression of weight or watever
//updates the current weight and height
router.post('/check-in', function(req, res, next) {
  //inserts a new value into userHistory that keeps track of progression of weight and height
    var sql = `INSERT INTO eatsmart.UserHistory (weight,height,userId) VALUES ('${req.body.weight}','${req.body.height}', '${req.session.user.id}')`;
    console.log(sql); 
    con.query(sql, function (err, results) {
      if (err) console.log(err);
      console.log("added the weight and height stuff to UserHistory");
      //req.session.user=results[0]; 
    }); 
    //then updates the current user to change its weight and height
    sql = `UPDATE eatsmart.user SET weight = "${req.body.weight}", height= "${req.body.height}" WHERE id = "${req.session.user.id}"`;
    console.log(sql);
    con.query(sql, function (err, results) {
       if (err) throw err;
      console.log("updated the weight and height stuff");
    }); 
    req.session.user.weight = req.body.weight;
    req.session.user.height = req.body.height;
    res.redirect('/check-in')
}); 

//updates the user's info like password email name and stuff
router.post('/profile', function(req, res, next) {
    var arrKeys = Object.keys(req.body); //this updates everything
    var arrOutput=[]; 
    arrKeys.forEach(function(element){ // for each loop on arrKeys 
      arrOutput.push(`${element} = "${req.body[element]}"` );
    });
    //basically that ^ created the long string I m gunna insert into sql string below
    var sql = `UPDATE eatsmart.user SET ${arrOutput.join(',')} WHERE id = "${req.session.user.id}"`;
    console.log(sql);
    con.query(sql, function (err, results) {
       if (err) throw err; 
      console.log("updated"); 
      console.log(JSON.stringify(results));
      req.body.id = req.session.user.id;
      req.session.user = req.body;
      res.redirect('/profile');   
    });    
          
}); 

router.post('/setGoalsForm', function(req, res, next) {
    //then updates the current user to 
    console.log("UGHHHHHHHHHHHHH")
    //
    //console.log(req.body.calories);
    sql = `UPDATE eatsmart.user SET calorieGoal = "${req.body.calories}", proteinGoal = "${req.body.protein}", potassiumGoal = "${req.body.potassium}", fatGoal = "${req.body.fats}",vitaminAGoal = "${req.body.vitaminA}", carbohydrateGoal= "${req.body.carbs}" WHERE id = "${req.session.user.id}"`;
    //returns the values with in the interval
    console.log(sql);
    con.query(sql, function (err, results) {
       if (err) throw err;
      console.log("updated nutrition");
    }); 
    // setting the value into the middle ware
    req.session.user.calorieGoal = req.body.calories;
    req.session.user.proteinGoal = req.body.protein;
    req.session.user.potassiumGoal = req.body.potassium;
    req.session.user.fatGoal = req.body.fats;
    req.session.user.vitaminAGoal = req.body.vitaminA;
    req.session.user.carbohydrateGoal = req.body.carbs;
    res.redirect('/goals')
}); 

module.exports = router;
 
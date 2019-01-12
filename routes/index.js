var express = require('express');
var router = express.Router();

var config = require('config');
var mysqlConfig = config.get('mysql');

var mysql = require('mysql');

var con = mysql.createConnection(mysqlConfig);
// var con = mysql.createConnection({
//   host: "localhost",
//   port:"3000",
//   user: "yourusername",
//   password: "yourpassword"
// }); 

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!"); 
});

/* GET home page. */  
//-----------------------------------------------------------------------------------------
router.get('/login', function(req, res, next) {
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
router.post('/login', function(req, res, next) {
  var sql = `SELECT * FROM eatsmart.user WHERE email= "${req.body.email}"`;
  console.log(sql); 
  con.query(sql, function (err, results) {//gives ERROR IF DUPLICATE LATER FIX THIS
    if (err) throw err;
    console.log("Result: " + JSON.stringify(results,null,2));
    if(results.length == 0){
      res.redirect('/new-user');
      return;
    }//means email exists
    //to do: make sure there isnt more than one user
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
 
router.post('/new-user', function(req, res, next) {
    console.log("the date is" + req.body.date);
    var sql = `INSERT INTO eatsmart.user (name, email,city,password,dob,height,weight) VALUES ('${req.body.name}', '${req.body.email}','${req.body.city}','${req.body.password}','${req.body.dob}','${req.body.height}','${req.body.weight}')`;
    console.log(sql);
    con.query(sql, function (err, results) {
       if (err) throw err;
      console.log("added");
      req.session.user=results[0];
      res.redirect('/dashboard');
    }); 
        
});
router.post('/check-in', function(req, res, next) {
  var sql = `INSERT INTO eatsmart.UserHistory (weight,height,userId) VALUES ('${req.body.weight}','${req.body.height}', '${req.session.user.id}')`;
    console.log(sql);
    con.query(sql, function (err, results) {
      if (err) console.log(err);
      console.log("added the weight and height stuff to UserHistory");
      //req.session.user=results[0]; 
    }); 
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
router.post('/profile', function(req, res, next) {
    var arrKeys = Object.keys(req.body);
    var arrOutput=[];
    arrKeys.forEach(function(element){
      arrOutput.push(`${element} = "${req.body[element]}"` );
    });
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


module.exports = router;
 
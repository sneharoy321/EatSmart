const express = require('express'); 
const router = express.Router();
module.exports = router;
const axios = require('axios') // a javascript library
var mysql = require('mysql'); //data base
var config = require('config'); 
var mysqlConfig = config.get('mysql'); 

var con = mysql.createConnection(mysqlConfig); // connects to database 

const api = { //just an object that contains the api key and url for the api of getting food options
  "key":"PTkeAfXI6Nx4FJ5CSoQwMrKaQFTwvVNDgQH2j7bR",
  "url":"https://api.nal.usda.gov/ndb"
}

/*
PASS IN: SEARCH TERM OR LIKE FOOD NAME 
GETS an array of the top 50 search results from api 
Each element in array is a JSON object with  Food NAME and NBDNO number which is like the identification number of each food
*/
router.get("/food",function(req,res,next){ 
  let searchTerm = req.query.search; // seaches the api for the food search search
  let offset = req.query.offset ? req.query.offset : 1; // this is like an if statement with truthy and falsy (Truthy means like has value)
  let max = req.query.max ? req.query.max: 50; // pick the top 50 values and only display them
  let total;

  if(!searchTerm){ 
    res.json({  
      "message":"Food API"  
    })
    return; 
  }
  //create the url and pass in the parameters
  let url = `${api.url}/search?format=json&q=${searchTerm}&api_key=${api.key}&offset=${offset}&max=${max}`;

  console.log(url);
  //axios.get basically does the call to the api
  axios.get(url)
    .then(function(response){
      res.json(response.data); //sends the JSON data to the view template
      total = response.data.total;
      return;
    })
    .catch(function(err){
      console.log('err');
    })
})

// This calls the nutrition API and returns the nutrition information
router.get('/food/:id', function(req, res, next){// CALL TO NUTRITION API
 
  let id = req.params.id; //ID IS THE NBDNO NUMBER (kinda like a GUID for the Item)
  let url = `https://api.nal.usda.gov/ndb/V2/reports?api_key=PTkeAfXI6Nx4FJ5CSoQwMrKaQFTwvVNDgQH2j7bR&format=json&ndbno=${id}&type=b`;//different url to get nutrition
  console.log(url);
  axios.get(url) 
    .then(function(response){  
      console.log(response.data); 
      res.json(response.data);
      total = response.data.total; 
      return;
    })
    .catch(function(err){
      console.log('err');
    })

}) 

/*
adds each meal into data base specitifically the table DietHistory
INPUT:
mealType 
userId (using the session.user)
items[] which is an array of food JSON 
nutritionSum json object of the total nutrition stuff
*/
router.post('/meals', function(req, res, next) {//adding in a meal
  //variables: meal type, items, date, time!
  console.log("REACHED METHOD IN API");
  var sql = `INSERT INTO eatsmart.DietHistory (userID, mealType, items, nutritionSum) VALUES ('${req.session.user.id}', '${req.body.mealType}','${JSON.stringify(req.body.items)}', '${JSON.stringify(req.body.summary)}')`;
  console.log(sql);
  con.query(sql, function (err, results) {
      if (err) throw err; 
      console.log("added"); 
  });  
  console.log("REACHED THE END");
  
});
//PASS IN the DATE and user ID
//will return all the data from that day from DietHistory table
router.get('/dietHistory', function(req, res, next) {//Returns history of what u ate on this day
  var sql = `SELECT nutritionSum, items, mealType FROM eatsmart.DietHistory WHERE userId= "${req.query.userId}" AND dateTime BETWEEN 
  '${req.query.selectedDate} 00:00:00' AND '${req.query.selectedDate} 23:59:59'`;
  //returns everything eaten in that date   
  console.log(sql); 
  con.query(sql, function (err, result) {//result is an array of JSon objects and stuff
    if (err) throw err;
    console.log(result);// this prints out the correct value of a json object array of each meal
    if(req.session.user){
      debugger;
      res.json(result)
      return result;  
    } 
    else{
      res.redirect("/login"); 
    }
  });

})
router.get('/dietHistoryThisWeek', function(req, res, next) {//Returns history of what u ate this week
  // var aWeekAgo = req.query.selectedDate - 7;
  // console.log(aWeekAgo);
  var sql = `SELECT nutritionSum FROM eatsmart.DietHistory WHERE userId= "${req.query.userId}" AND dateTime BETWEEN 
  '${req.query.lastWeekDate} 00:00:00' AND '${req.query.selectedDate} 23:59:59'`; 
  //returns everything eaten in that date     
  console.log(sql);  
  con.query(sql, function (err, result) {//result is an array of JSon objects and stuff  
    if (err) throw err;
    console.log(result);// this prints out the correct value of a json object array of each meal
    if(req.session.user){
      debugger;
      res.json(result) 
      return result;  
    } 
    else{
      res.redirect("/login"); 
    }
  });

});

router.get("/",function(req,res,next){ 
  res.json({ 
    "message":"EatSmart Api"
  });  
})   

// router.post('/setGoalsForm', function(req, res, next) {  
//   var sql = `UPDATE eatsmart.user SET nutrientGoal = ${req.body.nutrientGoal} WHERE id = "${req.session.user.id}"`;
//   console.log(nutrientGoal);
//   res.redirect('/goals');
// }); 


  
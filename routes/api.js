const express = require('express');
const router = express.Router();
module.exports = router;
const axios = require('axios')
var mysql = require('mysql');
var config = require('config');
var mysqlConfig = config.get('mysql');

var con = mysql.createConnection(mysqlConfig);

const api = {
  "key":"PTkeAfXI6Nx4FJ5CSoQwMrKaQFTwvVNDgQH2j7bR",
  "url":"https://api.nal.usda.gov/ndb"
}
// const apiNutrition = {
//   "url":'https://developer.nrel.gov/api/alt-fuel-stations/v1/nearest.json?api_key=QawBznBQR9E1FYPLVnmh6cxo2KK0M8zArJJnTRFw&location=Denver+CO',
//   'key':'QawBznBQR9E1FYPLVnmh6cxo2KK0M8zArJJnTRFw'
// }

router.get("/",function(req,res,next){
  res.json({
    "message":"EatSmart Api"
  });
})

router.get("/food",function(req,res,next){
  let searchTerm = req.query.search;
  let offset = req.query.offset ? req.query.offset : 1;
  let max = req.query.max ? req.query.max: 50;
  let total;

  if(!searchTerm){
    res.json({
      "message":"Food API"
    })
    return;
  }
  
  let url = `${api.url}/search?format=json&q=${searchTerm}&api_key=${api.key}&offset=${offset}&max=${max}`;

  console.log(url);

  axios.get(url)
    .then(function(response){
      res.json(response.data);
      total = response.data.total;
      return;
    })
    .catch(function(err){
      console.log('err');
    })
})


router.get('/food/:id', function(req, res, next){

  let id = req.params.id;
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

router.post('/meals', function(req, res, next) {//adding in a meal
  //variables: meal type, items, date, time
  console.log("REACHED METHOD IN API");
  var sql = `INSERT INTO eatsmart.DietHistory (userID, mealType, items, nutritionSum) VALUES ('${req.session.user.id}', '${req.body.mealType}','${JSON.stringify(req.body.items)}', '${JSON.stringify(req.body.summary)}')`;
  console.log(sql);
  con.query(sql, function (err, results) {
      if (err) throw err;
      console.log("added");
  }); 
  console.log("REACHED THE END");
  res.redirect('/login');// WHY ISNT THIS WORKING!!!!!?!?!?!?!?!?!? UGGHHHHHHH!!!!!!!!!
});

router.get('/dietHistory', function(req, res, next) {//Returns history of what u ate on this day
  var sql = `SELECT nutritionSum, items, mealType FROM eatsmart.DietHistory WHERE userId= "${req.query.userId}" AND dateTime BETWEEN 
  '${req.query.selectedDate} 00:00:00' AND '${req.query.selectedDate} 23:59:59'`;
  //returns everything eaten in that date  
  console.log(sql);

  con.query(sql, function (err, result) {//result is an array of JSon objects and stuff
    if (err) throw err;
    console.log(result);// this prints out the correct value of a json object array of each meal
    if(req.session.user){
      res.render('dietHistory', { title: 'EatSmart Diet History',"user":req.session.user, "items":result});
    }
    else{
      res.redirect("/login");
    }
    return result; 
  });

});



router.get('/meals/id', function(req, res, next) {//details on this meal
  
});
  
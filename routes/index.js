var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {


  var AWS = require("aws-sdk");

  AWS.config.update({ region: "us-east-2" });

  var docClient = new AWS.DynamoDB.DocumentClient();

  var params = {
    TableName: "Users",
    KeyConditionExpression: "email between :letter1 and :letter2",
    ExpressionAttributeValues: {
        ":letter1": "a",
        ":letter2": "z",

    }
  };

  docClient.query(params, function(err, data) {

      if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));

        res.render('index', { 
          title: 'EatSmart',
          user: {"Error" : true} 
        });

      } else {

        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));

        res.render('index', { 
          title: 'EatSmart',
          users: data.Items
        });

      }

    });

  });



router.get('/login', function(req, res, next) {
  res.render('login', { title: 'EatSmart Login' });
});



module.exports = router;

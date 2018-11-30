const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const pg = require('pg');
const host = '127.0.0.1';
const port = 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));    // Add static file folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

var client = new pg.Client({
  host : 'ec2-54-243-46-32.compute-1.amazonaws.com',
  user : 'denzqpgcqqwtws',
  password : '6bbaac8881efc4c205da6ab84b1fc1b2e22f04c1bef4f90af84483b4ecb0f5e3',
  database : 'dcmva4lvi1donl',
  port: 5432,
  ssl:true
});

client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
});


app.get('/', (req, res) => {

  let state_info = null;
  let sample_info = null;


  client.query('SELECT * FROM "Count"', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }

    state_info = result.rows;
    res.render('index', {data_sets: state_info});
    //client.end();
  });
});  

app.get('/sample', (req, res) => {

  client.query('SELECT * FROM "Sample"', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }

    sample_info = result.rows;
    res.render('sample', {data_sets: sample_info});
    //client.end();
  });
});  


app.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}/`);
  });
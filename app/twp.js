var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    Survey = require('./controllers/survey'),
    Index = require('./controllers/index'),
    app = express();

const pg = require('pg');
const host = '127.0.0.1';
const port = 3000;

// app.use(bodyParser.urlencoded({extended: false}));
// app.use(express.static(path.join(__dirname, 'public')));    // Add static file folder
// app.set('view engine', 'ejs');
// app.set('views', './views');
// express middleware
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'public')));    // Add static file folder
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: 'GeJExxKWSM',    
    resave: true,
    saveUninitialized: true
}));
app.set('views', './views');
app.set('view engine', 'ejs');

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

let state_info = null;
let sample_info = null;
app.get('/', function(req, res) {
    Index.getIndex(req ,res);
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

app.get('/visual', (req, res) => {

  client.query('SELECT * FROM "Sample"', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows);
    let visual_info = result.rows;
    res.render('visual', {data_sets: visual_info});
  });
});

app.get('/survey_entry', (req, res) => {

  client.query('SELECT * FROM "Sample"', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows);
    let visual_info = result.rows;
    res.render('visual', {data_sets: visual_info});
  });
});

app.post('/matches', function(req, res) {

    if(req.body.action == "survey"){
        Index.setLogin(req, res);
    }else{
        Survey.setMatches(req, res);
    }
});

app.get('/expired', function(req, res) {
    Index.getExpired(req ,res);
});


app.get('/survey/:id', function(req, res) {
    Survey.getQuestions(req.params.id, req, res);
});
app.post('/survey', function(req, res) {
    Survey.setAnswers(req, res);
});

app.get('/preferences', function(req, res) {
    Survey.getPreferences(req, res);
});
app.post('/preferences', function(req, res) {
    Survey.setPreferences(req, res);
});



app.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}/`);
  });
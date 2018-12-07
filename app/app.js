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
    let sample_info = result.rows;
    // get counts & labels & data
    counts = {};
    counts_for_student = {};
    for(var i = 0; i<sample_info.length;i++){
      var obj = sample_info[i];
      var name = obj["id"];
      var score = 0;
      for(key in obj){
        if(key!="id"){
          if(obj[key]>='3'){
            if(counts[key]==null){
              counts[key] = [0,1];
            }
            else{
              counts[key][1] +=1 ;
            }
          }
          else{
            if(counts[key]==null){
              counts[key] = [1,0];
            }
            else{
              counts[key][0] +=1 ;
            }
          }
          if(obj[key]!=null)score = score + parseInt(obj[key]);
        }
        else{
          name = obj["id"];
        }
      }
      counts_for_student[name] = score;
    }
    // normalization & change format
    count_list = [];
    label_list = [];
    data_list = [];
    data_list_high = []
    for(key in counts){
      // reconstruct into dictionary
      dict = {};
      dict["id"] = key;
      var sum_count = counts[key][0]+counts[key][1]
      dict["low"] = counts[key][0] / sum_count;
      dict["high"] = counts[key][1] / sum_count;
      count_list.push(dict);
      label_list.push(key);
      data_list.push(dict["low"]);
      data_list_high.push(dict["high"]);
    }

    // get best&worest students
    var items = Object.keys(counts_for_student).map(function(key) {
      return [key,counts_for_student[key]]
    });
    items.sort(function(first, second) {
      return second[1] - first[1];
    });
    var best_student = [];
    for(var i = 0;i<5;i++){
      var dict = {};
      dict["id"] = items[i][0];
      dict["score"] = items[i][1];
      best_student.push(dict);
    }
    var worst_student = [];
    for(var i = items.length-5;i<items.length;i++){
      var dict = {};
      dict["id"] = items[i][0];
      dict["score"] = items[i][1];
      worst_student.push(dict);
    }

    console.log(result.rows);
    console.log(counts_for_student);
    console.log(best_student);
    console.log(worst_student);
    res.render('visual', {data_sets: count_list, best_student_sets:best_student, worst_student_sets: worst_student, labellist : label_list , datalist : data_list, datalist_high: data_list_high});
  });
});

app.get('/survey_entry', (req, res) => {

  client.query('SELECT * FROM "Sample"', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows);
    let visual_info = result.rows;
    res.render('visual', {data_sets: counts});
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
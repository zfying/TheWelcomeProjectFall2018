var fs = require('fs');
var test;

module.exports = {
    name: "Survey",
    getQuestions: function(id, req, res){

        var username = req.session.username;

        if(typeof(username) != 'undefined') {
            fs.readFile('./files/surveyquestions.json', 'utf8', function (err, data) {
                if (err) throw err;
                var questions = JSON.parse(data);

                var index = id-1, isLast = false;

                if(questions.length == id){
                    isLast = true;
                }

                if(typeof(questions[index]) != 'undefined') {

                    if(req.cookies.pref){
                        pref = req.cookies.pref;
                    }else{
                        pref = 1; // if no cookie set default to vertical
                    }

                    fs.readFile('./files/surveyanswers.json', 'utf8', function (err, data) {
                        if (err) throw err;
                        var answers = JSON.parse(data);

                        res.render('survey', { 
                            username: username,
                            pref: pref,
                            id: id, 
                            title: 'Survey Step '+id,
                            questions: questions,
                            isLast: isLast,
                            answers: answers[username],
                        });

                    });
                }
                else{
                    res.status(404).send('Error! No Survey Questions Found'); // send to an error page if no questions left to display
                }

            });

        }else{
            res.redirect('/');
        }
    },
    setAnswers: function(req, res){
        // check if timer has expired
        var startTime = req.cookies.starttime;
        var currentTime = new Date().getTime();
        var timeDiff = (currentTime - startTime) / 1000; // diff in seconds

        // timer less than 30 seconds
        if(timeDiff < 30){

            var id = req.body.id;    

            // check whether the next or previous buttons were pressed
            // and increase or decrease the survey step id
            if(req.body.submit == 'previous'){
                id--;
            }else{
                id++;            
            }

            // read and modify json to set answers
            fs.readFile('./files/surveyanswers.json', 'utf8', function (err, data) {
                if (err) throw err;
                var answers = JSON.parse(data);

                if(typeof(req.session.username) != 'undefined') {
                    var username = req.session.username, 
                        isLast = req.body.isLast;
                    
                    // check if user exists
                    if(typeof(answers[username]) != 'undefined'){

                        // if exists, update his answers
                        answers[username][--req.body.id] = req.body.answer;

                        module.exports.writeAnswers(isLast, id, res, answers);

                    }else{

                        // if user doesn't exist
                        // read the questions file and get the total number of questions
                        fs.readFile('./files/surveyquestions.json', 'utf8', function (err, data) {
                            
                            if (err) throw err;

                            var questions = JSON.parse(data);

                            var survey = new Array(questions.length);
                            survey[--req.body.id] = req.body.answer;
                            answers[username] = survey;                        

                            module.exports.writeAnswers(isLast, id, res, answers);

                        });
                    }
                    

                }else{
                    res.redirect('/');    
                }

            });
        }else{
            res.send('Error! You took more than 30 seconds to fill the survey. Go back to the <a href="/">homepage</a> and retake it');
        }
    },
    writeAnswers: function(isLast, id, res, answers){
        // write answers to JSON and sends to the next/prev page
        answers = JSON.stringify(answers, null, 4);
        
        fs.writeFile("./files/surveyanswers.json", answers , function(err) {
            if(err) {
                throw err;
            } 
            else {
                if(isLast == 'true'){
                    res.redirect('/success');
                    
                }else{
                    res.redirect('/survey/'+id);
                }                
            }
        }); 

    },
    getPreferences: function(req, res){

        if(req.cookies.pref){
            pref = req.cookies.pref
        }else{
            pref = 1 // if no cookie set default to vertical
        }

        res.render('preferences', { 
            title: 'Display Preference | ser422 LAB3',
            pref: pref
        });
    },
    setPreferences: function(req, res){
        var pref = req.body.preference;

        // set the cookie
        res.cookie('pref', pref, 
               { maxAge: 60*60*1000, 
                 httpOnly: true, 
                 path:'/'});

        res.redirect('/survey/1');
    },
    setMatches: function(req, res){
        
        fs.readFile('./files/surveyanswers.json', 'utf8', function (err, data) {
        
            if (err) throw err;
            var answers = JSON.parse(data);
            var username = req.body.username;            

            var matches = [];

            if(typeof(answers[username]) != 'undefined') {

                // loop through the JSON object
                for (var key in answers) {

                    // check if it's not the same username
                    if(key != username){

                        // loop through all the answers and match against users answers
                        var count = 0;
                        for (var i = 0; i < answers[key].length; i++) {
                            if(answers[key][i] != null &&
                                answers[username][i] != null &&
                                answers[key][i] == answers[username][i])
                                count++;
                        };

                        if(count > 0){
                            var obj = {
                                username: key,
                                count: count
                            }
                            matches.push(obj); // store the count in matches object with username as key

                            // sort by best to worst
                            matches.sort(function(a, b){
                                return b.count - a.count;
                            });
                        }

                    }
                }

                res.render('matches', { 
                    username: username,
                    title: 'Matches for '+username+' | ser422 LAB3',
                    matches: matches
                });
                
            }else{
                        
                res.render('matches', { 
                    username: username,
                    title: 'No Matches Found | ser422 LAB3',
                    matches: matches
                });
            }            

        });
    }
}
module.exports = {
    name: "Index",
    setLogin: function(req, res){


        // timer
        // log the first visit so we can keep checking
        // if the user has taken 30 seconds on the survey or not        
        // set http false so client-side javascript can read the cookie
        var now = new Date();
        res.cookie('starttime', new Date().getTime(), 
                   { httpOnly: false, 
                     path:'/'});

        req.session.username = req.body.username;
        res.redirect('/survey/1');

    },
    getIndex: function(req, res){
        if (!req.cookies.pref){
            // set preference cookie
            // 1 for vertical, 0 for horizontal
            res.cookie('pref', '1', 
                   { maxAge: 60*60*1000, 
                     httpOnly: true, 
                     path:'/'});
        }

        res.render('index', { title: 'The Welcome Project' });
    },
    getExpired: function(req, res){
        res.send('Error! You took more than 30 seconds to fill the survey. Go back to the <a href="/">homepage</a> and retake it');  
    }
}
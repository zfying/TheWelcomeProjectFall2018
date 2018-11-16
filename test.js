// This is modeled on the code from http://www.tothenew.com/blog/connect-to-postgresql-using-javascript/
// Be sure to use npm install pg@6.4.0 to be able to use the query.on function
// Also, maybe check out this link for connecting to a Heroku database: https://stackoverflow.com/questions/17377118/heroku-database-connection-properties

var pg = require('pg');
var connectionString = "postgres://denzqpgcqqwtws:6bbaac8881efc4c205da6ab84b1fc1b2e22f04c1bef4f90af84483b4ecb0f5e3@ec2-54-243-46-32.compute-1.amazonaws.com:5432/dcmva4lvi1donl";
var pgClient = new pg.Client(connectionString);
pgClient.connect();
var query = pgClient.query("SELECT q1 FROM Sample Data");

query.on("row", function(row,result){
	result.addRow(row);
});


query.on("end", function(result){
	if(result.rows[0] === undefined){
		return;
	}
	else{
		var id = result.rows[0].id;
		var query = "delete from CustomerAddress where customer_id = " + id ;
		pgClient.query(query);
	}
	pgClient.end();
});
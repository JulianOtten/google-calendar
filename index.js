var fs = require('fs'); 
var readline = require('readline'); 
var google = require('googleapis'); 
var googleAuth = require('google-auth-library'); 
const mysql = require('mysql2');
const db_conn = require('./db_connect.json') // require database connection details

let db_host = db_conn.host;
let db_user = db_conn.user;
let db_database = db_conn.database;
let db_password = db_conn.password;

const connection = mysql.createConnection({
  host: db_host,
  user: db_user,
  database: db_database,
  password: db_password
}); // login on database

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '.credentials/'; 
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json'; 

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Google Calendar API.
  authorize(JSON.parse(content), listEvents); 
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * List all of the events from all your calendars (up to 9999 results per calendar, if you want this higher alter the "maxResults" option.)
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
  var calendar = google.calendar('v3');
  calendar.calendarList.list({  // call for the list of all your calendars
    auth: auth,  // pass the authentication
  }, function(err, response) { // function that is ran after you recieve the list.
    if (err) {
      console.log('The API returned an error: ' + err);
      return; // basic error handling
    } 
    var items = response.items; // the items of the list, these are all the calendars.
    
    for(let i = 0; i < items.length; i++){ // for every calendar, we grab its ID and look at all the events in said calendar.
      calendar.events.list({
        auth: auth,
        calendarId: items[i].id,
        timeMin: (new Date()).toISOString(),
        maxResults: 9999,
        singleEvents: true,
        showDeleted: true,
        orderBy: 'startTime' // not too sure what most of these do, calendar id is obvious, max results stands for the amount of events you can get per calendar.
      }, function(err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          return;// error handling
        }
        var events = response.items; // the items of the list, these are all the events that are located in the calendar
        if (events.length == 0) {
          console.log(`No upcoming events found from ${items[i].summary} \nCalendar id: ${items[i].id}\n----------`);// no events found
        } else {
          console.log(`Upcoming events from ${items[i].summary} \nCalendar id: ${items[i].id}`);// events founds, display the calendar name.
          for (var j = 0; j < events.length; j++) { // loop through the events
            var event = events[j];
            var start = event.start.dateTime || event.start.date; // starting date + time of the event
            var end = event.end.dateTime || event.end.date; // ending time + date from the event
            var id = event.id; // the id of the event
            console.log(`${j + 1}: ${start} to ${end} \n${event.summary} \nid: ${id}`); // display the events.
            
            let start_date = start.split("T")[0]; 
            let start_time = start.split("T")[1].split("+")[0]; 
            let end_date = end.split("T")[0];
            let end_time = end.split("T")[1].split("+")[0];
            //split the string so it matches the datetime field
            let start_full = `${start_date} ${start_time}`; // set the string so it matches the datetime field
            let end_full = `${end_date} ${end_time}`;
            let event_id = id; // get event id 
            let calendar_id = items[i].id; // get calendar id
            let calendar_name = items[i].summary; // get calendar name. 
            let event_name = event.summary; // get event name
            let status = event.status; // get events status: cancelled || confirmed
            let updated = event.updated; // get the date the event was last updated at
            let event_description; 
            if(event.description){
              event_description = event.description;
            } else {
              event_description = ""
            } // get event descripion if there is one. all the variables up here are for the sql line.
            //sql code here
            connection.query(
              `SELECT * FROM events WHERE event_id = "${event_id}"`, // check for duplicate id's
              function(err, rows) {
                if(err) throw err;
                if(!rows.length < 1){ // if rows is not lower than one (so if there is an id) update the id
                  console.log(`rows lenght: ${rows.length}`)
                  if(status == 'cancelled'){                    
                    //delete
                    console.log('reached cancelled if ')
                    connection.query(
                      `DELETE FROM events WHERE event_id = "${event_id}"`, // delete the event
                      function(err, rows){
                          if(err) throw err;
                          console.log("succesfully deleted useless result");
                      }
                    );

                  } else {
                    //update
                    connection.query(
                      `UPDATE events SET calendar_id="${calendar_id}",start_date="${start_full}",end_date="${end_full}",calendar_name="${calendar_name}",event_title="${event_name}",event_description="${event_description}" WHERE event_id ="${event_id}"`,
                      function(err, rows){
                        if(err) throw err;
                        console.log("Succesfully updated the database!");
                      }
                    );
                  }
                  
                 } else { // else, insert it into the database
                  if(status == 'confirmed'){ 
                   connection.query(
                     `INSERT INTO events (event_id, calendar_id, start_date, end_date, calendar_name, event_title, event_description) VALUES ("${event_id}","${calendar_id}","${start_full}","${end_full}","${calendar_name}","${event_name}","${event_description}")`,
                     function(err, rows){
                       if(err) throw err;
                       console.log("Succesfully added event to the database!");
                     }
                   );
                 }
                }
               }
            );

          }
          console.log("----------"); // a nice spacer so the console looks more organized 
        }
      });
    } 
  });
  //deleteOld();
}
 
/**
 * Function written to delete all of the old/useless records that are in the database.
 */

function deleteOld() {
  let date = Date.now();
  connection.query(
    `SELECT * FROM events`, // select all the events
    function(err, rows) { 
      // code stuff
      for (let i = 0; i < rows.length; i++) { // loop through the events
          let r = rows[i]; 
          let db_time = r.end_date; 
          let time = new Date(db_time).getTime(); // convert the database string to a javascript time format for comparing
          let toDelete = r.event_id;// grab the id of the event that has to be deleted
          if(time < date){   // if the Database time is lower than the current time 
              connection.query(
                  `DELETE FROM events WHERE event_id = "${toDelete}"`, // delete the event
                  function(err, rows){
                      if(err) throw err;
                      console.log("succesfully deleted useless result");
                  }
              );
          }
      }
    });
}
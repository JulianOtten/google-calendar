var fs = require('fs'); 
var readline = require('readline'); 
var google = require('googleapis'); 
var googleAuth = require('google-auth-library'); 

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
        orderBy: 'startTime' // not too sure what most of these do, calendar id is obvious, max results stands for the amount of events you can get per calendar.
      }, function(err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          return;// error handling
        }
        var events = response.items; // the items of the list, these are all the events that are located in the calendar
        if (events.length == 0) {
          console.log(`No upcoming events found from ${items[i].summary} \n Calendar id: ${items[i].id}\n ----------`);// no events found
        } else {
          console.log(`Upcoming events from ${items[i].summary} \nCalendar id: ${items[i].id}`);// events founds, display the calendar name.
          for (var j = 0; j < events.length; j++) { // loop through the events
            var event = events[j];
            var start = event.start.dateTime || event.start.date; // starting date + time of the event
            var end = event.end.dateTime || event.end.date; // ending time + date from the event
            var id = event.id; // the id of the event
            console.log(`${j + 1}: ${start} to ${end} \n${event.summary} \nid: ${id}`); // display the events.
          }
          console.log("----------"); // a nice spacer so the console looks more organized 
        }
      });
    } 
  });
}

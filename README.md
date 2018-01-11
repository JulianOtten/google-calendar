# google-calendar
This is an application that will be used to pull data from a google calendar and store it in a database, so that other users will be able to use this information to create different application that use the google calendar data.

How to install:

1. Install node.js on your system.
2. Create a workspace. (the easiest way of doing this, is cloning this github repo onto your system)
3. Install the github files. (skip this step if you cloned the repository)
4. Open a command prompt in your workspace, shift + right click and open a terminal. Enter the following commands:
npm install googleapis --save 
npm install googleapis --save
5. Visit [this](https://developers.google.com/google-apps/calendar/quickstart/nodejs) link and follow: **Step 1: Turn on the Google Calendar API** carefully.
6. Make sure you rename the client_secret**lostOfRandomCharacters**.json to client\_secret.json, else the application wont work!
7. Import the SQL file onto your database and edit the database connection in db_connect.
8. Run the start.bat file, visit the url it provides you with, and enter the code. You might have to run the application again after that. This application will not ask you for a code everytime you use it.
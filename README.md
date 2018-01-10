# google-calendar
This is an application that will be used to pull data from a google calendar and store it in a database, so that other users will be able to use this information to create different application that use the google calendar data.

In order to use this application, you are going to need a couple of things.
First you need Node.js https://nodejs.org/en/
After installing node.js (latest version if possible), you will automatically get the npm package installed aswell.

(If you already have node.js installed, and you don't know which version you are running, you can write node -v in your console to figure out which version you are running. I recommend you always update to the latest version after a while. This can be done by simply installing node again from their official website.)

After you have installed node and you created your workspace, you can install the libary's used by this application. To do this, you shift + right click in your workspace and you open a command promt in that folder. (You can also use a command prompt that comes with your code editor or something like that.)
Then, you enter the following command in your command promt: npm install googleapis --save
after that, you enter this command: npm install google-auth-library --save
Now that installing the libary's it out of the way, we can move on to installing the application.
To do this, you can write: git clone https://github.com/kingotten/google-calendar.git in your console, this will automatically install the files into your project. If you are not using git, you can also download the code from github and place the files into the workspace.
Awesome! You installed the libary's and installed the application to your project, woohoo!
Now, the most importand step, syncronizing your project with your google calendar!
Go to this link: https://developers.google.com/google-apps/calendar/quickstart/nodejs and follow step one carefully. Make sure you don't screw this up. Try to give your project a name that you can easily differenciate from your other projects if possible.
Note, step H downloads the client_secretA_LOT_OF_RANDOM_CHARACTERS.json to your pc, make sure you add this to your workspace as well. This file should be in the same folder as the index.js. Make sure you rename the file to client_secret.json or this application WILL NOT WORK!
Now then, most of the boring stuff is out of the way. Now what you need to do next, is hook up your database to the application, if you already have a database, awesome! Just enter the details in the db_connect file. (Don't worry, this application can't steal any passwords or other sensitive data), also make sure to import the sql file into your database, so you have the correct database structure installed. If you don't have a database, then I highly recommand you to look up a tutorial on how to install a mysql database on your system. Now all we need to do is run out application, simple! Double click the start.bat file OR write node . in your console. You will be granted a link, this link is used to authorize your application to look into your google calendar. Copy the link (Right click the console, press mark and highlight the link) and paste it into your browser, ez pz. Don't worry, you don't have to do this every single time, this is a one time thing. After this you are free to run the application as many times as you like!

(NOTE, I did not write all of this code myself. As you can probably tell, the code on https://developers.google.com/google-apps/calendar/quickstart/nodejs looks a lot like the one you just downloaded. All I did is modify the code a little bit so you are able to pull data from ALL your calendars rather than just 1. If you would like to change this, copy and paste the code from https://developers.google.com/google-apps/calendar/quickstart/nodejs into the index.js.)

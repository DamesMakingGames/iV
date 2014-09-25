# iV

A system for making synchronous, hackable, interactive narrative games. Currently in development by @jennie, @cecilycarver and @dann for Dames Making Games.

## Installation

0. Install [Node.js](http://nodejs.org)
1. In a Terminal window, create a new directory and navigate to it, then run the following commands:
2. `$ git clone git@github.com:bentobx/iV.git`
3. `$ npm install mongodb`
4. `$ npm install socket.io`
5. `$ node app.js`


In a Web browser, navigate to http://localhost:8808/

Need help? Tweet at [@jennie](http://twitter.com/jennie)

## Making Your First iV Game

1. Create a new game by giving it a name and clicking "Add"
2. Click the "Edit" button.

This is the game editing interface.

The start screen for your game has been automatically created. You can edit its name and properties by clicking on its thumbnail in the room list on the left.

## Room Types

iV games are made up of connecting "Rooms." The player navigates through these rooms by clicking (or tapping, on touch-screen devices) on specific areas of the screen.

There are three room types in iV: Image, Video, and Text.

### Image Room

Set the background image by pasting a URL in the **Image URL** field. You can optionally specify a thumbnail.

To add a hotspot, select an existing room from the drop down under "Add an Exit To:"

With the *image* room type, you add hotspots by adding graphic hotspots anywhere in your room.

### Text Room 

With the *text* room type, you add them with wiki-like notation: `[[Room To Link To:Text To Display]]`

Make text bold, italic, centered, red, whatever you want! Here you can also change an individual page’s background image.

### Video Room

With the *video* room type, you add hotspots by adding graphic hotspots anywhere in your room. (*We're currently adding the ability to animate hotspots so you can link them to moving objects in your animations/videos.*)

### Using Dropbox

When using Dropbox to host and serve your files, you need to use the public URL to the file, rather than the URL you get by selecting "Share Link."

The URL should look something like:
https://dl.dropboxusercontent.com/u/12345678/filename.gif

**NOT** like:
https://dl-web.dropbox.com/get/filename.gif ...

Add files to you "Public" folder. Right click and select "Copy public link" You can check to ensure the file is accessible by logging out of Dropbox in your browser and entering the full URL in your address bar. If it loads there, it will load in your game.

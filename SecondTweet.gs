// Grab a second tweet from a spreadsheet named after the current date, tweet it
// and move the sheet to the 'SecondTweets' folder.
function secondTweet() {
  
  try {
    filename = getCurrentDateString();
    var files = DriveApp.getFilesByName(filename);

    while (files.hasNext()) {
      var file = files.next();
      var spreadsheet = SpreadsheetApp.open(file);
      var sheet = spreadsheet.getSheets()[0];
      var range = sheet.getRange(1, 1);
      var values = range.getValues();
      
      var tweet = values[0][0]; 
      publishTweet(tweet);
      
      Logger.log(tweet);
      moveFileToFolder(spreadsheet, 'SecondTweets');
      
      break;
    }
  } catch (g)
  {
    // Also use MailApp to get email notifications of errors.
    MailApp.sendEmail('virtualista67@gmail.com', 'Error: secondTweet', g.toString());             
    Logger.log("Error (secondTweet): " + g.toString());    
  }
}


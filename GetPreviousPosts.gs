// Return a list of links matching the current date, which the bot has already posted
function getPreviousPosts(currentDateRegex, logSheet) {
  
  try {
    
    // var myDate = new Date();
    // var today = myDate.toISOString().slice(0, 10);
    // Logger.log("(getPreviousPosts): " + today);
    
    var sheet = logSheet.getSheets()[0];
    var height = sheet.getLastRow();
    
    var previous = [];
    
    for (i=2; i<=height; i++) {
      var range = sheet.getRange(i, 1, 1, 6);
      var values = range.getValues();
      var postDateEntry = values[0][0];
      var postDate = new Date(postDateEntry);
      var postDateString = postDate.toISOString().slice(0, 10);
      var shortUrl = values[0][3];
      Logger.log("(getPreviousPosts): " + postDateString + " - " + shortUrl); 

      var dateMatch = currentDateRegex.exec(postDateString);
      if (dateMatch != null) {
        Logger.log('*** Previous Post! ***');
        Logger.log("(getPreviousPosts): " + postDateString + " - " + shortUrl);
        previous.push(shortUrl);
      }
    }

    Logger.log("(getPreviousPosts) previousURLs: " + previous);
    return previous;
    
  } catch (g)
  {
    // Also use MailApp to get email notifications of errors.
    MailApp.sendEmail('virtualista67@gmail.com', 'Error: getPreviousPosts', g.toString());             
    Logger.log("Error (getPreviousPosts): " + g.toString());    
  }
}

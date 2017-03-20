// Helper function for sending tweets via the Twitter API
function publishTweet(tweet) {

  try {

    var props = PropertiesService.getScriptProperties();
  
    props.setProperties({
      TWITTER_CONSUMER_KEY: 'BZWDrb5HLaE0dqJw7QacmLmgN',
      TWITTER_CONSUMER_SECRET: '43rwOIhurN00OmBr433cGj5QTLwjR6MDCIulAQxoAP8MM7CiSw',
      TWITTER_ACCESS_TOKEN: '820395369414660096-z1DCjWQ5TgOnffLi4FlDYoKFuG0ghsA',
      TWITTER_ACCESS_SECRET: '0tJDrqGrUnPOOaKDcF3KLdeUKSkFzRpgnVj4FIcz2CSP6',
      MAX_TWITTER_ID: 0
    });

    var props = PropertiesService.getScriptProperties(),
    twit = new Twitterlib.OAuth(props);

    // Are the Twitter access tokens valid?
    if (twit.hasAccess()) {
      
      Logger.log('Bot has twitter access.');

      // The bot sends a tweet
      twit.sendTweet(tweet);
    }
  } catch (f) {

    var mess = f.toString() + '\n\nTweet: ' + tweet;
    
    // Also use MailApp to get email notifications of errors.
    MailApp.sendEmail('virtualista67@gmail.com', Error (publishTweet), mess)
        
    Logger.log("Error (publishTweet): " + mess);
  }
}

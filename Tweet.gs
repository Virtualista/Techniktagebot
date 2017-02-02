// Helper function for sending tweets via the Twitter API
function testTweet(tweet) {

  try {

    var props = PropertiesService.getScriptProperties();
  
    props.setProperties({
      TWITTER_CONSUMER_KEY: '',
      TWITTER_CONSUMER_SECRET: '',
      TWITTER_ACCESS_TOKEN: '',
      TWITTER_ACCESS_SECRET: ''
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

    // You can also use MailApp to get email notifications of errors.
    Logger.log("Error: " + f.toString());
  }
}

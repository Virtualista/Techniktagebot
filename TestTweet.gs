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
      
      Logger.log('Access!');

      twit.sendTweet(tweet);

//      // The bot sends a tweet
//      twit.sendTweet(tweets[i].answer, {
//        in_reply_to_status_id: tweets[i].id_str
//      });
    
    }
  } catch (f) {

    // You can also use MailApp to get email notifications of errors.
    Logger.log("Error: " + f.toString());
  }
}

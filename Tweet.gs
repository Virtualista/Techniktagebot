// Helper function for formatting tweets
function formatTweet(rand, matches, intros, data) {

  var match = matches[rand];
  var intro = intros[rand];
  
  var origLength = (intro + match.short_url).length + 1;    
  if (origLength > 140) {
    intro = intro.substring(0, 140 - match.short_url.length - 4);
    intro += '...';
  }
   
  sheet.appendRow(['']);
  sheet.appendRow([rand, intro, match.title, match.short_url, origLength]);
      
  var tweet = intro + ' ' + match.short_url;
  
  if (logSheet != null) {
    logSheet.appendRow([date, match.date, match.title, match.short_url, origLength, tweet, tweet.length, matches.length, data.response.blog.total_posts]);
  } else {
    Logger.log([date, match.date, match.title, match.short_url, origLength, tweet, tweet.length, matches.length, data.response.blog.total_posts]);
  }
  return tweet;
}


// Helper function for sending tweets via the Twitter API
function publishTweet(tweet) {

  try {

    var props = PropertiesService.getScriptProperties();
  
    props.setProperties({
      TWITTER_CONSUMER_KEY: '',
      TWITTER_CONSUMER_SECRET: '',
      TWITTER_ACCESS_TOKEN: '',
      TWITTER_ACCESS_SECRET: ''
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

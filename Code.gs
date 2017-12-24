var date = null;
var sheet = null;
var logSheet = null;

// The actual main function, which pulls all posts from Tumblr, parses their dates from
// the post titles, selects the ones matching the current date, randomly selects one,
// formats it as a tweet and posts that via the Twitter API.
function pullPostsFromTumblr() {
  
  try {
    
    date = new Date();
    var now = date.toDateString();
    Logger.log(now);

    // Also use MailApp to get email notifications of errors.
    MailApp.sendEmail('virtualista67@gmail.com', 'Started pullPostsFromTumblr ' + now, '');
    
    var year = date.getFullYear();
    var month = date.getMonth() + 1;  
    var day = date.getDate();
    
    if (month < 10) { month = '0' + month };
    if (day < 10) { day = '0' + day };
    var queryDateString = year + '-' + month + '-' + day;
    Logger.log('Current: ' + queryDateString);
    
    sheet = SpreadsheetApp.create('Techniktagebot-' + queryDateString, 50, 8); 
    sheet.appendRow(['#', 'Parsed', 'Title', 'Slug', 'Date', 'URL', 'Intro', 'Length']);
    
    logSheet = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1n95N2V93A8hWMt-1-ulpRLcz33iKFn2MjD7UBC8UmPw/edit#gid=0');
    
    var currentDateRegex = new RegExp('\([0-9]\{4\}\)\(-' + month + '-' + day + '\)');
    
    var numPosts = 50;
    var offset = 0;
    var increment = 50;
    var matches = [];
    var intros = [];
    var ages = [];
    
    // Obtain 50 posts per loop iteration from Tumblr.
    do {
      
      var url = 'https://api.tumblr.com/v2/blog/techniktagebuch.tumblr.com/posts/text?api_key=AqnjvP9btvvGKtQ4mFP5bmsgrQkLpZaFwhP5UY3ywaI4EODqSp' + 
        '&limit=' + numPosts +
        '&offset=' + offset;
      
      try {
        var response = UrlFetchApp.fetch(url);
        var data = JSON.parse(response);
      } catch (x) {
        // Also use MailApp to get email notifications of errors.
        MailApp.sendEmail('virtualista67@gmail.com', 'Error: fetch+parse', x.toString());
        Logger.log("Error fetch+parse: " + x.toString());            
      }
      
      Logger.log(data.meta);
      Logger.log(data.response.blog.title);
      Logger.log(data.response.blog.total_posts);
      
      // Parse the obtained posts.
      var i = 0;
      for (i=0; i<numPosts; i++) {
        
        var post = data.response.posts[i];
        if (post === undefined) {
          break;
        }
        
        var parsed = parseDate(post.title);
        
        // Try to get 'April 2016' posts, too, if their post.date matches the current date.
        // In that case, the post.date is parsed.
        if (parsed == 'No Match') {
          var parsedMonth = parseMonthDate(post.title);
          
          if (parsedMonth != 'No Match')
          {
            var parsedPostDate = parseDate(post.date);
            if (parsedPostDate.substr(0, 7) == parsedMonth)
            {
              parsed = parsedPostDate;
            }
          }      
        }

        // Now check for a match with the current date.
        var match = currentDateRegex.exec(parsed);
        if (match != null) {
          
          Logger.log('*** Match! ***');
          Logger.log('Post ' + (offset + i) + ':' + post.title);
          Logger.log(parsed);
          
          var years = year - match[1];
          var intro = 'Heute vor ';
          if (years == 0) {        
            continue;             // Don't post entries referring to the present day!
          } else if (years == 1) {        
            if (Math.random() < 0.05) {
              intro += '1 Jahr: ';
            } else {
              intro += 'einem Jahr: ';
            }
          } else {
            intro += years + ' Jahren: ';
          }
          
          matches.push(post);
          intro += extractHeadline(post);
          intros.push(intro);
          ages.push(years);

          // sheet.appendRow(['#', 'Parsed', 'Title', 'Slug', 'Date', 'URL', 'Intro', 'Length']);
          sheet.appendRow([offset + i, parsed, post.title, post.slug, post.date, post.short_url, intro, (intro + post.short_url).length + 1]);
        }
      }
      
      offset += increment;
      Logger.log('Offset: ' + offset);
    }
    while (offset < data.response.blog.total_posts);
    
    // Select one of the posts with matching dates and tweet it.
    if (matches.length > 0) {

      var rand = selectWeightedMatch(matches, ages);
      var tweet = formatTweet(rand, matches, intros, data);
      
      publishTweet(tweet);
      
      var rand2 = selectWeightedMatch(matches, ages);
      if (matches.length >= 10 && rand2 != rand) {

        tweet = formatTweet(rand2, matches, intros, data);
        
//        subject = 'TestCode ' + queryDateString + ' ' + data.response.blog.total_posts + ' Posts';
//        MailApp.sendEmail('virtualista67@gmail.com', subject, tweet);
        
        var secondSheet = SpreadsheetApp.create(queryDateString); 
        secondSheet.appendRow([tweet]);
      }      
    } else {
      
      logSheet.appendRow([date, '', '', '', 0, '', 0, matches.length, data.response.blog.total_posts]);
    }
  }
  catch (g)
  {
    // Also use MailApp to get email notifications of errors.
    MailApp.sendEmail('virtualista67@gmail.com', 'Error: pullPostsFromTumblr', g.toString());     
    Logger.log("Error (pullPostsFromTumblr): " + g.toString());    
  }
  
  moveFileToFolder(sheet, 'Logs');

  date = new Date();
  now = date.toDateString();
  Logger.log('Finished: ' + date);
}

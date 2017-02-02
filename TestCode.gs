// Test version of pullPostsFromTumblr(), which performs everything in the same fashion,
// but logs to different spreadsheets and sends a mail instead of twittering.
function testPullPostsFromTumblr() {
  
  // Create a new Google Doc named after blog and #posts
  // var doc = DocumentApp.create('Techniktagebuch');

  var sheet = SpreadsheetApp.create('Techniktagebot-Test', 50, 8); 
  sheet.appendRow(['#', 'Parsed', 'Title', 'Slug', 'Date', 'URL', 'Intro', 'Length']);

  // var logSheet = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1n95N2V93A8hWMt-1-ulpRLcz33iKFn2MjD7UBC8UmPw/edit#gid=0');
  
  var date = new Date();
  var now = date.toDateString();
  Logger.log(now);
    
  var year = date.getFullYear();
  var month = 1; // date.getMonth() + 1;  
  var day = 26; // date.getDate();

  if (month < 10) { month = '0' + month };
  if (day < 10) { day = '0' + day };
  Logger.log('Current: ' + year + '-' + month + '-' + day);
    
  var currentDateRegex = new RegExp('\([0-9]\{4\}\)\(-' + month + '-' + day + '\)');

  var numPosts = 50;
  var offset = 0;
  var increment = 50;
  var par = '';
  var matches = [];
  var intros = [];

  do {

    var url = 'https://api.tumblr.com/v2/blog/techniktagebuch.tumblr.com/posts/text?api_key=AqnjvP9btvvGKtQ4mFP5bmsgrQkLpZaFwhP5UY3ywaI4EODqSp' + 
      '&limit=' + numPosts +
      '&offset=' + offset;
    var response = UrlFetchApp.fetch(url);
   
    var data = JSON.parse(response);
    
    Logger.log(data.meta);
    Logger.log(data.response.blog.title);
    Logger.log(data.response.blog.total_posts);
    
    var i = 0;
    for (i=0; i<numPosts; i++) {
      
      var post = data.response.posts[i];
      if (post === undefined) {
        break;
      }
      
      var parsed = parseDate(post.title);
      
      var match = currentDateRegex.exec(parsed);
      if (match != null) {
      
        matches.push(post);
        
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
        
        var headline = headlineRegex.exec(post.body);
        if (headline != null)
        {
          var special = htmlRegExp.exec(headline[1]);
          if (special != null)
          { 
            headline[1] = decodeHTML(headline[1]);
          } 
          intro += headline[1].trim();
        }
        intros.push(intro);
        
        par += intro + '\n';
        par += 'Post ' + (offset + i) + ':\n';
        par += post.title + ' - ' + post.short_url + '\n';
        par += parsed + '\n\n';

        // sheet.appendRow(['#', 'Parsed', 'Title', 'Slug', 'Date', 'URL', 'Intro', 'Length']);
        sheet.appendRow([offset + i, parsed, post.title, post.slug, post.date, post.short_url, intro, (intro + post.short_url).length + 1]);
      }
    }
    
    offset += increment;
    Logger.log('Offset: ' + offset);
  }
  while (offset < data.response.blog.total_posts);
  
  if (matches.length > 0) {
    var rand = Math.floor(Math.random() * matches.length);
    var mx = matches[rand];
    var origLength = (intros[rand] + mx.short_url).length + 1;
  
    sheet.appendRow(['']);
    sheet.appendRow([rand, intros[rand], mx.title, mx.short_url, origLength]);
  
    if (origLength > 140) {
      intros[rand] = intros[rand].substring(0, 140 - mx.short_url.length - 4);
      intros[rand] += '...';
    }
    
    var tweet = intros[rand] + ' ' + mx.short_url;
    // testTweet(tweet);
    
    var subject = 'TestCode ' + now + ' ' + data.response.blog.total_posts + ' Posts';
    MailApp.sendEmail('virtualista67@gmail.com', subject, tweet)
    
    Logger.log(subject + ' ' + tweet);
    // logSheet.appendRow([date, mx.date, mx.title, mx.short_url, origLength, tweet, tweet.length]);
  }
  
  date = new Date();
  now = date.toDateString();
  Logger.log('Finished: ' + date);
  
  // Access the body of the document, then add a paragraph.
  // doc.getBody().appendParagraph(par);
  // doc.setName(now + ' ' + data.response.blog.title + ' ' + data.response.blog.total_posts);
}

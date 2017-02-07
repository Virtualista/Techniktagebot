
// 2017-03-21 or 2017-3-21
var dateRegex1 = new RegExp(/([0-9]{4})-([0-9]?[0-9])-([0-9]?[0-9])/);
// 21. März 2017 or 21.März 2017
var dateRegex2 = new RegExp(/([0-9]?[0-9])\. ?([\wä]+) ([0-9]{4})/);
// 21.03.2017 or 21. 03. 2017 (it seems we must catch weird whitespace here)
var dateRegex3 = new RegExp(/([0-9]?[0-9])\.\s*([0-9]?[0-9])\.\s*([0-9]{4})/);

var monthRegexes = [ new RegExp(/Januar|Jänner/i), new RegExp(/Februar/i), new RegExp(/März/i),
                     new RegExp(/April/i), new RegExp(/Mai/i), new RegExp(/Juni/i),
                     new RegExp(/Juli/i), new RegExp(/August/i), new RegExp(/September/i),
                     new RegExp(/Oktober/i), new RegExp(/November/i), new RegExp(/Dezember/i) ];
var monthStrings = [ "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12" ];

var headlineRegex = new RegExp(/<h2>(.*)<\/h2>/);
var htmlRegExp = new RegExp(/&.*;/);


// Parse date strings and return their ISO format equivalent strings,
// e.g. '21. Januar 2015' => '2015_01-21'
function parseDate(title) {
  var m = dateRegex1.exec(title);

  if (m != null) {

    if (m[1].length == 1) { m[1] = '0' + m[1] };
    if (m[2].length == 1) { m[2] = '0' + m[2] };

    return m[1] + '-' + m[2] + '-' + m[3]; 
  }

  m = dateRegex2.exec(title);
  
  if (m != null) {

    if (m[1].length == 1) { m[1] = '0' + m[1] };
    
    var k;
    for (k = 0; k < 12; k++) {
      
      if (monthRegexes[k].exec(m[2]) != null) {

        return m[3] + '-' + monthStrings[k] + '-' + m[1]; 
      }
    }

    return m[3] + '-' + m[2] + '-' + m[1]; 
  }
  
  m = dateRegex3.exec(title);

  if (m != null) {

    if (m[2].length == 1) { m[2] = '0' + m[2] };
    if (m[3].length == 1) { m[3] = '0' + m[3] };

    return m[3] + '-' + m[2] + '-' + m[1]; 
  }

  return 'No Match';
}

// The actual main function, which pulls all posts from Tumblr, parses their dates from
// the post titles, selects the ones matching the current date, randomly selects one,
// formats it as a tweet and posts that via the Twitter API.
function pullPostsFromTumblr() {
  
  try {
    
    var date = new Date();
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
    
    var sheet = SpreadsheetApp.create('Techniktagebot-' + queryDateString, 50, 8); 
    sheet.appendRow(['#', 'Parsed', 'Title', 'Slug', 'Date', 'URL', 'Intro', 'Length']);
    
    var logSheet = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1n95N2V93A8hWMt-1-ulpRLcz33iKFn2MjD7UBC8UmPw/edit#gid=0');
    
    var currentDateRegex = new RegExp('\([0-9]\{4\}\)\(-' + month + '-' + day + '\)');
    
    var numPosts = 50;
    var offset = 0;
    var increment = 50;
    var par = '';
    var matches = [];
    var intros = [];
    
    do {
      
      var url = 'https://api.tumblr.com/v2/blog/techniktagebuch.tumblr.com/posts/text?api_key=' + 
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
          
          if (parsedMonth != null)
          {
            var parsedString = parsedMonth[2] + '-' + parsedMonth[1];
            var parsedPostDate = parseDate(post.date);
            if (parsedPostDate.substr(0, 7) == parsedString)
            {
              parsed = parsedPostDate;
            }
          }      
        }

        // Now check for a match with the current date.
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
            headline[1] = headline[1].replace('<br/>', '');
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
      
      logSheet.appendRow([date, mx.date, mx.title, mx.short_url, origLength, tweet, tweet.length, matches.length, data.response.blog.total_posts]);
      publishTweet(tweet);
      
    } else {
      
      logSheet.appendRow([date, mx.date, '', '', 0, '', 0, matches.length, data.response.blog.total_posts]);
    }
  } catch (g)
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

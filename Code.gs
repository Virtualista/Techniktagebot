
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

// This function replaces HTML codes for special characters, which may occur in post titles,
// with their literal equivalents, e.g. &euro; => €
function decodeHTML(special) {
  var map = {"amp":"&", "hellip":"…",
             "lsquo":"‘", "rsquo":"’", "ldquo":"“", "rdquo":"”",
             "quot":"\"", "lanquo":"«", "ranquo":"»",
             "frac14":"¼", "frac12":"½", "frac34":"¾",
             "sup2":"²", "sup3":"³",
             "copy":"©", "euro":"€",
             "gt":">", "lt":"<"
            };
    return special.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z1-4]+);?/gi, function($0, $1) {
        if ($1[0] === "#") {
            return String.fromCharCode($1[1].toLowerCase() === "x" ? parseInt($1.substr(2), 16)  : parseInt($1.substr(1), 10));
        } else {
            return map.hasOwnProperty($1) ? map[$1] : $0;
        }
    });
}

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
  
  // Create a new Google Doc named after blog and #posts
  // var doc = DocumentApp.create('Techniktagebuch');

  var sheet = SpreadsheetApp.create('Techniktagebot', 50, 8); 
  sheet.appendRow(['#', 'Parsed', 'Title', 'Slug', 'Date', 'URL', 'Intro', 'Length']);

  var logSheet = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1n95N2V93A8hWMt-1-ulpRLcz33iKFn2MjD7UBC8UmPw/edit#gid=0');
  
  var date = new Date();
  var now = date.toDateString();
  Logger.log(now);
    
  var year = date.getFullYear();
  var month = date.getMonth() + 1;  
  var day = date.getDate();

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

    var url = 'https://api.tumblr.com/v2/blog/techniktagebuch.tumblr.com/posts/text?api_key=...' + 
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
    
    publishTweet(tweet);
    logSheet.appendRow([date, mx.date, mx.title, mx.short_url, origLength, tweet, tweet.length, matches.length, data.response.blog.total_posts]);
  }
}

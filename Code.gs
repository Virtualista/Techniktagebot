
// 2017-03-21
var dateRegex1 = new RegExp(/([0-9]{4})-([0-9]?[0-9])-([0-9]?[0-9])/);
// 21. März 2017
var dateRegex2 = new RegExp(/([0-9]?[0-9])\. ([\wä]+) ([0-9]{4})/);
// 21.03.2017
var dateRegex3 = new RegExp(/([0-9]?[0-9])\.([0-9]?[0-9])\.([0-9]{4})/);

var headlineRegex = new RegExp(/<h2>(.*)<\/h2>/);

function parseDate(title) {
  var m = dateRegex1.exec(title);

  if (m != null) {

    if (m[2].length == 1) { m[2] = '0' + m[2] };
    if (m[3].length == 1) { m[3] = '0' + m[3] };

    return m[1] + '-' + m[2] + '-' + m[3]; 
  }

  m = dateRegex2.exec(title);
  
  if (m != null) {
    
    if (m[2].length > 2) { m[2] = m[2].replace(/Januar/ig, "01"); }
    if (m[2].length > 2) { m[2] = m[2].replace(/Februar/ig, "02") };
    if (m[2].length > 2) { m[2] = m[2].replace(/März/ig, "03") };
    if (m[2].length > 2) { m[2] = m[2].replace(/April/ig, "04") };
    if (m[2].length > 2) { m[2] = m[2].replace(/Mai/ig, "05") };
    if (m[2].length > 2) { m[2] = m[2].replace(/Juni/ig, "06") };
    if (m[2].length > 2) { m[2] = m[2].replace(/Juli/ig, "07") };
    if (m[2].length > 2) { m[2] = m[2].replace(/August/ig, "08") };
    if (m[2].length > 2) { m[2] = m[2].replace(/September/ig, "09") };
    if (m[2].length > 2) { m[2] = m[2].replace(/Oktober/ig, "10") };
    if (m[2].length > 2) { m[2] = m[2].replace(/November/ig, "11") };
    if (m[2].length > 2) { m[2] = m[2].replace(/Dezember/ig, "12") };

    if (m[1].length == 1) { m[1] = '0' + m[1] };

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


function pullPostsFromTumblr() {
  
  // Create a new Google Doc named after blog and #posts
  // var doc = DocumentApp.create('Techniktagebuch');

  var sheet = SpreadsheetApp.create('Techniktagebot', 5000, 7); 
  sheet.appendRow(['#', 'Parsed', 'Title', 'Slug', 'Date', 'URL', 'Intro', 'Length']);

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
        if (years == 1) {        
          intro += 'einem Jahr: ';
        } else {
          intro += years + ' Jahren: ';
        }
        
        var headline = headlineRegex.exec(post.body);
        if (headline != null) {
          intro += headline[1];
        }
        intros.push(intro);
        
        par += intro + '\n';
        par += 'Post ' + (offset + i) + ':\n';
        par += post.title + ' - ' + post.short_url + '\n';
        par += parsed + '\n\n';

        // sheet.appendRow(['#', 'Parsed', 'Title', 'Slug', 'Date', 'URL', 'Intro', 'Length']);
        sheet.appendRow([offset + i, parsed, post.title, post.slug, post.date, post.short_url, intro, (intro + post.short_url).length]);
      }
    }
    
    offset += increment;
    Logger.log(offset);
  }
  while (offset < data.response.blog.total_posts);
  
  var rand = Math.floor(Math.random() * matches.length);
  sheet.appendRow(['']);
  sheet.appendRow([rand, intros[rand], matches[rand].title, matches[rand].short_url, (intros[rand] + matches[rand].short_url).length]);

  // Access the body of the document, then add a paragraph.
  // doc.getBody().appendParagraph(par);
  // doc.setName(now + ' ' + data.response.blog.title + ' ' + data.response.blog.total_posts);
}

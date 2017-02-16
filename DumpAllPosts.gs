// Test code for pulling all posts from Tumblr and dumping them into a spreadsheet
// named "TT-Posts YYYY-MM-DD".

function dumpAllPostsFromTumblr()
{
  var numPosts = 50;
  var offset = 2526;
  var increment = 50;

  var date = new Date();
  var now = date.toDateString();
  Logger.log(now);
  
  var year = date.getFullYear();
  var month = date.getMonth() + 1;  
  var day = date.getDate();
  
  if (month.length == 1) { month = '0' + month };
  if (day.length == 1) { day = '0' + day };
  Logger.log('Current: ' + year + '-' + month + '-' + day);

  var sheet = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1Jw_CuN1X8tODnTsNiLBaGg2LUwloUpJemVUQKG7_ujw/edit#gid=0'); 
  // var sheet = SpreadsheetApp.create('TT-Posts ' + year + '-' + month + '-' + day, 5000, 8); 
  // sheet.appendRow(['#', 'Parsed', 'Title', 'Date', 'URL', '#Notes', 'Headline', 'Tags']);

  do {
    var url = 'https://api.tumblr.com/v2/blog/techniktagebuch.tumblr.com/posts/text?api_key=AqnjvP9btvvGKtQ4mFP5bmsgrQkLpZaFwhP5UY3ywaI4EODqSp' + 
      '&limit=' + numPosts +
      '&offset=' + offset;
    var response = UrlFetchApp.fetch(url);
   
    var data = JSON.parse(response);
    
    var i = 0;
    for (i=0; i<numPosts; i++) {
      
      var post = data.response.posts[i];
      if (post === undefined) {
        break;
      }
      
      var parsed = parseDayDate(post.title);
      var parsedString = "";

      if (parsed == null) {
        var parsedMonth = parseMonthDate(post.title);
        
        if (parsedMonth != null) {
          parsedString = parsedMonth[2] + '-' + parsedMonth[1];
        }
      } else {
        parsedString = parsed[3] + '-' + parsed[2] + '-' + parsed[1];
      }
      
      var head = extractHeadline(post);
      sheet.appendRow([offset + i, parsedString, post.title, post.date, post.short_url, post.note_count, head, post.tags.toString()]);
    }
    
    offset += increment;
  }
  while (offset < data.response.blog.total_posts);
  
  date = new Date();
  now = date.toDateString();
  Logger.log('Finished successfully ' + now);
}

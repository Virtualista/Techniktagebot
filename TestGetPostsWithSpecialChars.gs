// Test code for finding posts with HtML-formated special characters in their headline.
var headlineRegex = new RegExp(/<h2>(.*)<\/h2>/);


function getPostsWithSpecialChars() {
  
  // Create a new Google Doc named after blog and #posts
  // var doc = DocumentApp.create('Techniktagebuch');
  
//  var sheet = SpreadsheetApp.create('TT-Posts', 5000, 6); 
//  sheet.appendRow(['#', 'Parsed', 'Title', 'Date', 'URL']);

//  var sheetMatching = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/14ARNg2VZSIM4wa26Ae6PK0EoUG8MROVw1sNLRbd3k-M/edit#gid=0'); 
//  var sheetNonMatching = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1mDzu_J-q74Ie2-iuA8Uah8Tbg2CIJbFEo8BqRLhm9zc/edit#gid=0'); 
//  var sheetUnclear = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1l88529PJoKCJR_orb4llGwxdmWRRFIeRDwLa9TqCXRY/edit#gid=0'); 

  var sheetMatching = SpreadsheetApp.create('TT-Posts Matching Titles'); 
//  var sheetNonMatching = SpreadsheetApp.create('TT-Posts Non-Matching Dates'); 
//  var sheetMonth = SpreadsheetApp.create('TT-Posts Month Dates'); 
//  var sheetUnclear = SpreadsheetApp.create('TT-Posts Unclear Dates'); 

  var numPosts = 50;
  var offset = 0;
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

  do {
    
    var url = 'https://api.tumblr.com/v2/blog/techniktagebuch.tumblr.com/posts/text?api_key=AqnjvP9btvvGKtQ4mFP5bmsgrQkLpZaFwhP5UY3ywaI4EODqSp' + 
      '&limit=' + numPosts +
      '&offset=' + offset;
    var response = UrlFetchApp.fetch(url);
   
    var data = JSON.parse(response);
    
//    var par = "";
    var i = 0;
    for (i=0; i<numPosts; i++) {
      
      var post = data.response.posts[i];
      if (post === undefined) {
        break;
      }
      
      var headline = headlineRegex.exec(post.body);
      if (headline != null) {
        
        var special = htmlRegExp.exec(headline[1]);
        if (special != null)
        {
          sheetMatching.appendRow([offset + i, post.title, post.date, headline[1].trim(), decodeHTML(headline[1]), post.short_url]);          
        }
      }
    }
    // Access the body of the document, then add a paragraph.
    // doc.getBody().appendParagraph(par);
    
    offset += increment;
  }
  while (offset < data.response.blog.total_posts);
  
  // doc.setName(data.response.blog.title + ' ' + data.response.blog.total_posts + ' ' + now);
  date = new Date();
  now = date.toDateString();
  Logger.log('Finished successfully ' + now);
}

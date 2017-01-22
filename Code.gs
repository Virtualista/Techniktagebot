
// 2017-03-21
var dateRegex1 = new RegExp(/([0-9]{4})-([0-9]?[0-9])-([0-9]?[0-9])/);
// 21. März 2017
var dateRegex2 = new RegExp(/([0-9]?[0-9])\. ([\wä]+) ([0-9]{4})/);
// 21.03.2017
var dateRegex3 = new RegExp(/([0-9]?[0-9])\.([0-9]?[0-9])\.([0-9]{4})/);

function parseDate(title) {
  var m = dateRegex1.exec(title);

  if (m != null) {
    
    // var s = "Match 1 at position " + m.index + ":\n";
    // for (j = 0; j < m.length; j++) {
    //  s = s + m[j] + " -- ";
    // }
    // Logger.log(s + "\n");

    return m[0];
  }

  m = dateRegex2.exec(title);
  
  if (m != null) {
    
    // var s = "Match 2 at position " + m.index + ":\n";
    // for (j = 0; j < m.length; j++) {
    //  s = s + m[j] + " -- ";
    // }
    // Logger.log(s + "\n");
    
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
    
    // s = "Match 3 at position " + m.index + ":\n";
    // for (j = 0; j < m.length; j++) {
    //  s = s + m[j] + " -- ";
    // }
    // Logger.log(s + "\n");

    if (m[2].length == 1) { m[2] = '0' + m[2] };
    if (m[3].length == 1) { m[3] = '0' + m[3] };

    return m[3] + '-' + m[2] + '-' + m[1]; 
  }

  return 'No Match';
}


function pullPostsFromTumblr() {
  
  // Create a new Google Doc named after blog and #posts
  // var doc = DocumentApp.create('Techniktagebuch');
  
  var sheet = SpreadsheetApp.create('TT-Posts', 5000, 6); 
  sheet.appendRow(['#', 'Parsed', 'Title', 'Slug', 'Date', 'URL']);

  var numPosts = 50;
  var offset = 3000;
  var increment = 50;

  do {
    var date = new Date();
    var now = date.toDateString();
    Logger.log(now);
    
    var year = date.getUTCFullYear();
    var month = date.getUTCMonth() + 1;
    var day = date.getUTCDate();
    Logger.log(year + '-' + month + '-' + day);
    
    // doc.getBody().appendParagraph(now + ' ' + year + '-' + month + '-' + day);
    
    var url = 'https://api.tumblr.com/v2/blog/techniktagebuch.tumblr.com/posts/text?api_key=AqnjvP9btvvGKtQ4mFP5bmsgrQkLpZaFwhP5UY3ywaI4EODqSp' + 
      '&limit=' + numPosts +
      '&offset=' + offset;
    var response = UrlFetchApp.fetch(url);
    
    //  var response = UrlFetchApp.fetch('http://api.tumblr.com/v2/tagged?tag=virtualista&api_key=AqnjvP9btvvGKtQ4mFP5bmsgrQkLpZaFwhP5UY3ywaI4EODqSp');
    // Logger.log(response);
    
    var data = JSON.parse(response);
    
    Logger.log(data.meta);
    Logger.log(data.response.blog.title);
    Logger.log(data.response.blog.total_posts);
    
    var par = "";
    var i = 0;
    for (i=0; i<numPosts; i++) {
      
      var post = data.response.posts[i];
      if (post === undefined) {
        break;
      }
      
      var parsed = parseDate(post.title);

      // par += offset + i + ': ' + parsed + '\n';
      // var line = data.response.posts[i].slug + ' : ' + data.response.posts[i].title +
      //   ' : ' + data.response.posts[i].date + ' : ' + data.response.posts[i].short_url;
      // Logger.log(line);
      // par += line + '\n\n';
      
      // sheet.appendRow(['#', 'Parsed', 'Title', 'Slug', 'Date', 'URL']);
      sheet.appendRow([offset + i, parsed, post.title, post.slug, post.date, post.short_url]);
    }

    // Access the body of the document, then add a paragraph.
    // doc.getBody().appendParagraph(par);
    
    offset += increment;
    Logger.log(offset);
  }
  while (offset < data.response.blog.total_posts);
    
  // doc.setName(data.response.blog.title + ' ' + data.response.blog.total_posts + ' ' + now);
}

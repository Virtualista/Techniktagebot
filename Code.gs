
function parseDate(title) {

  // 21. März 2017
  var dateRegex1 = new RegExp(/([0-9]?[0-9])\. ([\wä]+) ([0-9]{4})/);
  var m = dateRegex1.exec(title);
  
  if (m != null) {
    
    var s = "Match 1 at position " + m.index + ":\n";
    for (j = 0; j < m.length; j++) {
      s = s + m[j] + " -- ";
    }

    Logger.log(s + "\n");
    
    m[2] = m[2].replace(/Januar/ig, "01");
    m[2] = m[2].replace(/Februar/ig, "02");
    m[2] = m[2].replace(/März/ig, "03");
    m[2] = m[2].replace(/April/ig, "04");
    m[2] = m[2].replace(/Mai/ig, "05");
    m[2] = m[2].replace(/Juni/ig, "06");
    m[2] = m[2].replace(/Juli/ig, "07");
    m[2] = m[2].replace(/August/ig, "08");
    m[2] = m[2].replace(/September/ig, "09");
    m[2] = m[2].replace(/Oktober/ig, "10");
    m[2] = m[2].replace(/November/ig, "11");
    m[2] = m[2].replace(/Dezember/ig, "12");

    if (m[1].length == 1) { m[1] = '0' + m[1] };

    return m[3] + '-' + m[2] + '-' + m[1]; 
  }
  
  var dateRegex2 = new RegExp(/([0-9]?[0-9])\.([0-9]?[0-9])\.([0-9]{4})/);
  
  var dateRegex3 = new RegExp(/([0-9]{4})-([0-9]?[0-9])-([0-9]?[0-9])/);

  return 'No Match';
}


function pullPostsFromTumblr() {
  
  // Create a new Google Doc named after blog and #posts
  var doc = DocumentApp.create('Techniktagebuch');

  var numPosts = 50;
  var offset = 0;
  var increment = 50;

  do {
    var date = new Date();
    var now = date.toDateString();
    Logger.log(now);
    
    var year = date.getUTCFullYear();
    var month = date.getUTCMonth() + 1;
    var day = date.getUTCDate();
    Logger.log(year + '-' + month + '-' + day);
    
    doc.getBody().appendParagraph(now + ' ' + year + '-' + month + '-' + day);
    
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
      
      if (data.response.posts[i] === undefined) {
        break;
      }
      
      var parsed = parseDate(data.response.posts[i].title);

      var line = data.response.posts[i].slug + ' : ' + data.response.posts[i].title +
         ' : ' + data.response.posts[i].date + ' : ' + data.response.posts[i].short_url;
      Logger.log(line);
      
      par += line + '\n';
      par += i + ': ' + parsed + '\n\n';
    }

    // Access the body of the document, then add a paragraph.
    doc.getBody().appendParagraph(par);
    
    offset += increment;
    Logger.log(offset);
  }
  while (offset < 100);
  // while (numPosts < data.response.blog.total_posts);
    
  doc.setName(data.response.blog.title + ' ' + data.response.blog.total_posts + ' ' + now);
}

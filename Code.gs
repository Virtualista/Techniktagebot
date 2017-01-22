
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
    // Browser.msgBox(data.title);
    
    Logger.log(data.meta);
    Logger.log(data.response.blog.title);
    Logger.log(data.response.blog.total_posts);
    
    var par = "";
    
    for (i=0; i<numPosts; i++) {
      // Logger.log(data.response.posts[i].slug);
      // Logger.log(data.response.posts[i].title);
      
      var line = data.response.posts[i].slug + ' : ' + data.response.posts[i].title +
         ' : ' + data.response.posts[i].date + ' : ' + data.response.posts[i].short_url;
      Logger.log(line);
      
      par += line + '\n';
    }

    // Access the body of the document, then add a paragraph.
    doc.getBody().appendParagraph(par);
    
    doc.setName(data.response.blog.title + ' ' + data.response.blog.total_posts);
    
    offset += increment;
    Logger.log(offset);
  }
  while (numPosts < data.response.blog.total_posts);
}

var currentDateRegex = null;
var year = null;

// Get the current date formatted as e.g. "2017-03-21" (ISO)
function getCurrentDateString()
{
  var date = new Date();
  var now = date.toDateString();
  
  year = date.getFullYear();
  var month = date.getMonth() + 1;  
  var day = date.getDate();
  
  if (month < 10) { month = '0' + month };
  if (day < 10) { day = '0' + day };

  currentDateRegex = new RegExp('\([0-9]\{4\}\)\(-' + month + '-' + day + '\)');
  
  return year + '-' + month + '-' + day;
}


// Extract and format post headline
function extractHeadline(post)
{
  var headline = headlineRegex.exec(post.body);
  if (headline != null)
  {
    var special = htmlRegExp.exec(headline[1]);
    if (special != null)
    { 
      headline[1] = decodeHTML(headline[1]);
    } 
    headline[1] = headline[1].replace('<br/>', '');
    return headline[1].trim();
  }
  return '';
}


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


// Since docs and spreadsheets can only be created on the root level, this function serves
// to move them to a sub-folder
function moveFileToFolder(file, folderName)
{
  var folders = DriveApp.getFoldersByName(folderName);
  // var file = SpreadsheetApp.create(fileName);
  var copyFile = DriveApp.getFileById(file.getId());

  if (folders.hasNext()) {
    var folder = folders.next();
    folder.addFile(copyFile);
    DriveApp.getRootFolder().removeFile(copyFile);
  }
}

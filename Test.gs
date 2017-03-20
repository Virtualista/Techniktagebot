// Some code for testing

function testParseDates(line) {

  var dateRegex1 = new RegExp(/([0-9]?[0-9])\. ([\wä]+) ([0-9]{4})/);
  var m = dateRegex1.exec(line);
  
  var dateRegex2 = new RegExp(/([0-9]?[0-9])\.([0-9]?[0-9])\.([0-9]{4})/);
  
  var dateRegex3 = new RegExp(/([0-9]{4})-([0-9]?[0-9])-([0-9]?[0-9])/);
  
  if (m == null) {
    Logger.log("No match");
  } else {
    var s = "Match at position " + m.index + ":\n";
    for (i = 0; i < m.length; i++) {
      s = s + m[i] + " -- ";
    }
    Logger.log(s + "\n");
  }

  return m;
}

function testDateParsing() {
  
  // Determine latest Google Doc
  var doc = DocumentApp.openByUrl('https://docs.google.com/document/d/1MP862uJpKRE69Jt9IdoU47MbNAFX9aUGekNgU2_QeS0/edit');

  // Read a line
  var body = doc.getBody();
  
  var pars = body.getParagraphs();
  var numPosts = pars.length;
  
  for (i=0; i<numPosts; i++) {

    var text = pars[i].getText();
    // Logger.log(text);

    // Parse dates
    testParseDates(text);
  }
}


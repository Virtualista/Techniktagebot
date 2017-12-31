
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

    if (m[2].length == 1) { m[2] = '0' + m[2] };
    if (m[3].length == 1) { m[3] = '0' + m[3] };

    return m[1] + '-' + m[2] + '-' + m[3]; 
  }

  m = dateRegex2.exec(title);
  
  if (m != null) {

    if (m[1].length == 1) { m[1] = '0' + m[1] };
    
    for (var k = 0; k < 12; k++) {
      
      if (monthRegexes[k].exec(m[2]) != null) {

        return m[3] + '-' + monthStrings[k] + '-' + m[1]; 
      }
    }

    return m[3] + '-' + m[2] + '-' + m[1]; 
  }
  
  m = dateRegex3.exec(title);

  if (m != null) {

    if (m[1].length == 1) { m[1] = '0' + m[1] };
    if (m[2].length == 1) { m[2] = '0' + m[2] };

    return m[3] + '-' + m[2] + '-' + m[1]; 
  }

  return 'No Match';
}


// März 2017
var dateRegex4 = new RegExp(/([\wä]+) ([0-9]{4})/);

function parseMonthDate(title)
{
  m = dateRegex4.exec(title);
  
  if (m != null) {
    
    for (var k = 0; k < 12; k++) {
      
      if (monthRegexes[k].exec(m[1]) != null) {

        return m[2] + '-' + monthStrings[k]; 
      }
    }
  }

  return 'No Match';
}

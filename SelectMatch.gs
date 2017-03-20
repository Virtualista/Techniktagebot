// Select matches weighted by sqrt(age) 
function selectWeightedMatch(matches, ages)
{
  var weightedAges = [];
  var weightedSum = 0;
  
  for (var i=0; i<ages.length; i++) {
    var sqrt = Math.sqrt(ages[i]);
    weightedAges.push(sqrt);
    weightedSum += sqrt;
  }
  
  var rnd = Math.floor(Math.random() * weightedSum);
  
  Logger.log('Matches ' + matches.length + ' ageSum ' + weightedSum + ' rand ' + rnd);
  
  var sum = 0;
  for (i=0; i<matches.length; i++) {
    sum += weightedAges[i];
    if (sum > rnd) {
      break;
    }
  }
  
  Logger.log('Index ' + i);
  return i;
}


// Select matches weighted by age 
function selectMatch(matches, ages, ageSum)
{
  var rnd = Math.floor(Math.random() * ageSum);
  
  Logger.log('Matches ' + matches.length + ' ageSum ' + ageSum + ' rand ' + rnd);
  
  var sum = 0;
  for (var i=0; i<matches.length; i++) {
    sum += ages[i];
    if (sum > rnd) {
      break;
    }
  }
  
  Logger.log('Rand ' + i);
  return i;
}

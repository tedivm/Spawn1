
Number.prototype.toAbbreviated = function() {

  if(this > Math.pow(10, 12)) {
    var divisor = Math.pow(10, 12)
    var unit = 'T'
  } else if(this > Math.pow(10, 9)) {
    var divisor = Math.pow(10, 9)
    var unit = 'B'
  } else if(this > Math.pow(10, 6)) {
    var divisor = Math.pow(10, 6)
    var unit = 'M'
  } else if(this > Math.pow(10, 3)) {
    var divisor = Math.pow(10, 3)
    var unit = 'K'
  } else {
    var divisor = 1
    var unit = ''
  }

  return ((this / divisor).toPrecision(3)) + unit
}

function typeOf( obj ) {
  return ({}).toString.call( obj ).match(/\s(\w+)/)[1].toLowerCase();
}

function checkTypes( args, types ) {
  args = [].slice.call( args );
  for ( var i = 0; i < types.length; ++i ) {
    if ( typeOf( args[i] ) != types[i] ) {
      throw new TypeError( 'param '+ i +' must be of type '+ types[i] );
    }
  }
}

function roundNumber(number, decimals=8) {
  var factor = Math.pow(10, decimals);
  return Math.round(number * factor) / factor;
}

module.exports = {
  typeOf: typeOf,
  checkTypes: checkTypes,
  roundNumber: roundNumber,
}

/*
 * The library file for holding function to be tested using test runner
 *
 */

//instantiate the lib object
const lib = {};

const alphabets = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

// returns a number which is the sum of positions of all the characters in the string, example apple => 50
lib.getNumberForTheString = function(str){
  if(str && str.length) {
    const reducer = (accumulator, currentAlphabet) => accumulator + alphabets.indexOf(currentAlphabet) + 1;

    return str.toLowerCase().split('').reduce(reducer, 0);
  }
  return 0;
}

// forms a new string with mapped with characters 3 positions from each alphabet in the order. example santhosh => vdqwkrvk
lib.jumbleString = function(str){
  if(str && str.length) {
    return str.toLowerCase().split('').map(alphabet => {
      const index = alphabets.indexOf(alphabet); // find the current index of the alphabet
      let newIndex = index + 3; // calculate the new index which is 3 positions from current index.
      if(newIndex > alphabets.length - 1) {
        newIndex = newIndex - alphabets.length // since index is beyond the 26 letters, lets circle from start
      }
      return alphabets[newIndex]; // return the replacement alphabet for the current one
    }).join(''); // join the array to characters to form the word
  }
  return str;
}

// export the module
module.exports = lib;

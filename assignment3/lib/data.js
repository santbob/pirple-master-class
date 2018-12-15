/*
 * Library for CRUD operations
 *
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers')

//container for this module to be exported
const lib = {};

// Base directory of the data folder
const baseDir = path.join(__dirname, '/../.data/');

const filePath = function(dir, file) {
  return baseDir + dir + '/' + file + '.json';
}

const dirPath = function(dir) {
  return baseDir + dir + '/';
}

// Create a file
lib.create = function(dir, file, data, callback) {
  fs.open(filePath(dir, file), 'wx', function(err, fileDescriptor) {
    if (!err && fileDescriptor) {
      // convert data to string
      const stringData = JSON.stringify(data);

      // write to the file and close setInterval(function () {
      fs.writeFile(fileDescriptor, stringData, function(err) {
        if (!err) {
          fs.close(fileDescriptor, function(err) {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing file');
            }
          })
        } else {
          callback('Error writing to new file');
        }
      });
    } else {
      callback('Could not create new file, it may already exist');
    }
  });
}

// Read the file
lib.read = function(dir, file, callback) {
  fs.readFile(filePath(dir, file), 'utf-8', function(err, data) {
    if (!err && data) {
      callback(false, helpers.parseJsonToObject(data));
    } else {
      callback(err, data);
    }
  });
}

// Update the file
lib.update = function(dir, file, data, callback) {
  fs.open(filePath(dir, file), 'r+', function(err, fileDescriptor) {
    if (!err && fileDescriptor) {
      // convert data to string
      const stringData = JSON.stringify(data);

      //truncate the existing content
      fs.ftruncate(fileDescriptor, function(err) {
        if (!err) {
          // write to the file and close it
          fs.writeFile(fileDescriptor, stringData, function(err) {
            if (!err) {
              fs.close(fileDescriptor, function(err) {
                if (!err) {
                  callback(false);
                } else {
                  callback('Error closing file');
                }
              })
            } else {
              callback('Error writing to existing file');
            }
          });
        } else {
          callback('Error truncating file');
        }
      });
    } else {
      callback('Could not open file for updating, it may not exist yet');
    }
  });
}

// Delete the file
lib.delete = function(dir, file, callback) {
  fs.unlink(filePath(dir, file), function(err) {
    if (!err) {
      callback(false);
    } else {
      callback('Error deleting the file')
    }
  })
}

// List all files in a given directory
lib.list = function(dir, callback) {
  fs.readdir(dirPath(dir), function(err, data) {
    if (!err && data && data.length) {
      const trimmedFileNames = [];
      data.forEach(function(fileName) {
        trimmedFileNames.push(fileName.replace('.json', ''));
      })
      callback(false, trimmedFileNames);
    } else {
      callback(err, data);
    }
  })
}

// Export the module
module.exports = lib;

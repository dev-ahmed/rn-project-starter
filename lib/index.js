'use strict';

var shell = require('shelljs');
var path = require('path');
var npm = require('npm-programmatic');
var npmAddScript = require('npm-add-script');
var jsonfile = require('jsonfile');
var _ = require('lodash');

var getPath = function () {
  return path.join(__dirname);
}

var installDeps = function (npmPackage) {
  var failedPackages = [];
  var packageName = npmPackage.name;
  var packageConfig = npmPackage.config;
  console.log('installing ', packageName)
  npm.install([packageName], handleConfig(packageConfig))
    .then(function () {
      console.log(packageName, 'installed successfully');
    })
    .catch(function () {
      console.log("Unable to install ", packageName);
      failedPackages.push(npmPackage);
    });
  if (failedPackages.length > 0) {
    _.each(failedPackages, function (item, index) {
      installDeps(item);
    })
  }
}

var addScript = function (key, value) {
  npmAddScript({ key: key, value: value })
}

var createJsonFile = function (file, obj) {
  jsonfile.writeFile(file, obj, function (err) {
    //console.error(err);
  });
}

var handleConfig = function (flags) {
  if (flags == 'save') {
    return {
      cwd: '.',
      save: true
    }
  } else if (flags == 'saveDev') {
    return {
      cwd: '.',
      saveDev: true
    }
  }
}





exports.installDeps = installDeps;
exports.addScript = addScript;
exports.createJsonFile = createJsonFile;
exports.getPath = getPath;


var shell = require('shelljs');
var path = require('path');
var npm = require('npm-programmatic');
var npmAddScript = require('npm-add-script');

exports.sayHello = function (name) {
    return 'Hello, ' + name;
};

exports.getPath = function () {
    return path.join(__dirname);
}

exports.installDeps = function (packageName, config) {
    console.log('installing ', packageName)
    npm.install([packageName], handleConfig(config))
        .then(function () {
            console.log(packageName, 'installed successfully');
        })
        .catch(function () {
            console.log("Unable to install ", packageName);
        });
}

exports.addScript = function (key, value) {
    npmAddScript({ key: key, value: value })
}

handleConfig = function (flags) {
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
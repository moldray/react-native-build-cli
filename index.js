#!/usr/bin/env node

'use strict';

require('shelljs/global');

var fs = require('fs');
var os = require('os');
var path = require('path');
var prompt = require('prompt');
var plat = process.argv[2];

if (!which('react-native')) {
    echo('Sorry, this script requires react-native-cli');
    exit(1);
}

if (plat === 'android') {
    buildAnd();
} else if (plat === 'ios') {
    echo('ios is not supported right now');
    exit(1);
} else {
    echo('arg ' + plat + ' is not supported');
    exit(1);
}

function buildAnd() {
    mkdir('-p', 'android/app/src/main/assets');
    prompt.start();

    prompt.get(['STORE_FILE', 'KEY_ALIAS', 'STORE_PASSWORD', 'KEY_PASSWORD'], function(err, result) {
        if (err) {
            console.log(err);
        } else {
            mv('-f', result.STORE_FILE, 'android/app/');
            setConfig(result);
        }
    });
}

function setConfig(res) {
    var keyStoreName = path.basename(res.STORE_FILE);
    var gradlePath = path.join(os.homedir(), '/.gradle/gradle.properties');
    var gradleLines = [
        'MYAPP_RELEASE_STORE_FILE=' + keyStoreName,
        'MYAPP_RELEASE_KEY_ALIAS=' + res.KEY_ALIAS,
        'MYAPP_RELEASE_STORE_PASSWORD=' + res.STORE_PASSWORD,
        'MYAPP_RELEASE_KEY_PASSWORD=' + res.KEY_PASSWORD
    ];

    fs.writeFile(gradlePath, gradleLines.join('\n'), function(err) {
        if (err) throw err;
        console.log('created ~/.gradle/gradle.properties');

        exec('react-native bundle --platform android --entry-file index.android.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res --dev false');
        cd('android');
        exec('./gradlew assembleRelease');
        echo('look: android/app/build/outputs/apk');
    });
}

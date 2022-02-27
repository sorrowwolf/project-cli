'use strict';

const Spinner = require("cli-spinner").Spinner;

function isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]';
}

function spinnerStart(msg, setSpinnerString = '|/-\\') {
    const spinner = new Spinner(msg + ' %s');
    spinner.setSpinnerString(setSpinnerString);
    spinner.start();
    return spinner;
}

function sleep(timeout = 1000) {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

module.exports = {
    isObject,
    spinnerStart,
    sleep
}
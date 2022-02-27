'use strict';

const axios = require("axios");

const BASEURL = process.env.BASEURL ? process.env.BASEURL : 'http://127.0.0.1:7001';

const request = axios.create({
    baseURL: BASEURL,
    timeout: 5000,
});

request.interceptors.response.use(
    response => {
        if (response.status === 200) {
            return response.data;
        }
    },
    error => {
        return Promise.reject(error);
    }
)

module.exports = request;
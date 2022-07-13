const express = require('express');
const axios = require('axios').default;
const url = require('url');
const path = require('path');
const app = express();
const port = 3000;
const cors = require('cors');
const api_key="c85otiaad3i9e9m10gk0";
const finnhub_api = "https://finnhub.io/api/v1";

// app.get('/',(req, res) => res.send("Hello Express"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));
app.use(cors());

app.get('/', (req, res) => {
    res.send("stockteddy-finnhub-api-backend");
})

// profile2
app.get('/api/profile2',async (req, res) => {
    console.log("/profile2 call");
    let payload = {symbol:req.query.symbol, token:api_key};
    const param = new url.URLSearchParams(payload);
    try{
        let response = await axios.get(finnhub_api+"/stock/profile2?"+param);
        let data = response.data;
        res.json(data);
    } catch (err) {
        console.log(err.response.data);
    }
})

// candle
app.get('/api/candle',async (req, res) => {
    console.log("/candle call");
    let payload = {symbol:req.query.symbol, 
                    resolution:req.query.resolution, 
                    from:req.query.from, 
                    to:req.query.to, 
                    token:api_key};
    const param = new url.URLSearchParams(payload);
    try{
        let response = await axios.get(finnhub_api+"/stock/candle?"+param);
        let data = response.data;
        res.json(data);
    } catch(err) {
        console.log(err.response.data);
    }
})

// quote
app.get('/api/quote',async (req, res) => {
    console.log("/quote call");
    let payload = {symbol:req.query.symbol, token:api_key};
    const param = new url.URLSearchParams(payload);
    try {
        let response = await axios.get(finnhub_api+"/quote?"+param);
        let data = response.data;
        res.json(data);
    } catch(err) {
        console.log(err.response.data);
    }
})

// search
app.get('/api/search',async (req, res) => {
    console.log("/search call");
    let payload = {q:req.query.q, token:api_key};
    const param = new url.URLSearchParams(payload);
    try {
        let response = await axios.get(finnhub_api+"/search?"+param);
        let data = response.data;
        res.json(data);
    } catch(err) {
        console.log(err.response.data);
    }
})

// company-news
app.get('/api/company-news',async (req, res) => {
    console.log("/company-news call");
    var today = new Date();
    const formattedToday = formattedDate(today);
    today.setMonth(today.getMonth() -6);
    today.setDate(today.getDate() -1);
    var fromDate = new Date(today);
    const formattedFrom = formattedDate(fromDate);
    let payload = {symbol:req.query.symbol, 
                    from: formattedFrom,
                    to: formattedToday,
                    token:api_key};
    const param = new url.URLSearchParams(payload);
    try {
        let response = await axios.get(finnhub_api+"/company-news?"+param);
        let data = response.data;
        res.json(data);
    } catch(err) {
        console.log(err.response.data);
    }
})

// recommendation-trend
app.get('/api/recommendation',async (req, res) => {
    console.log("/recommendation call");
    let payload = {symbol:req.query.symbol, token:api_key};
    const param = new url.URLSearchParams(payload);
    try {
        let response = await axios.get(finnhub_api+"/stock/recommendation?"+param);
        let data = response.data;
        res.json(data);
    } catch(err) {
        console.log(err.response.data);
    }
})

// social-sentiment
app.get('/api/social-sentiment',async (req, res) => {
    console.log("/social-sentiment call");
    let payload = {symbol:req.query.symbol, from: '2022-01-01', token:api_key};
    const param = new url.URLSearchParams(payload);
    try{
        let response = await axios.get(finnhub_api+"/stock/social-sentiment?"+param);
        let data = response.data;
        res.json(data);
    } catch (err) {
        console.log(err.response.data);
    }
})

// peers
app.get('/api/peers',async (req, res) => {
    console.log("/peers call");
    let payload = {symbol:req.query.symbol, token:api_key};
    const param = new url.URLSearchParams(payload);
    try {
        let response = await axios.get(finnhub_api+"/stock/peers?"+param);
        let data = response.data;
        res.json(data);
    } catch(err) {
        console.log(err.response.data);
    }
})

// earnings
app.get('/api/earnings',async (req, res) => {
    console.log("/earnings call");
    let payload = {symbol:req.query.symbol, token:api_key};
    const param = new url.URLSearchParams(payload);
    try {
        let response = await axios.get(finnhub_api+"/stock/earnings?"+param);
        let data = response.data;
        res.json(data);
    } catch(err) {
        console.log(err.response.data);
    }
})

function formattedDate(date) {
    var day = ('0' + (date.getDate())).slice(-2);
    var month = ('0' + (date.getMonth() +1)).slice(-2);
    var year = date.getFullYear();
    return year+"-"+month+"-"+day;
}
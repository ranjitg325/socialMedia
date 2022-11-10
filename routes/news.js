const express = require('express');
const router = express.Router();
const axios = require('axios');

//fetch news api using axios
router.get('/getNews/topSearch', (req, res) => {
    axios.get('https://newsapi.org/v2/top-headlines?country=in&apiKey=63b0bf692ee44d4c9d339f20c12bd95f')  //here i used the website newsapi.org (using axios) for fetching the top news, we can get more content their  
    .then(response => {
            res.send(response.data);
        })
        .catch(error => {
            console.log(error);
        })
});

router.get('/getNews/globalSearch', (req, res) => {
    axios.get('https://newsapi.org/v2/everything?q=bitcoin&apiKey=63b0bf692ee44d4c9d339f20c12bd95f')
        .then(response => {
            res.send(response.data);
        })
        .catch(error => {
            console.log(error);
        })
});

module.exports = router;


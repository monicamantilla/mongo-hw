
// var express = require("express");
// var router = express.Router();
// var axios = require("axios");
// var cheerio = require("cheerio");
// var db = require("../models/index");

// router.get("/scrape", function (req, res) {
//     axios.get("https://news.google.com").then(function (response) {
//         var $ = cheerio.load(response.data);

//         var $ = cheerio.load(response.data);
    
//        //Empty object to save the data
//         var results = {};
    
//         $("h2 span").each(function (i, element) {
            
//             var result = {};

//             result.title = $(this).children("a").text();
//             result.link = $(this).children("a").attr("href");

//             db.Article.create(result).then(function (dbArticle) {
//                 console.log(dbArticle)
//             }).catch(function (err) {
//                 console.log(err);
//             });

//             // var headline = $(this).text();
//             // var link = "https://www.nytimes.com";
//             // link = link + $(element).parents("a").attr("href");
//             // var summaryOne = $(this).parent().parent().siblings().children("li:first-child").text();
//             // var summaryTwo = $(this).parent().parent().siblings().children("li:last-child").text();
    
//             // if (headline && summaryOne && link) {
//             //     results.push({
//             //         headline: headline,
//             //         summaryOne: summaryOne,
//             //         summaryTwo: summaryTwo,
//             //         link: link
//             //     })
//             // }
//         })
//         console.log(results)
//     })
// });

// router.get("/articles", function (req, res) {
//     db.Article.find({}).then(function (dbArticle) {
//         res.json(dbArticle);
//     }).catch(function (err) {
//         res.json(err);
//     });
// });


// router.get("/", function(req, res) {
//     db.Article.find(function(data){
//         var hbObject = {data};
//         console.log(hbObject);
//         res.render("index", hbObject);
//     });
// });

// router.get("/articles/:id", function(req, res){
//     db.Article.findOne({_id: req.params.id}).populate("note").then(function(dbArticle){
//         res.json(dbArticle);
//     }).catch(function(err){
//         res.json(err);
//     });
// });

// router.post("/articles/:id", function(req,res){
//     db.Note.create(req.body).then(function(dbNote){
//         return db.Article.findOneAndUpdate({_id:req.params.id}, {note: dbNote._id}, {new: true});
//     }).then(function(dbArticle){
//         res.json(dbArticle);
//     }).catch(function(err){
//         res.json(err);
//     });
// });

// module.exports = router;
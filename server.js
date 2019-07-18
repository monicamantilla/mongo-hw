const express = require('express');
const exphbs = require("express-handlebars");
// const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('morgan');
const mongojs = require('mongojs')

//Heroku
// mongoose.Promise = global.Promise
// mongoose.connect(
//     process.env.MONGODB_URI || "",
//     {
//         useNewUrlParser: true
//     }
// )
//     ;

const PORT = process.env.PORT || 3000;

const app = express();

//handlebars
app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main"
    })
);
app.set("view engine", "handlebars");

// Require all models
var db = require("./models");

// Use morgan logger for logging requests
app.use(logger("dev"));
// Return request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

//Database
var databaseUrl = "scraper";
var collections = ["scrapedData"];

//hook mongojs configuaration to the db variable

var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
    console.log("Database Error:", error)
})

app.get('/', function (req, res) {
    res.send("hello")
})

app.get('/all', function (req, res) {
    db.scrapedData.find({}, function (err, found) {
        if (err){
            console.log(err);
        }
        else{
            releaseEvents.json(found);
        }
    })
})



axios.get("https://www.nytimes.com/").then(function (response) {

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(response.data);

   //Empty array to save the data
    var results = [];

    $("h2 span").each(function (i, element) {
        // Save the text of the element in a "title" variable
        var headline = $(element).text();
        var link = "https://www.nytimes.com";
        link = link + $(element).parents("a").attr("href");
        var summaryOne = $(element).parent().parent().siblings().children("li:first-child").text();
        var summaryTwo = $(element).parent().parent().siblings().children("li:last-child").text();

        if (headline && summaryOne && link) {
            results.push({
                headline: headline,
                summaryOne: summaryOne,
                summaryTwo: summaryTwo,
                link: link
            })
        }
    })
    console.log(results)
})
// })
app.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

//route to find all the info in database collection and render hbrs
app.get("/", function (req, res) {
    db.Article.find({}).then(function (dbArticle) {
        console.log(dbArticle)
        res.render("index")
    })

})

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

app.listen(PORT, function () {
    console.log("App running on port" + PORT);
});
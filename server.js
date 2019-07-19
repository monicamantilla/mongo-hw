const express = require("express"),
    bodyParser = require("body-parser"),
    logger = require("morgan"),
    mongoose = require("mongoose"),
    path = require("path"),
    axios = require("axios"),
    cheerio = require("cheerio"),
    exphbs = require("express-handlebars");

//Require Models
const Note = require("./models/Note");
const Article = require("./models/Article");

// Set mongoose to leverage build in Javascript ES6 Promises

mongoose.Promise = Promise;

// Define Port

const PORT = process.env.PORT || 3000;


// Initialize Express
const app = express();

//use morgan and body parser with our app
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));

// Make public static dir
app.use(express.static('public'));

// Set Handlebars
app.engine("handlebars", exphbs({
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "/views/layouts/partials")
}));

app.set("view engine", "handlebars");

// Connect to the Mongo DB
// Database configuration with mongoose
var db = mongoose.connection;
// var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraperdb";
// mongoose.connect(MONGODB_URI);


mongoose.Promise = global.Promise
mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost/scraperdb",
    {
        useNewUrlParser: true
    }
)
    ;


// Show any mongoose errors
db.on("error", function (error) {
    console.log("Mongoose Error: ", error);
});

// Once logged into the db through mongoose, log a success message
db.once("open", function () {
    console.log("Mongoose connection successful.");
});

// Routes
// ==========

// GET requests to render Handlebars pages

app.get("/", function (req, res) {
    Article.find({ "saved": false }, function (error, data) {
        let hbsObject = {
            article: data
        };
        console.log(hbsObject);
        res.render("home", hbsObject);
    });
});

app.get("/saved", function (req, res) {
    Article.find({ 'saved': true }).populate("notes").exec(function (error, articles) {
        let hbsObject = {
            article: articles
        };
        res.render("saved", hbsObject);
    });
});

app.get("/scrape", function (req, res) {

    //First we grab the body of the html with axios
    axios.get("https://techcrunch.com/").then(function (response) {
        // Load the html body from axios into cheerio
        var $ = cheerio.load(response.data);
        $(".post-block").each(function (i, element) {
            // Save an empty result object
            var result = {};

            result.title = $(this).children(".post-block__header").children("h2").children("a").text().trim();

            result.summary = $(this).children(".post-block__content").text().trim();
            result.link = $(this).children(".post-block__header").children("h2").children("a").attr("href");
            result.imgUrl = $(this).children(".post-block__footer").children(".post-block__media").children("a").children("img").attr("src");
            // console.log( result);

            var entry = new Article(result);


            entry.save(function (err, doc) {


                if (err) {

                    console.log(err);
                }

                else {
                    console.log("This is doc: " + doc);
                }
            });

        });
        res.send("Scrape Complete");
    });

});



app.get("/articles", function (req, res) {

    Article.find({}, function (error, doc) {

        if (error) {
            console.log(error);
        }
        else {
            res.json(doc);
        }
    });
});

//Grab an article by it's ObjectId
app.get("/articles/:id", function (req, res) {

    Article.findOne({ "_id": req.params.id })
        .populate("note")

        .exec(function (error, doc) {
            //log any errors
            if (error) {
                console.log(error);
            }
            //otherwise, send the doc to the browser as a json object
            else {
                res.json(doc);
            }

        });
});

// Save article
app.post("/articles/save/:id", function (req, res) {
    Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true })

        .exec(function (err, doc) {

            if (err) {
                console.log(err);
            }
            else {

                res.send(doc);
            }
        });
});

//Delete article
app.post("/articles/delete/:id", function (req, res) {
    Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": false, "notes": [] })

        .exec(function (err, doc) {

            if (err) {
                console.log(err);
            }
            else {

                res.send(doc);
            }
        });
});

// Create a new note
app.post("/notes/save/:id", function (req, res) {
    let newNote = new Note({
        body: req.body.text,
        article: req.params.id
    });
    console.log(req.body);
    //And save the new note to the db
    newNote.save(function (error, note) {
        //Log any errors
        if (error) {
            console.log(error);
        }
        //Otherwise
        else {
            Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "notes": note } })

                .exec(function (err) {

                    if (err) {
                        console.log(err);
                        res.send(err);
                    }
                    else {

                        res.send(note);
                    }
                });
        }
    });
});

// Delete a note
app.delete("/notes/delete/:note_id/:article_id", function (req, res) {
    Note.findOneAndRemove({ "_id": req.params.note_id }, function (err) {
        //Log any errors
        if (err) {
            console.log(err);
            res.send(err);
        }
        else {
            Article.findOneAndUpdate({ "_id": req.params.article_id }, { $pull: { "notes": req.params.note } })
                .exec(function (err) {
                    if (err) {
                        console.log(err);
                        res.send(err);
                    }
                    else {
                        res.send("Note Deleted");
                    }
                });
        }
    });
});

//Listen on port

app.listen(PORT, function () {
    console.log("App running on port " + PORT);
});



const express = require('express');
const logger = require('morgan')
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const db = require("./models");
const PORT = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// var exphbs = require("express-handlebars");

// app.engine("handlebars", exphbs({ defaultLayout: "main" }));
// app.set("view engine", "handlebars");

// var routes = require("./routes/routes");

// app.use(routes);

mongoose.connect("mongodb://localhost/mongo_hw", { useNewUrlParser: true });
  
app.get("/scrape", function (req, res) {
    
    axios.get("https://www.nytimes.com").then(function (response) {
      var $ = cheerio.load(response.data);
      console.log('_');
         
      $("h2 span").each(function (i, element) {
  
        var result = {};
        // result.category = $(this).
        result.title = $(this)
          .children("a")
          .text();
          // parents.parent.children
          result.link = $(this)
          .children("a")
          .attr("href");
          console.log(result);
  
        db.Article.create(result)
          .then(function (dbArticle) {
         
            console.log(dbArticle);
          })
          .catch(function (err) {
          
            console.log(err);
          });
      });
  

      res.send("Scrape Complete");
    });
  });
  
  app.get("/articles", function(req, res) {
    db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
  });
  
  app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function (dbNote) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function (dbArticle) {
        res.json(dbArticle);
      })
      .catch(function (err) {
        res.json(err);
      });
  });


app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});

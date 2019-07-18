var mongoose = require("mongoose");


var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object

var ArticleSchema = new Schema({
  
  title: {
    type: String,
    required: true
  },

  link: {
    type: String,
    required: true
  },
 
  // summary: {
  //   type: String,
  //   required: true
  // },

  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

// model
var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;

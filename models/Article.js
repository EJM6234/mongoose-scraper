var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  href: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: false
  },
  saved: {
    type: Boolean,
    default: false
  }
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;

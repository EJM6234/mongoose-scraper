module.exports = (app, db, cheerio, axios) => {
  app.get("/", (req, res) => {
    db.Article.find({}).then((articles) => {
      res.render("index", {articles: articles})
    })
  });

  app.put("/", (req, res) => {
    db.Article.findByIdAndUpdate(req.body.id, {
      $set: {
        saved: true
      }
    }).catch((err) => {
      console.error(err);
    });
  });

  app.get("/scrape", (req, res) => {
    let newArticles = new Array();
    let articles;
    let newArticleCount = 0;

    db.Article.find().then((foundArticles) => {
      //Scrape NYTimes for all available articles
      axios.get("https://www.nytimes.com/").then((body) => {
        const $ = cheerio.load(body.data);

        $(".story").each((i, article) => {
          const $a = $(article).children('h2').children('a');
          const $summary = $(article).children('.summary').text().trim();

          if ($summary === null) {
            $summary = $(article).children('ul').children('li').text().trim();
          }

          if ($summary !== '' && $a.text().trim() !== '' && $a.attr("href") !== '') {
            newArticles[i] = {
              href: $a.attr("href"),
              title: $a.text().trim(),
              summary: $summary
            }
            newArticleCount++;
          }
        });

        //Check for and remove duplicate articles
        foundArticles.forEach((dbArticle) => {
          newArticles.forEach((newArticle, i) => {
            if (dbArticle.title === newArticle.title) {
              newArticles.splice(i, 1);
            }
          });
        });
        articles = foundArticles.concat(newArticles);

        //Save new articles to database
        newArticles.forEach((article) => {
          if (article) {
            db.Article.create(article).catch((err) => {
              console.error(err);
            });
          }
        });
      }).catch((err) => {
        if (err) 
          throw err;
        }
      );
    }).then(() => {
      console.log(newArticleCount);
      res.send({newArticleCount});
    });
  });

  app.get("/saved", (req, res) => {
    db.Article.find({saved: true}).then((savedArticles) => {
      res.render("saved-articles", {savedArticles: savedArticles});
    });
  });

  app.get("/saved/:id", (req, res) => {
    db.Article.findByIdAndUpdate(req.params.id, {
      $set: {
        saved: false
      }
    }).catch((err) => {
      return res.json(err);
    });
    db.Note.find({articleId: req.params.id}).remove().then(() => {
      res.status(200).send(`Article#${req.params.id} has been deleted!`);
    }).catch((err) => {
      return res.json(err);
    });
  });

  app.post("/notes", (req, res) => {
    db.Note.create(req.body).then((dbSavedNote) => {
      res.send(dbSavedNote);
    }).catch((err) => {
      return res.json(err);
    });
  });

  app.get("/notes/:articleId", (req, res) => {
    db.Note.find({articleId: req.params.articleId}).then((notes) => {
      res.send(notes);
    })
  })

  app.put("/notes/delete/:noteId", (req, res) => {
    console.log("req.params.noteId", req.params.noteId);
    db.Note.findByIdAndRemove(req.params.noteId, (err) => {
      res.status(200).send(`Note#${req.params.id} has been deleted!`);
    }).catch((err) => {
      return res.json(err);
    });
  });
}

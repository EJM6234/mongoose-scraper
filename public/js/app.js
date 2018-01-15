$(document).ready(() => {
  //Functions
  function getArticleNotes(articleId) {
    $.get(`/notes/${articleId}`).done((notes) => {
      notes.forEach((note) => {
        $(`#noteList${articleId}`).append(`<li id="${note._id}"><span>${note.note}<button class="note-delete" data-articleId="${articleId}">DELETE</button></span></li>`);
      });

      //Delete note button handler
      $(".note-delete").on("click", function(e) {
        e.preventDefault();
        const noteId = $(this).parent().parent().attr("id");
        $.ajax({method: "PUT", url: `/notes/delete/${noteId}`}).then(() => {
          $(this).parent().parent().remove();
        })
      });
    })
  }

  //Click Handlers
  $("#scrape-btn").on("click", (e) => {
    e.preventDefault();

    $.get("/scrape").done(() => {
      // $("#newArticleModal").modal("show");
      $.get("/").done(() => {
        window.location.href = "/";
      });
    });
  });

  $(".save").on("click", function(e) {
    e.preventDefault();
    const id = $(this).siblings("a").data("id");
    $.ajax({
      url: "/",
      type: "PUT",
      data: {
        id: id
      }
    }).then(() => {
      console.log("Article saved");
    });
  });

  $(".delete-saved").on("click", function(e) {
    e.preventDefault();
    const id = $(this).siblings(".saved-article-title").data("id");
    $.get(`/saved/${id}`).then(() => {
      $(this).parent().parent().remove();
    });
  });

  $(".notes").on("click", function(e) {
    e.preventDefault();
    let articleId = $(this).siblings(".saved-article-title").data("id");
    $(`#notesModal${articleId}`).modal("show");
    $(`#noteList${articleId}`).empty();
    getArticleNotes(articleId);
  });

  $(".note-save").on("click", function(e) {
    e.preventDefault();

    const note = $(this).parent().siblings(".modal-body").children("div").children("input").val();
    const articleId = $(this).parent().siblings(".modal-body").children("div").children("input").attr("articleId");
    $.post("/notes", {note, articleId}).then((data) => {
      $(this).parent().siblings(".modal-body").children("div").children("input").val("");
      $(this).parent().siblings(".modal-body").children("ul").empty();
      getArticleNotes(articleId);
    });
  });
});

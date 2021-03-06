let bodyParser = require("body-parser");
let methodOverride = require("method-override");
let expressSanitizer = require("express-sanitizer");
let mongoose = require("mongoose");
let express = require("express");
let app = express();

// APP CONFIG
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(expressSanitizer());
app.use(express.static("public")); //stylesheet setup
mongoose.set("useFindAndModify", false);
mongoose.connect("process.env.MONGODB_URI || mongodb://localhost/restful_blog_app", {
    useNewUrlParser: true
});

app.use(methodOverride("_method"));

// MONGOOSE/MODEL CONFIG
let blogSchema = mongoose.Schema({
    title: String,
    image: String,
    body: String,
    // the way we can set the default value.
    created: {
        type: Date,
        default: Date.now
    },
});
let Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "LOVE YOURSELF",
//     image: "https://images.unsplash.com/photo-1527647360380-128bf1a01e1f?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=79d930d867d9332d4117941eb3d904ad&auto=format&fit=crop&w=666&q=80",
//     body: "you don't go to a relationship to get a life, you go to a relationship to share one."
// }, function(err, newBlog){
//   if (err) {
//       console.log(err);
//   } else {
//       console.log("LOVE yourself");
//   }
// });

// RESTFUL ROUTES

// INDEX ROUTE
// it's conventional for the root page to go to the index page
app.get("/", function (req, res) {
    res.redirect("/blogs");
});

app.get("/blogs", function (req, res) {
    Blog.find({}, function (err, blogs) {
        if (err) {
            console.log(err);
        } else {
            res.render("index", {
                blogs: blogs
            });
        }
    });
});

// NEW ROUTE
app.get("/blogs/new", function (req, res) {
    res.render("new");
});

// CREATE ROUTE
app.post("/blogs", function (req, res) {
    // let title = req.body.title;
    // let image = req.body.image;
    // let body = req.body.body;
    // let newBlog = {
    //     title: title,
    //     image: image,
    //     body: body
    // };
    console.log(req.body);
    req.body.blog.body = req.sanitize(req.body.blog.body);
    console.log(req.body);

    Blog.create(req.body.blog, function (err, newBlog) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/blogs");
        }
    });
});

// SHOW ROUTE
app.get("/blogs/:id", function (req, res) {
    let id = req.params.id;
    Blog.findById(id, function (err, blog) {
        if (err) {
            res.redirect("/blogs");
            // console.log(err);
        } else {
            res.render("show", {
                blog: blog
            });
        }
    });
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function (req, res) {
    Blog.findById(req.params.id, function (err, foundBlog) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.render("edit", {
                blog: foundBlog
            });
        }
    });
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updateBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect(`/blogs/${req.params.id}`);
        }
    });
});

// DESTROY ROUTE
app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs");
        }
    });
});


app.listen(process.env.PORT || 3000, function () {
    console.log("This is the callback function of restfulblog server, you need to learn async/await later on!");
})

// middleware: something that we're repeating doing in more than
// one routes. will be touched later.
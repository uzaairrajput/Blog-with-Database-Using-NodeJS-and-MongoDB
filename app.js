// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); // Keep only one declaration
const _ = require("lodash");
require('dotenv').config();

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare...";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque...";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien...";

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define the post schema and model
const postSchema = new mongoose.Schema({
  title: String,
  content: String
});

const Post = mongoose.model("Post", postSchema);

// Routes
app.get("/", async function(req, res) {
  try {
    const posts = await Post.find({});
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/about", function(req, res) {
  res.render("about", { aboutContent: aboutContent });
});

app.get("/contact", function(req, res) {
  res.render("contact", { contactContent: contactContent });
});

app.get("/compose", function(req, res) {
  res.render("compose");
});

app.post("/compose", async function(req, res) {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  try {
    await post.save();
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.get("/posts/:postId", async function(req, res) {
  const requestedPostId = req.params.postId;

  // Check if the ID is a valid ObjectId
  if (!mongoose.isValidObjectId(requestedPostId)) {
    return res.status(400).send("Invalid post ID format");
  }

  try {
    const post = await Post.findOne({ _id: requestedPostId });
    if (!post) {
      return res.status(404).send("Post not found");
    }
    res.render("post", {
      title: post.title,
      content: post.content
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error retrieving post");
  }
});

// Start the server
app.listen(3000, function() {
  console.log("Server started on port 3000");
});

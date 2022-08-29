const Butter = require("buttercms");
const express = require("express");
const errorMiddleware = require("./middleware/errorMiddleware");
const AppError = require("./utils/appError");
const catchAsync = require("./utils/catchAsync");
const makeAxiosRequest = require("./utils/makeAxiosRequest");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "15kb" }));

const token = process.env.BUTTER_CMS_API_TOKEN;
const butter = token ? Butter(token) : null;


app.get(
  "/",
  catchAsync(async (req, res) => {
    const { data: posts } = await butter.post.list({ page_size: 10, page: req.query.page || 1 });

    res.status(200).json(posts);
  })
);

app.get(
  "/:slug",
  catchAsync(async (req, res) => {
    const { data: post } = await butter.post.retrieve(req.params.slug);

    res.status(200).json(post);
  })
);

app.post(
  "/",
  catchAsync(async (req, res) => {
    let payload = req.body;

    await makeAxiosRequest({ method: "post", data: payload });

    res.status(201).json({
      status: "success",
      message: "Post created successfully",
    });
  })
);

app.patch(
  "/:slug",
  catchAsync(async (req, res) => {
    let payload = {
      ...req.body,
    };

    await makeAxiosRequest({ method: "patch", data: payload, uri: `/${req.params.slug}/` });

    res.status(200).json({
      status: "success",
      message: "Post updated successfully",
    });
  })
);

// Wrong path handler
app.all("*", (req, _, next) => {
  next(new AppError(`Path ${req.originalUrl} does not exist for ${req.method} method`, 404));
});

// Global error handler
app.use(errorMiddleware);

module.exports = app;

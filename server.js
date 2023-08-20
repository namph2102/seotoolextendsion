import express from "express";
import cors from "cors";
import MiddleWare from "./src/middleware";
import axios from "axios";
import * as cheerio from "cheerio";
import RedisServer from "./src/redis/redis.config";

const PORT = process.env.PORT || 5000;
//---------------- config

const app = express();
app.use(cors());
require("dotenv").config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
function isValidURL(url) {
  // Biểu thức chính quy kiểm tra URL
  var urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;

  // Kiểm tra chuỗi với biểu thức chính quy
  return urlRegex.test(url);
}
app.post("/", MiddleWare.HandleLimitRequest, (req, res) => {
  try {
    console.log(process.env.NODE_ENV);
    res.json({ message: "oke" });
  } catch (error) {
    res.json({ message: error.message });
  }
});
const REGES_URL = /^(https?:\/\/[^/]+)(?:\/|$)/;
function coverLink(url, link) {
  if (!link) return "";
  if (!isValidURL(link) || !link.includes("data:image")) {
    const match = url.match(REGES_URL);
    const baseUrl = match ? match[1] : link;
    return `${baseUrl}${link}`;
  }
  return link;
}
app.post("/geturl", MiddleWare.HandleLimitRequest, async (req, res) => {
  try {
    const data = req.body.url;
    RedisServer.incr("totaluser");

    if (!data || !isValidURL(data)) throw new Error("Không tồn tại");
    axios
      .get(data)
      .then((res) => res.data)
      .then((html) => {
        try {
          const $ = cheerio.load(html);
          const title = $("title").text() || $("h1").text();
          const des =
            $(`meta[name="description"]`).attr("content") ||
            $(`meta[property="og:description"]`).attr("content");
          const imageSeo =
            $(`meta[property="og:image"]`).attr("content") ||
            $(`meta[property="twitter:image"]`).attr("content");
          const keywords = $(`meta[name="keywords"]`).attr("content") || "????";
          const listImageElement = $(`body img`);
          const listAlinkElement = $(`body a`);
          const listImages = [];
          const listALinks = [];
          listAlinkElement.each((index, element) => {
            const href = coverLink(data, $(element).attr("href"));
            const title = $(element).attr("title") || false;
            const check = listALinks.some((item) => item.href == href);
            if (href && !check) {
              listALinks.push({
                href,
                title,
              });
            }
          });
          listImageElement.each((index, img) => {
            const src = coverLink(data, $(img).attr("src"));
            const alt = $(img).attr("alt") || false;
            const check = listImages.some((item) => item.src == src);
            if (src && !check) {
              listImages.push({
                src,
                alt,
              });
            }
          });
          const headings = $("h1, h2, h3, h4, h5, h6");
          const listTagsHeading = [];
          headings.each((index, element) => {
            listTagsHeading.push({
              tag: element.tagName,
              value: $(element).text(),
            });
          });
          res.status(200).json({
            message: "oke",
            listImages: listImages,
            listALinks: listALinks,
            title: title,
            des: des,
            imageSeo: imageSeo,
            keywords,
            listTagsHeading: listTagsHeading,
          });
        } catch (error) {
          console.log(error);
          res.status(404).json({ message: error.message });
        }
      });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
});
app.listen(PORT, () => {
  console.log("start sever PORT: ", PORT);
});

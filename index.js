import express from "express";

const app = express();
const port = 3131;
app.use(express.static("public"));
app.listen(port, () => {
    console.log(`浏览器请访问：http://localhost:${port}`);
});
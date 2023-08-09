const express = require("express");
const app = express();
const cors = require("cors");
const router = require("./routes/index");
const PORT = 3300;

app.use(express.json());
app.use(cors());
app.options("*", cors());

app.use("/api", router);

app.listen(PORT, () => {
  console.log(`server listen successfully: http://localhost:${PORT}`);
});

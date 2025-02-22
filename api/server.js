const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/users", (req, res) => {
  console.log("✅ Received user:", req.body);
  return res.status(201).json({ message: "User added successfully!" });
});

app.listen(5000, () => console.log("🚀 External API running on port 5000"));

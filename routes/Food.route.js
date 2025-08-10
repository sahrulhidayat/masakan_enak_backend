const router = require("express").Router();
const Food = require("../models/Food.model");
const verifyJWT = require("../middlewares/verifyJWT");

// Get all food items
router.route("/").get(verifyJWT, (req, res) => {
  Food.find()
    .then((food) => res.json(food))
    .catch((err) => res.status(400).json("Error: " + err));
});

// Get single food item by id
router.route("/:id").get((req, res) => {
  Food.findById(req.params.id)
    .then((food) => res.json(food))
    .catch((err) => res.status(400).json("Error: " + err));
});

// Delete food item by id
router.route("/:id").delete(async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Food item deleted successfully" });
  } catch (err) {
    console.error("Error deleting food item:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Add new food item
router.route("/add").post((req, res) => {
  const food = new Food({
    name: req.body.name,
    description: req.body.description,
    price: Number(req.body.price),
    imageUrl: req.body.imageUrl,
  });

  food
    .save()
    .then(() => res.json("Food item added!"))
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;

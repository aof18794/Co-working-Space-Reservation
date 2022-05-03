const express = require("express");
const {
  getCoworkingSpaces,
  getCoworkingSpace,
  createCoworkingSpace,
  updateCoworkingSpace,
  deleteCoworkingSpace,
} = require("../controllers/coworkingSpace");

//Include other resource routers
const reservationRouter = require("./reservations");

const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

//Re-route into other resource routers
router.use("/:coworkingId/reservations/", reservationRouter);

router
  .route("/")
  .get(getCoworkingSpaces)
  .post(protect, authorize("admin"), createCoworkingSpace);

router
  .route("/:coworkingId")
  .get(getCoworkingSpace)
  .put(protect, authorize("admin"), updateCoworkingSpace)
  .delete(protect, authorize("admin"), deleteCoworkingSpace);

module.exports = router;

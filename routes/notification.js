const router = require("express").Router();

const notificationController = require("../controllers/notificationController");
const middleware = require("../middleware/authenticateUser");

router.post("/notify", middleware.authenticateToken, notificationController.createNotify);

router.delete("/removeNotify",middleware.authenticateToken,  notificationController.removeNotify);

router.get("/getNotifies", middleware.authenticateToken, notificationController.getNotifies);

router.patch("/isReadNotify",middleware.authenticateToken,  notificationController.isReadNotify);

router.delete("/deleteAllNotify", middleware.authenticateToken, notificationController.deleteAllNotifies);
module.exports = router;

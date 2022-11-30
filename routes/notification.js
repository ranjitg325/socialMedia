const router = require("express").Router();

const notificationController = require("../controllers/notificationController");
const middleware = require("../middleware/authenticateUser");

router.post("/notify", middleware.authenticateToken, notificationController.createNotify);

router.delete("/notify/:id",middleware.authenticateToken,  notificationController.removeNotify);

router.get("/notifies", middleware.authenticateToken, notificationController.getNotifies);

router.patch("/isReadNotify/:id",middleware.authenticateToken,  notificationController.isReadNotify);

router.delete("/deleteAllNotify", middleware.authenticateToken, notificationController.deleteAllNotifies);
module.exports = router;

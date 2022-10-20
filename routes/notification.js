const router = require("express").Router();

const notificationController = require("../controllers/notificationController");

router.post("/notify",  notificationController.createNotify);

router.delete("/removeNotify",  notificationController.removeNotify);

router.get("/getNotifies",  notificationController.getNotifies);

router.patch("/isReadNotify",  notificationController.isReadNotify);

router.delete("/deleteAllNotify", notificationController.deleteAllNotifies);

module.exports = router;

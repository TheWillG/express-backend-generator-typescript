import express from "express";
MODEL_IMPORTS;CONTROLLER_IMPORTS;VALIDATION_IMPORTS;
import userController from "./userController";
const router = express.Router();

ROUTE_HANDLERS;
// User routes
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/logout", userController.logout);

export default router;

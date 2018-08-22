import express from "express";
MODEL_IMPORTS;CONTROLLER_IMPORTS;VALIDATION_IMPORTS;
import userController from "./userController";
const router = express.Router();

ROUTE_HANDLERS;
// User routes
router.post("/auth/signup", userController.signup);
router.post("/auth/login", userController.login);
router.get("/auth/logout", userController.logout);

export default router;

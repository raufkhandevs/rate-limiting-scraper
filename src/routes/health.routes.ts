import { Router } from "express";
import { getHealth } from "../controllers/health.controller";
import { asyncWrapper } from "../errors";

const router = Router();

// GET /health - Health check endpoint
router.get("/", asyncWrapper(getHealth));

export default router;

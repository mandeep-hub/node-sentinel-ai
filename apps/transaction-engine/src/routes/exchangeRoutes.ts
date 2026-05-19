import { Router } from "express";

import { convertCurrencyHandler } from "../controllers/exchangeController";

const router = Router();

router.get("/", convertCurrencyHandler);

export default router;

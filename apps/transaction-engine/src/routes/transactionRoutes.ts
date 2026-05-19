import { Router } from "express";

import {
  generateTransactionHandler,
  generateManyTransactionsHandler,
  getTransactionsHandler,
} from "../controllers/transactionController";

const router = Router();

router.post("/generate", generateTransactionHandler);

router.post("/generate-many", generateManyTransactionsHandler);

router.get("/", getTransactionsHandler);

export default router;

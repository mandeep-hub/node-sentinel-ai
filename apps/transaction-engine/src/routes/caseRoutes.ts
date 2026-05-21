import { Router } from "express";
import { assignCase } from "../services/caseService";
import { prisma } from "../services/prisma";

const router = Router();

// get all open cases for the queue
router.get("/", async (req, res) => {
  const cases = await prisma.case.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
  });
  res.json(cases);
});

// analyst clicks "request case" button
router.post("/assign", async (req, res) => {
  const { analystId, analystEmail } = req.body;
  const result = await assignCase(analystId, analystEmail);
  res.json(result);
});

export default router;

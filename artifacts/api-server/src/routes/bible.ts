import { Router, type IRouter } from "express";
import {
  GetBiblePassageQueryParams,
  GetBiblePassageResponse,
  ListBibleBooksResponse,
} from "@workspace/api-zod";
import {
  BIBLE_BOOKS,
  BibleServiceError,
  getNetBiblePassage,
  isSafeBibleReference,
} from "../lib/bible";

const router: IRouter = Router();

router.get("/bible/books", (_req, res) => {
  res.json(ListBibleBooksResponse.parse(BIBLE_BOOKS));
});

router.get("/bible/passage", async (req, res): Promise<void> => {
  const parsed = GetBiblePassageQueryParams.safeParse(req.query);
  if (!parsed.success || !isSafeBibleReference(parsed.data?.passage ?? "")) {
    res.status(400).json({ error: "Enter a valid Bible reference, such as John 3 or Romans 8:1-11." });
    return;
  }

  try {
    const passage = await getNetBiblePassage(parsed.data.passage);
    res.json(GetBiblePassageResponse.parse(passage));
  } catch (error) {
    if (error instanceof BibleServiceError) {
      req.log.warn({ status: error.status }, "Bible passage request could not be completed");
      res.status(error.status).json({ error: error.message });
      return;
    }

    req.log.error({ err: error }, "Unexpected Bible service error");
    res.status(502).json({ error: "The Bible service is temporarily unavailable." });
  }
});

export default router;
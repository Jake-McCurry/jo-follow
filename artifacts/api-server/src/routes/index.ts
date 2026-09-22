import { Router, type IRouter } from "express";
import bibleRouter from "./bible";
import healthRouter from "./health";
import reactionsRouter from "./reactions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(bibleRouter);
router.use(reactionsRouter);

export default router;

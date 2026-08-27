import { Router, type IRouter } from "express";
import bibleRouter from "./bible";
import healthRouter from "./health";

const router: IRouter = Router();

router.use(healthRouter);
router.use(bibleRouter);

export default router;

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import anthropicRouter from "./anthropic";
import leadsRouter from "./leads";
import adminRouter from "./admin";
import widgetRouter from "./widget";

const router: IRouter = Router();

router.use(healthRouter);
router.use(anthropicRouter);
router.use(leadsRouter);
router.use(adminRouter);
router.use(widgetRouter);

export default router;

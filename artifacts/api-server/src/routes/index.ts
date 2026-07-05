import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profilesRouter from "./profiles";
import testsRouter from "./tests";
import certificatesRouter from "./certificates";
import commentsRouter from "./comments";
import statsRouter from "./stats";
import journalRouter from "./journal";
import leaderboardRouter from "./leaderboard";
import adminRouter from "./admin";
import tasksRouter from "./tasks";
import authRouter from "./auth";
import cmsRouter from "./cms";
import programsRouter from "./programs";
import articlesRouter from "./articles";
import storiesRouter from "./stories";
import landingRouter from "./landing";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/profiles", profilesRouter);
router.use("/tests", testsRouter);
router.use("/certificates", certificatesRouter);
router.use("/comments", commentsRouter);
router.use("/stats", statsRouter);
router.use("/journal", journalRouter);
router.use("/leaderboard", leaderboardRouter);
router.use("/admin", adminRouter);
router.use("/admin/cms", cmsRouter);
router.use("/programs", programsRouter);
router.use("/articles", articlesRouter);
router.use("/stories", storiesRouter);
router.use("/tasks", tasksRouter);
router.use("/landing", landingRouter);

export default router;

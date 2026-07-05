import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { seedAdmin, seedCategories, seedPackages, seedDemoContent, seedXpRules, seedLevels, seedAchievements } from "./lib/seed";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

seedAdmin().catch(() => {});
seedCategories().catch(() => {});
seedPackages().catch(() => {});
seedDemoContent().catch(() => {});
seedXpRules().catch(() => {});
seedLevels().catch(() => {});
seedAchievements().catch(() => {});

export default app;

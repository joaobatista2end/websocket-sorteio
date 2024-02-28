import { Request, Response, Router, static as static_ } from "express";
import path from "path";

const router = Router();
const currentDirectory = __dirname;
const publicDirectory = path.resolve(currentDirectory, "..", "public");

router.use("/public", static_("public"));

router.get("/", (req: Request, res: Response) =>
  res.sendFile(publicDirectory + "/index.html")
);
router.get("/admin", (req: Request, res: Response) =>
  res.sendFile(publicDirectory + "/admin.html")
);

export default router;

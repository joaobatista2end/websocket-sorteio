import express, { Application } from "express";

import routes from "../routes";

export class ExpressApp {
  public instance: Application;

  constructor() {
    this.instance = express();
    this.registerRoutes();
  }

  registerRoutes() {
    this.instance.use(routes);
  }
}

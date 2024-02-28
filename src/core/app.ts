import http, { Server as HttpServer } from "http";

import { env } from "../validations/environment";
import { ExpressApp } from "./express-app";
import { WebSocketApp } from "./websocket-app";

export class App {
  private httpServer: HttpServer;
  private expressApp: ExpressApp;
  private webSocketApp: WebSocketApp;
  private port: number;
  private host: string;

  constructor() {
    this.expressApp = new ExpressApp();
    this.httpServer = http.createServer(this.expressApp.instance);
    this.webSocketApp = new WebSocketApp(this.httpServer);
    this.port = env.PORT;
    this.host = env.HOST;
  }

  execute() {
    this.httpServer.listen(this.port, () => {
      console.log(
        `Server started in host = ${this.host} and this port = ${this.port}`
      );
    });
    this.webSocketApp.listen();
  }
}

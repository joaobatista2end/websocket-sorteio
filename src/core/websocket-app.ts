import { Server as HttpServer } from "http";
import { Server as WebSocketServer, WebSocket } from "ws";

import { WebSocketActions, WebSocketEvents } from "./enums";

export interface WebsocketUserClient extends WebSocket {
  isAdmin?: boolean;
}

export class WebSocketApp {
  private webSocketServer: WebSocketServer;
  private users: Array<WebsocketUserClient>;

  constructor(httpServer: HttpServer) {
    this.webSocketServer = new WebSocketServer({ server: httpServer });
    this.users = [];
  }

  get participants(): Array<WebsocketUserClient> {
    return Array.from(this.users).filter((user) => !user.isAdmin);
  }

  private handleCloseConnection(user: WebsocketUserClient) {
    this.users = this.users.filter((userClient) => userClient !== user);
    this.updateAdminClientCount();
  }

  private handleIncomingMessage(user: WebsocketUserClient, msg: string) {
    const data = JSON.parse(msg);
    const action = data.action;

    switch (action) {
      case WebSocketActions.ADMIN:
        user.isAdmin = true;
        break;
      case WebSocketActions.DRAW:
        this.handleDraw(data.code);
        break;
      default:
        console.warn("Ação desconhecida:", action);
    }
  }

  private handleCountdown(): Promise<void> {
    return new Promise((resolve) => {
      const count = 5;
      for (let i = 1; i <= count; i++) {
        setTimeout(() => {
          this.participants.forEach((user: WebsocketUserClient) => {
            user.send(
              JSON.stringify({
                end: count,
                current: i,
                action: WebSocketActions.COUNTDOWN,
              })
            );
          });
          if (i == 5) resolve();
        }, i * 1000);
      }
    });
  }

  private generateWinner() {
    return this.participants[
      Math.floor(Math.random() * this.participants.length)
    ];
  }

  private notifyResult(winner: WebsocketUserClient, code: string) {
    this.participants.forEach((user: WebsocketUserClient) => {
      let result = JSON.stringify({
        action: WebSocketActions.RESULT,
        status: "youlose",
      });
      if (user === winner) {
        result = JSON.stringify({
          action: WebSocketActions.RESULT,
          status: "youwin",
          code,
        });
      }
      user.send(result);
    });
  }

  private async handleDraw(confirmationCode: string) {
    await this.handleCountdown();
    this.notifyResult(this.generateWinner(), confirmationCode);
  }

  private updateAdminClientCount() {
    const clientCount = Array.from(this.users).filter(
      (user) => !user.isAdmin
    ).length;

    Array.from(this.users).forEach((client) => {
      if (client.isAdmin && client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            action: WebSocketActions.CLIENT_COUNT_UPDATE,
            count: clientCount,
          })
        );
      }
    });
  }

  listen() {
    this.webSocketServer.on("connection", (user: WebsocketUserClient) => {
      console.log("Websocket server started ws://localhost:3000");
      this.users.push(user);
      this.updateAdminClientCount();

      user.on(
        WebSocketEvents.MESSAGE,
        this.handleIncomingMessage.bind(this, user)
      );

      user.on(
        WebSocketEvents.CLOSE,
        this.handleCloseConnection.bind(this, user)
      );
    });
  }
}

import { Transport, TransportPinnedConn } from "@/common/transport/transport";
import { SavedConnection } from "./SavedConnection";
import Vue from 'vue';
import { BaseUtilityAppDbEntity } from "./BaseUtilityAppDbEntity";
import { baseFind, baseFindOne } from "./Util";

export class PinnedConnection extends BaseUtilityAppDbEntity implements TransportPinnedConn {
  constructor(connection?: SavedConnection) {
    super('pinconn');

    if (!connection) return;

    this.connectionId = connection.id;
    this.workspaceId = connection.workspaceId;
  }

  static async find(options?: any): Promise<PinnedConnection[]> {
    return await baseFind('pinconn', options, PinnedConnection);
  }

  static async findOne(options?: any): Promise<PinnedConnection> {
    return await baseFindOne('pinconn', options, PinnedConnection);
  }

  static async save<T extends Transport>(entities: T[], options?: any): Promise<T[]> {
    return await Vue.prototype.$util.send('appdb/pinconn/savemult', { entities, options });
  }

  id: number | null = null;
  position: number = 99.0;
  connectionId: number;
  workspaceId: number = -1;
  connection: SavedConnection;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
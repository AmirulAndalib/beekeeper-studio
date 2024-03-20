// Copyright (c) 2015 The SQLECTRON Team, 2020 Beekeeper Studio team
import { IDbConnectionDatabase, IDbConnectionServer } from "./types"
import { MysqlClient } from './clients/mysql';
import { PostgresClient } from './clients/postgresql';
import { SQLServerClient } from './clients/sqlserver';
import { SqliteClient } from './clients/sqlite';
import { MariaDBClient } from './clients/mariadb';
import { RedshiftClient } from './clients/redshift';
import { CockroachClient } from './clients/cockroach';
import { BigQueryClient } from './clients/bigquery';
import { FirebirdClient } from './clients/firebird';
import { OracleClient } from "./clients/oracle";
import { DuckDBClient } from "./clients/duckdb";

const clients = new Map<string, any>([
  ['mysql', MysqlClient],
  ['postgresql', PostgresClient],
  ['sqlserver', SQLServerClient],
  ['sqlite', SqliteClient],
  ['redshift', RedshiftClient],
  ['mariadb', MariaDBClient],
  ['cockroachdb', CockroachClient],
  ['bigquery', BigQueryClient],
  ['firebird', FirebirdClient],
  ['oracle', OracleClient],
  ['duckdb', DuckDBClient],
], );


class FriendlyErrorClient {
  constructor() {
    throw new Error("Unknown DB type. You need to add a driver -> class mapping in src/lib/db/client.ts")
  }
}

export class ClientError extends Error {
  helpLink = null
  constructor(message: string, helpLink: string) {
    super(message)
    this.helpLink = helpLink
  }
}

export function createConnection(server: IDbConnectionServer, database: IDbConnectionDatabase ) {
  /**
   * Database public API
   */
  const client = clients.get(server.config.client) || FriendlyErrorClient;
  return new client(server, database);
}

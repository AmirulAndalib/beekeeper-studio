import _ from "lodash";
import {
  ColumnType,
  defaultWrapLiteral,
  DialectData,
  friendlyNormalizedIdentifier,
} from "./models";
import Firebird from "node-firebird";

// prettier-ignore
const types = [
  "BIGINT", "BINARY", "BLOB", "BOOLEAN", "CHAR", "CHARACTER", "DATE", "DECFLOAT",
  "DECIMAL", "DOUBLE PRECISION", "FLOAT", "FLOAT", "INTEGER", "INT", "INT128",
  "NUMERIC", "REAL", "SMALLINT", "TIME", "TIMESTAMP", "VARBINARY", "BINARY VARYING",
  "VARCHAR", "CHAR VARYING", "CHARACTER VARYING",
];

const supportsLength = [];

function wrapIdentifier(id: string) {
  if (id.includes(" ")) return `"${id}"`;
  return id;
}

export const FirebirdData: DialectData = {
  columnTypes: types.map((t) => new ColumnType(t, supportsLength.includes(t))),
  constraintActions: [],
  wrapIdentifier,
  editorFriendlyIdentifier: friendlyNormalizedIdentifier,
  escapeString: (s) => Firebird.escape(s),
  wrapLiteral: Firebird.escape,
  unwrapIdentifier: defaultWrapLiteral,
  disabledFeatures: {
    backup: true,
    truncateElement: true,
    duplicateTable: true,
    createTable: true, // Blocked by knex builder creating unnecessary query
    collations: true,
  },
  notices: {},
};

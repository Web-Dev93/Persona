import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "./schema";

/**
 * Both supported drivers (node-postgres and PGlite) expose the same Drizzle
 * query-builder surface. The node-postgres flavour is used as the single public
 * type so consumers get real result types regardless of which backend booted.
 */
export type Database = NodePgDatabase<typeof schema>;

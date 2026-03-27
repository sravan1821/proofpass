/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from "node:crypto";
import { getMongoDb } from "@/lib/db/mongodb";

type QueryOptions = {
  count?: "exact";
  head?: boolean;
};

type OrderOptions = {
  ascending?: boolean;
};

type QueryResult<T> = {
  data: T;
  error: { message: string } | null;
  count?: number | null;
};

type StoredRecord = Record<string, any>;

class MongoQuery<T extends StoredRecord = StoredRecord> implements PromiseLike<QueryResult<T[] | T | null>> {
  private filters: Array<(record: StoredRecord) => boolean> = [];
  private orderBy: { field: string; ascending: boolean } | null = null;
  private rowLimit: number | null = null;
  private mode: "select" | "insert" | "update" | "delete" = "select";
  private payload: StoredRecord | StoredRecord[] | null = null;
  private selectClause = "*";
  private selectOptions: QueryOptions = {};
  private expectSingle = false;
  private expectMaybeSingle = false;

  constructor(private readonly table: string) {}

  select(columns = "*", options: QueryOptions = {}) {
    this.mode = "select";
    this.selectClause = columns;
    this.selectOptions = options;
    return this;
  }

  insert(payload: StoredRecord | StoredRecord[]) {
    this.mode = "insert";
    this.payload = payload;
    return this;
  }

  update(payload: StoredRecord) {
    this.mode = "update";
    this.payload = payload;
    return this;
  }

  delete() {
    this.mode = "delete";
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push((record) => this.getFieldValue(record, field) === value);
    return this;
  }

  in(field: string, values: unknown[]) {
    this.filters.push((record) => values.includes(this.getFieldValue(record, field)));
    return this;
  }

  order(field: string, options: OrderOptions = {}) {
    this.orderBy = {
      field,
      ascending: options.ascending !== false,
    };
    return this;
  }

  limit(value: number) {
    this.rowLimit = value;
    return this;
  }

  filter(field: string, operator: string, value: unknown) {
    if (operator !== "eq") {
      this.filters.push(() => false);
      return this;
    }

    if (field === "data_json->>email") {
      this.filters.push((record) => {
        const dataJson = record.data_json as Record<string, unknown> | undefined;
        return dataJson?.email === value;
      });
      return this;
    }

    this.filters.push((record) => this.getFieldValue(record, field) === value);
    return this;
  }

  single() {
    this.expectSingle = true;
    return this.execute() as Promise<QueryResult<T | null>>;
  }

  maybeSingle() {
    this.expectMaybeSingle = true;
    return this.execute() as Promise<QueryResult<T | null>>;
  }

  then<TResult1 = QueryResult<T[] | T | null>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<T[] | T | null>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(): Promise<QueryResult<T[] | T | null>> {
    try {
      const db = await getMongoDb();
      if (!db) {
        return { data: null, error: { message: "Service unavailable" }, count: null };
      }

      const collection = db.collection<StoredRecord>(this.table);

      switch (this.mode) {
        case "insert":
          return this.executeInsert(collection) as Promise<QueryResult<T[] | T | null>>;
        case "update":
          return this.executeUpdate(collection) as Promise<QueryResult<T[] | T | null>>;
        case "delete":
          return this.executeDelete(collection) as Promise<QueryResult<T[] | T | null>>;
        default:
          return this.executeSelect(collection) as Promise<QueryResult<T[] | T | null>>;
      }
    } catch (error) {
      return {
        data: null,
        error: { message: error instanceof Error ? error.message : "Unknown database error" },
        count: null,
      };
    }
  }

  private async executeSelect(collection: any) {
    let rows: StoredRecord[] = await collection.find({}).toArray();
    rows = this.applyFilters(rows);
    const count = rows.length;
    rows = await this.enrichRows(rows);
    rows = this.applyOrder(rows);
    rows = this.applyLimit(rows);

    if (this.selectOptions.head) {
      return {
        data: null,
        error: null,
        count,
      };
    }

    if (this.expectSingle || this.expectMaybeSingle) {
      return {
        data: (rows[0] ?? null) as T | null,
        error: null,
        count,
      };
    }

    return {
      data: rows as T[],
      error: null,
      count,
    };
  }

  private async executeInsert(collection: any) {
    const payloads = (Array.isArray(this.payload) ? this.payload : [this.payload]).filter(Boolean) as StoredRecord[];
    const now = new Date().toISOString();
    const documents = payloads.map((payload) => ({
      id: (payload.id as string | undefined) ?? randomUUID(),
      created_at: (payload.created_at as string | undefined) ?? now,
      updated_at: (payload.updated_at as string | undefined) ?? now,
      ...payload,
    }));

    if (documents.length > 0) {
      await collection.insertMany(documents);
    }

    const enriched = await this.enrichRows(documents);
    if (this.expectSingle) {
      return { data: (enriched[0] ?? null) as T | null, error: null, count: null };
    }

    return {
      data: this.selectClause === "*" || this.selectClause ? (enriched as T[]) : null,
      error: null,
      count: null,
    };
  }

  private async executeUpdate(collection: any) {
    let rows: StoredRecord[] = await collection.find({}).toArray();
    rows = this.applyFilters(rows);
    const ids = rows.map((row: StoredRecord) => row.id);

    if (ids.length > 0) {
      await collection.updateMany(
        { id: { $in: ids } },
        {
          $set: {
            ...(this.payload ?? {}),
            updated_at: new Date().toISOString(),
          },
        },
      );
    }

    const updatedRows = await collection.find({ id: { $in: ids } }).toArray();
    const enriched = await this.enrichRows(updatedRows);
    const ordered = this.applyLimit(this.applyOrder(enriched));

    if (this.expectSingle || this.expectMaybeSingle) {
      return { data: (ordered[0] ?? null) as T | null, error: null, count: null };
    }

    return { data: ordered as T[], error: null, count: null };
  }

  private async executeDelete(collection: any) {
    let rows: StoredRecord[] = await collection.find({}).toArray();
    rows = this.applyFilters(rows);
    const ids = rows.map((row: StoredRecord) => row.id);

    if (ids.length > 0) {
      await collection.deleteMany({ id: { $in: ids } });
    }

    if (this.expectSingle || this.expectMaybeSingle) {
      return { data: (rows[0] ?? null) as T | null, error: null, count: null };
    }

    return { data: rows as T[], error: null, count: null };
  }

  private applyFilters(rows: StoredRecord[]) {
    return rows.filter((row) => this.filters.every((predicate) => predicate(row)));
  }

  private applyOrder(rows: StoredRecord[]) {
    if (!this.orderBy) return rows;

    const { field, ascending } = this.orderBy;
    return [...rows].sort((left, right) => {
      const a = this.getFieldValue(left, field);
      const b = this.getFieldValue(right, field);
      if (a === b) return 0;
      if (a == null) return ascending ? 1 : -1;
      if (b == null) return ascending ? -1 : 1;
      if (String(a) < String(b)) return ascending ? -1 : 1;
      return ascending ? 1 : -1;
    });
  }

  private applyLimit(rows: StoredRecord[]) {
    return this.rowLimit == null ? rows : rows.slice(0, this.rowLimit);
  }

  private getFieldValue(record: StoredRecord, field: string) {
    return field.split(".").reduce<unknown>((current, key) => {
      if (!current || typeof current !== "object") return undefined;
      return (current as Record<string, unknown>)[key];
    }, record);
  }

  private async enrichRows(rows: StoredRecord[]) {
    const db = await getMongoDb();
    if (!db || rows.length === 0) return rows;

    if (this.table === "events" && this.selectClause.includes("profiles!events_organizer_id_fkey")) {
      const profiles = await db
        .collection<StoredRecord>("profiles")
        .find({ id: { $in: rows.map((row) => row.organizer_id).filter(Boolean) as string[] } })
        .toArray();
      const map = new Map(profiles.map((profile) => [profile.id, profile]));
      return rows.map((row) => ({
        ...row,
        profiles: map.get(row.organizer_id as string) ?? null,
      }));
    }

    if (this.table === "forms" && this.selectClause.includes("profiles(")) {
      const profiles = await db
        .collection<StoredRecord>("profiles")
        .find({ id: { $in: rows.map((row) => row.organizer_id).filter(Boolean) as string[] } })
        .toArray();
      const map = new Map(profiles.map((profile) => [profile.id, profile]));
      return rows.map((row) => ({
        ...row,
        profiles: map.get(row.organizer_id as string) ?? null,
      }));
    }

    if (this.table === "certificates" && this.selectClause.includes("events(")) {
      const events = await db
        .collection<StoredRecord>("events")
        .find({ id: { $in: rows.map((row) => row.event_id).filter(Boolean) as string[] } })
        .toArray();
      const map = new Map(events.map((event) => [event.id, event]));
      return rows.map((row) => ({
        ...row,
        events: map.get(row.event_id as string) ?? null,
      }));
    }

    if (this.table === "event_registrations" && this.selectClause.includes("events(")) {
      const events = await db
        .collection<StoredRecord>("events")
        .find({ id: { $in: rows.map((row) => row.event_id).filter(Boolean) as string[] } })
        .toArray();
      const map = new Map(events.map((event) => [event.id, event]));
      return rows.map((row) => ({
        ...row,
        events: map.get(row.event_id as string) ?? null,
      }));
    }

    return rows;
  }
}

class MongoClientFacade {
  from(table: string): any {
    return new MongoQuery(table);
  }
}

export async function createMongoServerClient(): Promise<any> {
  const db = await getMongoDb();
  if (!db) return null;
  return new MongoClientFacade();
}

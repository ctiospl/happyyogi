-- Example migration demonstrating PostgreSQL 18 MERGE statement
-- MERGE provides atomic upsert operations in a single statement

CREATE TABLE IF NOT EXISTS example_items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PG18 MERGE: Atomically insert or update based on match condition
MERGE INTO example_items AS target
USING (VALUES ('sample_item', 1)) AS source(name, count)
ON target.name = source.name
WHEN MATCHED THEN
    UPDATE SET
        count = target.count + source.count,
        updated_at = NOW()
WHEN NOT MATCHED THEN
    INSERT (name, count, updated_at)
    VALUES (source.name, source.count, NOW());

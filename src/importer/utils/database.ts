import { Pool } from "pg"
import { v4 as uuidv4 } from 'uuid'
import { from as copyFrom } from 'pg-copy-streams'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import { FormattedStation } from "@shared/models/formatted-station"

const TEMP_TABLE = "temp_historic_import"

// Columns of historic_data in exact order (id + all 26 fields)
const COLUMNS = [
  "id",
  "stationId",
  "stationSignage",
  "adbluePrice",
  "ammoniaPrice",
  "biodieselPrice",
  "bioethanolPrice",
  "compressedBiogasPrice",
  "liquefiedBiogasPrice",
  "renewableDieselPrice",
  "cngPrice",
  "lngPrice",
  "lpgPrice",
  "gasoilAPrice",
  "gasoilBPrice",
  "premiumGasoilPrice",
  "gasoline95E10Price",
  "gasoline95E25Price",
  "gasoline95E5Price",
  "gasoline95E5PremiumPrice",
  "gasoline95E85Price",
  "gasoline98E10Price",
  "gasoline98E5Price",
  "renewableGasolinePrice",
  "hydrogenPrice",
  "methanolPrice",
  "date"
] as const

const COLUMN_NAMES_QUOTED = COLUMNS.map(c => `"${c}"`).join(", ")

const TEMP_TABLE_SCHEMA = `
  "id" UUID,
  "stationId" VARCHAR,
  "stationSignage" VARCHAR,
  "adbluePrice" DOUBLE PRECISION,
  "ammoniaPrice" DOUBLE PRECISION,
  "biodieselPrice" DOUBLE PRECISION,
  "bioethanolPrice" DOUBLE PRECISION,
  "compressedBiogasPrice" DOUBLE PRECISION,
  "liquefiedBiogasPrice" DOUBLE PRECISION,
  "renewableDieselPrice" DOUBLE PRECISION,
  "cngPrice" DOUBLE PRECISION,
  "lngPrice" DOUBLE PRECISION,
  "lpgPrice" DOUBLE PRECISION,
  "gasoilAPrice" DOUBLE PRECISION,
  "gasoilBPrice" DOUBLE PRECISION,
  "premiumGasoilPrice" DOUBLE PRECISION,
  "gasoline95E10Price" DOUBLE PRECISION,
  "gasoline95E25Price" DOUBLE PRECISION,
  "gasoline95E5Price" DOUBLE PRECISION,
  "gasoline95E5PremiumPrice" DOUBLE PRECISION,
  "gasoline95E85Price" DOUBLE PRECISION,
  "gasoline98E10Price" DOUBLE PRECISION,
  "gasoline98E5Price" DOUBLE PRECISION,
  "renewableGasolinePrice" DOUBLE PRECISION,
  "hydrogenPrice" DOUBLE PRECISION,
  "methanolPrice" DOUBLE PRECISION,
  "date" DATE
`

/** Format a single value for PostgreSQL text COPY format. */
const formatCopyValue = (val: unknown): string => {
  if (val == null) return "\\N"
  return String(val)
}

/** Convert a FormattedStation to a tab-separated COPY row. */
const stationToCopyRow = (station: FormattedStation): string => {
  const values = [
    uuidv4(),
    station.stationId,
    station.stationSignage,
    station.adbluePrice,
    station.ammoniaPrice,
    station.biodieselPrice,
    station.bioethanolPrice,
    station.compressedBiogasPrice,
    station.liquefiedBiogasPrice,
    station.renewableDieselPrice,
    station.cngPrice,
    station.lngPrice,
    station.lpgPrice,
    station.gasoilAPrice,
    station.gasoilBPrice,
    station.premiumGasoilPrice,
    station.gasoline95E10Price,
    station.gasoline95E25Price,
    station.gasoline95E5Price,
    station.gasoline95E5PremiumPrice,
    station.gasoline95E85Price,
    station.gasoline98E10Price,
    station.gasoline98E5Price,
    station.renewableGasolinePrice,
    station.hydrogenPrice,
    station.methanolPrice,
    station.date
  ]
  return values.map(formatCopyValue).join("\t") + "\n"
}

/**
 * Imports an array of FormattedStation into the historic_data table
 * using PostgreSQL COPY for bulk loading + ON CONFLICT for deduplication.
 *
 * Pipeline: JSON array → CSV strings → COPY INTO temp table → INSERT ON CONFLICT
 */
export const importToDatabase = async (pool: Pool, data: FormattedStation[]) => {
  if (!data.length) return

  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    // 1. Create temp table (auto-dropped on COMMIT)
    await client.query(`CREATE TEMP TABLE ${TEMP_TABLE} (${TEMP_TABLE_SCHEMA}) ON COMMIT DROP`)

    // 2. Convert all stations to COPY-compatible tab-separated rows
    const copyRows = data.map(stationToCopyRow)

    // 3. Stream rows into temp table via COPY
    const sourceStream = Readable.from(copyRows)
    const ingestStream = client.query(copyFrom(`COPY ${TEMP_TABLE} FROM STDIN`))
    await pipeline(sourceStream, ingestStream)

    // 4. INSERT from temp table into historic_data, skipping duplicates
    const insertResult = await client.query(`
      INSERT INTO historic_data (${COLUMN_NAMES_QUOTED})
      SELECT ${COLUMN_NAMES_QUOTED} FROM ${TEMP_TABLE}
      ON CONFLICT ("stationId", "date") DO NOTHING
    `)

    const inserted = insertResult.rowCount ?? 0
    const skipped = data.length - inserted

    console.log(`  → ${inserted.toLocaleString()} inserted, ${skipped.toLocaleString()} duplicates skipped`)

    // 5. Commit (temp table auto-dropped)
    await client.query("COMMIT")
  } catch (error) {
    try {
      await client.query("ROLLBACK")
    } catch {
      // ROLLBACK may fail if transaction is already aborted — ignore
    }
    throw error
  } finally {
    client.release()
  }
}

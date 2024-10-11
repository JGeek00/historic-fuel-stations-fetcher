import { Pool } from "pg"
import { v4 as uuidv4 } from 'uuid';
import { ImportedStation } from "@importer/models/imported-station"

export const importToDatabase = async (pool: Pool, data: ImportedStation[]) => {
  const dataToArray = data.map(station => [uuidv4(), ...Object.values(station)])

  for (const station of dataToArray) {
    const text = 'INSERT INTO historic_data ("id", "stationId", "biodieselPrice", "bioethanolPrice", "CNGPrice", "LNGPrice", "LPGPrice", "gasoilAPrice", "gasoilBPrice", "premiumGasoilPrice", "gasoline95E10Price", "gasoline95E5Price", "gasoline95E5PremiumPrice", "gasoline98E10Price", "gasoline98E5Price", "hydrogenPrice", "date") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)';
    await pool.query(text, station);
  }
}
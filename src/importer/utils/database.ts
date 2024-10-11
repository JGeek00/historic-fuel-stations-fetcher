import { Pool } from "pg"
import { v4 as uuidv4 } from 'uuid';
import { ImportedStation } from "@importer/models/imported-station"

export const importToDatabase = async (pool: Pool, data: ImportedStation[]) => {
  const dataToArray = data.map(station => [uuidv4(), ...Object.values(station)])

  for (const station of dataToArray) {
    const text = 'INSERT INTO historic_data ("id", "station_id", "biodiesel_price", "bioethanol_price", "cng_price", "lng_price", "lpg_price", "gasoil_a_price", "gasoil_b_price", "premium_gasoil_price", "gasoline_95_e10_price", "gasoline_95_e5_price", "gasoline_95_e5_premium_price", "gasoline_98_e10_price", "gasoline_98_e5_price", "hydrogen_price", "date") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)';
    await pool.query(text, station);
  }
}
import fs from 'fs/promises';
import { assertEquals } from 'typia';
import { FormattedStation } from "@/models/formatted-station";

const filePath = "./stations.json"

const fileExists = async () => {
  try {
    await fs.access(filePath);
    return true
  } catch {
    return false
  }
}

export const writeToJsonFile = async (stations: Array<FormattedStation>) => {
  try {
    let exists = await fileExists()
    if (exists) {
      const data = await fs.readFile(filePath, 'utf8');
      const jsonData = JSON.parse(data);

      let parsedResult = assertEquals<Array<FormattedStation>>(jsonData)
      parsedResult = [
        ...parsedResult,
        ...stations
      ]

      await fs.writeFile(filePath, JSON.stringify(parsedResult), 'utf8');
    }
    else {
      await fs.writeFile(filePath, JSON.stringify(stations), 'utf8');
    }
  } catch (error) {
    console.error(error)
  }
}
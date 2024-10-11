import fs from 'fs/promises';
import { assertEquals } from 'typia';
import { FormattedStation } from "@fetcher/models/formatted-station";

const checkPathExists = async (filePath: string) => {
  try {
    await fs.access(filePath);
    return true
  } catch {
    return false
  }
}

export const writeToJsonFile = async (stations: Array<FormattedStation>, round: number) => {
  const filePath = `data/stations-${round}.json`
  try {
    const dirExists = await checkPathExists("./data")
    if (!dirExists) {
      await fs.mkdir("./data")
    }

    const fileExists = await checkPathExists(filePath)
    if (fileExists) {
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
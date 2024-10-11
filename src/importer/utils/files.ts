import fs from 'fs/promises';
import { assertEquals } from 'typia';
import { ImportedStation } from '@importer/models/imported-station';
import { DatabaseConnection } from '@importer/models/database-connection';
import { formatDateForDatabase } from '@importer/utils/date';

export const readDatabaseConnectionFile = async (filePath: string) => {
  try {
    const file = await fs.readFile(filePath)
    const parsedJson = JSON.parse(file.toString())
    const parsedResult = assertEquals<DatabaseConnection>(parsedJson)
    return parsedResult
  } catch (error) {
    console.error(error)
    return null
  }
}

export const checkPathExists = async (filePath: string) => {
  try {
    await fs.access(filePath);
    return true
  } catch {
    return false
  }
} 

export const readDataFiles = async (directory: string) => {
  const fileRegexp = /^stations-\d+\.json$/
  try {
    const dirFiles = await fs.readdir(directory)
    const dataFiles = dirFiles.filter(file => fileRegexp.test(file))
    return dataFiles
  } catch (error) {
    console.error(error)
    return null
  }
}

export const readParseFile = async (filePath: string) => {
  try {
    const file = await fs.readFile(filePath)
    const parsedJson = JSON.parse(file.toString())
    let parsedResult = assertEquals<Array<ImportedStation>>(parsedJson)
    parsedResult = parsedResult.map(station => ({
      ...station,
      date: formatDateForDatabase(station.date)
    }))
    return parsedResult
  } catch (error) {
    console.error(error)
    return null
  }
}
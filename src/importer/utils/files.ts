import fs from 'fs/promises';
import { assertEquals } from 'typia';
import { ImportedStation } from '@importer/models/imported-station';

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
    console.log(dirFiles)
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
    const parsedResult = assertEquals<Array<ImportedStation>>(parsedJson)
    return parsedResult
  } catch (error) {
    console.error(error)
    return null
  }
}
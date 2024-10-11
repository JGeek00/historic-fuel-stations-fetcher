import { Pool } from "pg";
import { checkPathExists, readDatabaseConnectionFile, readDataFiles, readParseFile } from "@importer/utils/files";
import { importToDatabase } from '@importer/utils/database';

const baseDir = "./data"

const main = async () => {
  const databaseConnectionData = await readDatabaseConnectionFile("./database-connection-data.json")
  if (!databaseConnectionData) {
    throw new Error("database-connection-data.json file doesn't exist or it's format is invalid")
  }

  const databasePool = new Pool({
    user: databaseConnectionData.user,
    host: databaseConnectionData.host,
    database: databaseConnectionData.database,
    password: databaseConnectionData.password,
    port: databaseConnectionData.port,
  })

  const pathExists = await checkPathExists(baseDir)
  if (!pathExists) {
    throw new Error("Directory ./data does not exist")
  }

  const dataFiles = await readDataFiles(baseDir)
  if (!dataFiles || dataFiles.length == 0) {
    console.log("No data files to import")
    return
  }

  try {
    for (const key in dataFiles) {
      const fileData = await readParseFile(`${baseDir}/${dataFiles[key]}`)
      if (!fileData) {
        throw new Error(`File ${dataFiles[key]} has invalid data`)
      }
      
      console.log(`⬇ Importing data file ${key}`)
      await importToDatabase(databasePool, fileData)
      console.log(`✅ File ${key} imported successfully`)
    }
  } catch (error) {
    console.error(error)
    await databasePool.end()
  }
}

main()
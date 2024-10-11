import { checkPathExists, readDataFiles, readParseFile } from "@importer/utils/files";

const baseDir = "./data"

const main = async () => {
  const pathExists = await checkPathExists(baseDir)
  if (!pathExists) {
    throw new Error("Directory ./data does not exist")
  }

  const dataFiles = await readDataFiles(baseDir)
  if (!dataFiles || dataFiles.length == 0) {
    console.log("No data files to import")
    return
  }

  for (const key in dataFiles) {
    const fileData = await readParseFile(`${baseDir}/${dataFiles[key]}`)
    if (!fileData) {
      throw new Error(`File ${dataFiles[key]} has invalid data`)
    }

    
  }
}

main()
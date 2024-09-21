import { readFile, writeFile } from 'node:fs/promises'

import { parseXml, serializeXml } from './xml.js'

export const readPom = async (path) => {
  try {
    return parseXml(await readFile(path, 'utf8'))
  } catch (e) {
    throw new Error(`Failed to read ${path}: ${e.message}`, { cause: e })
  }
}

export const writePom = async (path, doc) => {
  try {
    await writeFile(path, serializeXml(doc), 'utf8')
  } catch (e) {
    throw new Error(`Failed to write ${path}: ${e.message}`, { cause: e })
  }
}

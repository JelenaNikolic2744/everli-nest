import * as fs from 'fs/promises'
import * as path from 'path'

import { WitnessReport } from '../interface/witnessReport.interface'

// Define the directory where reports will be stored
const reportsDir = path.resolve('reports')
// Define the full path to the JSON file that stores the reports
const filePath = path.join(reportsDir, 'reports.json')

/**
 * Saves a witness report by appending it to the existing list of reports in a JSON file.
 * Creates the reports directory and file if they do not exist.
 *
 * @param report - The witness report object to save.
 */
export async function saveReport(report: WitnessReport): Promise<void> {
  try {
    await fs.mkdir(reportsDir, { recursive: true })

    let existingReports: WitnessReport[] = []

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8')
      if (fileContent.trim()) {
        existingReports = JSON.parse(fileContent) as WitnessReport[]
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Error reading or parsing existing reports:', error)
      }
    }

    existingReports.push(report)

    await fs.writeFile(
      filePath,
      JSON.stringify(existingReports, null, 2),
      'utf-8',
    )
  } catch (err) {
    console.error('Failed to save report:', err)
    // Optional: rethrow if you want to let the controller/service decide
    // throw err
  }
}

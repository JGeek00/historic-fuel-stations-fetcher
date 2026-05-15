import { Interval, DateTime } from 'luxon';
import axios from 'axios';
import { assert } from 'typia';
import { twoDigits } from '@fetcher/utils/numbers';
import { sleep } from '@fetcher/utils/sleep';
import { HistoricServiceStationsResult } from '@fetcher/models/historic-service-stations-result';
import { parseStationResult } from '@fetcher/parseStationResult';
import { FormattedStation } from '@shared/models/formatted-station';
import { writeToJsonFile } from '@fetcher/writeToJson';

function printHelp(): void {
  console.log(`
Usage: fetcher [options]

Options:
  --from-date <dd-mm-yyyy>  Start date to fetch data from (default: 1 year ago)
  --to-date <dd-mm-yyyy>    End date to fetch data to (default: today)
  -h, --help                Show this help message

Examples:
  fetcher                                    # Fetches last year of data
  fetcher --from-date 01-01-2024            # From 1 Jan 2024 to today
  fetcher --to-date 31-03-2024              # From 1 year ago to 31 Mar 2024
  fetcher --from-date 01-01-2024 --to-date 31-03-2024  # Custom date range
  `);
}

function parseArgs(): { fromDate?: string; toDate?: string } {
  const args = process.argv.slice(2);
  const result: { fromDate?: string; toDate?: string } = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-h' || args[i] === '--help') {
      printHelp();
      process.exit(0);
    } else if (args[i] === '--from-date' && args[i + 1]) {
      result.fromDate = args[++i];
    } else if (args[i] === '--to-date' && args[i + 1]) {
      result.toDate = args[++i];
    }
  }
  return result;
}

function parseDate(input: string | undefined, fallback: DateTime, label: string): DateTime {
  if (!input) return fallback;
  const dt = DateTime.fromFormat(input, 'dd-MM-yyyy');
  if (!dt.isValid) {
    console.error(`Error: Invalid date for ${label}: "${input}". Expected format: dd-mm-yyyy`);
    process.exit(1);
  }
  return dt;
}

const main = async () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const defaultToday = DateTime.now().setZone(timezone).set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  const defaultFromDate = defaultToday.minus({ year: 1, days: 1 })

  const { fromDate, toDate } = parseArgs()
  const today = parseDate(toDate, defaultToday, '--to-date')
  let beginDate = parseDate(fromDate, defaultFromDate, '--from-date')

  if (beginDate >= today) {
    console.error('Error: --from-date must be earlier than --to-date');
    process.exit(1);
  }
  
  let allDates: DateTime[] = []
  let currentDate = beginDate
  let remainingDays = Interval.fromDateTimes(beginDate, today).length('days') - 1
  while (remainingDays > 0) {
    allDates.push(currentDate)
    currentDate = currentDate.plus({ day: 1 })
    remainingDays--
  }
  
  let grouped = [];
  for (let i = 0; i < allDates.length; i += 7) {
    grouped.push(allDates.slice(i, i + 7));
  }
  
  try {
    for (const groupKey in grouped) {
      const group = grouped[groupKey]
    
      const queries = group.map(date => {
        return axios.get(`https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestresHist/${twoDigits(date.get('day'))}-${twoDigits(date.get('month'))}-${twoDigits(date.get('year'))}`)
      })
  
      console.log(`🛜 Fetch group ${groupKey}: ${twoDigits(group[0].day)}-${twoDigits(group[0].month)}-${group[0].year} to ${twoDigits(group[group.length-1].day)}-${twoDigits(group[group.length-1].month)}-${group[group.length-1].year}`)
      const responses = await Promise.all(queries)
      console.log(`✅ Group ${groupKey} fetched successfully`)

      let stations: Array<FormattedStation> = []
      for (const key in responses) {
        const json = responses[key];
        const parsedResult = assert<HistoricServiceStationsResult>(json.data)
        if (!parsedResult.ListaEESSPrecio || !parsedResult.Fecha) {
          throw new Error("ListaEESSPrecio or Fecha is null")
        }
        
        const parsedStations = parsedResult.ListaEESSPrecio.map(station => parseStationResult(station, parsedResult.Fecha))
        stations = [
          ...stations,
          ...parsedStations
        ]
      }

      await writeToJsonFile(stations, parseInt(groupKey))

      console.log(`💾 Group ${groupKey} saved successfully`)

      await sleep(60000)  // Sleep 1 minute
    }
  } catch (error) {
    console.error(error)
  }
}

main()
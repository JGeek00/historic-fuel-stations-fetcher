import axios from 'axios';
import { Interval, DateTime } from 'luxon';
import { assertEquals } from 'typia';
import { twoDigits } from '@/utils/numbers';
import { sleep } from '@/utils/sleep';
import { HistoricServiceStationsResult } from '@/models/historic-service-stations-result';
import { parseStationResult } from '@/parseStationResult';
import { FormattedStation } from '@/models/formatted-station';
import { writeToJsonFile } from '@/writeToJson';

const main = async () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const today = DateTime.now().setZone(timezone).set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  let beginDate = DateTime.now().setZone(timezone).set({ hour: 0, minute: 0, second: 0, millisecond: 0}).minus({ year: 1, days: 1 })
  
  let allDates = []
  let remainingDays = Interval.fromDateTimes(beginDate, today).length('days') - 1
  while (remainingDays > 0) {
    const newDate = beginDate.plus({ day: 1 })
    allDates.push(newDate);
    beginDate = newDate
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
      const results = await Promise.all(queries)
      console.log(`✅ Group ${groupKey} fetched successfully`)

      let stations: Array<FormattedStation> = []
      for (const key in results) {
        const parsedResult = assertEquals<HistoricServiceStationsResult>(results[key].data)
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

      await sleep(60000)  // Sleep 1 minute
    }
  } catch (error) {
    console.error(error)
  }
}

main()
import { DateTime } from "luxon";
import { HistoricStation } from "@fetcher/models/historic-service-stations-result";
import { FormattedStation } from "@fetcher/models/formatted-station";
import { parseStringToFloat } from "@fetcher/utils/parser";

export const parseStationResult = (station: HistoricStation, date: string) => {
  const d = DateTime.fromFormat(date, "dd/MM/yyyy h:mm:ss").setZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  return <FormattedStation>{
    stationId: station.IDEESS ?? null,
    biodieselPrice: parseStringToFloat(station["Precio Biodiesel"]),
    bioethanolPrice: parseStringToFloat(station["Precio Bioetanol"]),
    CNGPrice: parseStringToFloat(station["Precio Gas Natural Comprimido"]),
    LNGPrice: parseStringToFloat(station["Precio Gas Natural Licuado"]),
    LPGPrice: parseStringToFloat(station["Precio Gases licuados del petróleo"]),
    gasoilAPrice: parseStringToFloat(station["Precio Gasoleo A"]),
    gasoilBPrice: parseStringToFloat(station["Precio Gasoleo B"]),
    premiumGasoilPrice: parseStringToFloat(station["Precio Gasoleo Premium"]),
    gasoline95E10Price: parseStringToFloat(station["Precio Gasolina 95 E10"]),
    gasoline95E5Price: parseStringToFloat(station["Precio Gasolina 95 E5"]),
    gasoline95E5PremiumPrice: parseStringToFloat(station["Precio Gasolina 95 E5 Premium"]),
    gasoline98E10Price: parseStringToFloat(station["Precio Gasolina 98 E10"]),
    gasoline98E5Price: parseStringToFloat(station["Precio Gasolina 98 E5"]),
    hydrogenPrice: parseStringToFloat(station["Precio Hidrogeno"]),
    date: d.toISO()
  }
}
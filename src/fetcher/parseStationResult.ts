import { DateTime } from "luxon";
import { HistoricStation } from "@fetcher/models/historic-service-stations-result";
import { parseStringToFloat } from "@fetcher/utils/parser";
import { FormattedStation } from "@shared/models/formatted-station";

export const parseStationResult = (station: HistoricStation, date: string) => {
  const d = DateTime.fromFormat(date, "dd/MM/yyyy h:mm:ss").setZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  return <FormattedStation>{
    stationId: station.IDEESS,
    stationSignage: station.Rótulo,
    adbluePrice: parseStringToFloat(station["Precio Adblue"]),
    ammoniaPrice: parseStringToFloat(station["Precio Amoniaco"]),
    biodieselPrice: parseStringToFloat(station["Precio Biodiesel"]),
    bioethanolPrice: parseStringToFloat(station["Precio Bioetanol"]),
    compressedBiogasPrice: parseStringToFloat(station["Precio Biogas Natural Comprimido"]),
    liquefiedBiogasPrice: parseStringToFloat(station["Precio Biogas Natural Licuado"]),
    renewableDieselPrice: parseStringToFloat(station["Precio Diésel Renovable"]),
    cngPrice: parseStringToFloat(station["Precio Gas Natural Comprimido"]),
    lngPrice: parseStringToFloat(station["Precio Gas Natural Licuado"]),
    lpgPrice: parseStringToFloat(station["Precio Gases licuados del petróleo"]),
    gasoilAPrice: parseStringToFloat(station["Precio Gasoleo A"]),
    gasoilBPrice: parseStringToFloat(station["Precio Gasoleo B"]),
    premiumGasoilPrice: parseStringToFloat(station["Precio Gasoleo Premium"]),
    gasoline95E10Price: parseStringToFloat(station["Precio Gasolina 95 E10"]),
    gasoline95E25Price: parseStringToFloat(station["Precio Gasolina 95 E25"]),
    gasoline95E5Price: parseStringToFloat(station["Precio Gasolina 95 E5"]),
    gasoline95E5PremiumPrice: parseStringToFloat(station["Precio Gasolina 95 E5 Premium"]),
    gasoline95E85Price: parseStringToFloat(station["Precio Gasolina 95 E85"]),
    gasoline98E10Price: parseStringToFloat(station["Precio Gasolina 98 E10"]),
    gasoline98E5Price: parseStringToFloat(station["Precio Gasolina 98 E5"]),
    renewableGasolinePrice: parseStringToFloat(station["Precio Gasolina Renovable"]),
    hydrogenPrice: parseStringToFloat(station["Precio Hidrogeno"]),
    methanolPrice: parseStringToFloat(station["Precio Metanol"]),
    date: d.toISO()
  }
}
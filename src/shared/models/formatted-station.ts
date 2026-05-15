export interface FormattedStation {
  stationId: string,
  stationSignage: string;
  ammoniaPrice: number | null;
  biodieselPrice: number | null;
  bioethanolPrice: number | null;
  compressedBiogasPrice: number | null;
  liquefiedBiogasPrice: number | null;
  renewableDieselPrice: number | null;
  cngPrice: number | null;
  lngPrice: number | null;
  lpgPrice: number | null;
  gasoilAPrice: number | null;
  gasoilBPrice: number | null;
  premiumGasoilPrice: number | null;
  gasoline95E10Price: number | null;
  gasoline95E25Price: number | null;
  gasoline95E5Price: number | null;
  gasoline95E5PremiumPrice: number | null;
  gasoline95E85Price: number | null;
  gasoline98E10Price: number | null;
  gasoline98E5Price: number | null;
  renewableGasolinePrice: number | null;
  hydrogenPrice: number | null;
  methanolPrice: number | null;
  adbluePrice: number | null;
  date: string,
}
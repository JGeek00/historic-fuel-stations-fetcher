# Historic Fuel Stations Fetcher
This is a script that fetches the fuel stations historic data from the public API of the Spanish government, and then generates a JSON file with the data.

## Compile the release build
1. Run ``npm install``
2. Run ``npm run build``
3. If you want to bundle the script on a single .js file run ``npm run bundle``
4. The script will be in the ``/output`` directory

## How to use the script
1. Open a terminal on the directoy where you have the script
2. Run ``node historic_fuel_stations_fetcher.js``
3. It will generate a ``/data`` directory with all the JSON files inside
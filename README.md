# Historic Fuel Stations Fetcher
This is a script that fetches the fuel stations historic data from the public API of the Spanish government, and then generates a JSON file with the data.

## Compile the release build
1. Run ``npm install``
2. Run ``npm run build``
3. Run ``npm run fetcher:bundle``
3. Run ``npm run importer:bundle``
4. Both script will be in the ``/output`` directory

## How to use the script
##### Prerequisites
- A PostgreSQL database
- Node.js v20

##### Fetch the data
1. Open a terminal on the directory where you have the script
2. Run ``node historic_fuel_stations_fetcher.js``
3. It will generate a ``/data`` directory with all the JSON files inside (be patient, this process takes a long time)

##### Import the data to the database
1. On the same directory where you have your ``historic_fuel_stations_importer.js`` script, create a file called ``database-connection-data.json``. You have an example on this repo
2. Set all the values of that JSON according to your PostgreSQL instance
3. On that same directory, make sure to have a ``/data`` folder with all the generated JSON files inside
3. Run ``node historic_fuel_stations_importer.js`` to start the importing process (this can take a long time)

## Importing a SQL file to PostgreSQL
Run ``psql -U db_user -d db_name < dump.sql``
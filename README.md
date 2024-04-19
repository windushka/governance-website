# Etherlink Governance Web App
This application is designed to display the Etherlink voting status for both the current period and past periods. For this purpose, the application aggregates data from smart contracts used for voting and also displays the configuration of these smart contracts. 
The application is deployed on multiple instances to separately display the voting status in the mainnet and ghostnet networks.

## Scripts
Run the development server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Run the production server:

```bash
npm run start
```

## Deploy
### Setup the environment variable

#### Set the NETWORK_KEY variable
* Set `NETWORK_KEY=mainnet` to use the official mainnet etherlink smart contracts; 
* Set `NETWORK_KEY=ghostnet` to use the official ghostnet etherlink smart contracts; 
* Set `NETWORK_KEY=ghostnet_demo` to use the test ghostnet etherlink smart contracts (periods are short, smart contracts are not tracked by etherlink and it is safe here to do test voting process in order to debug and test voting state UI in the app);

#### Set the DOMAINS variable
The domains variable contains a JSON object that specifies the URLs of deployed instances for each supported network. This information is used by the application to switch between different networks. The value of this variable should be the same across all instances of the application. Certain keys in the JSON object may be omitted to exclude them from the header selector.

Example:

`DOMAINS={"mainnet": "http://mainnet.etherlink.governance.com", "ghostnet": "http://ghostnet.etherlink.governance.com", "ghostnet_demo": "http://demo.etherlink.governance.com"}`
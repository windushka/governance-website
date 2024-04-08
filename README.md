This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

### Setup the environment variable

#### Set the NETWORK_KEY variable
* Set `NETWORK_KEY=mainnet` to use the official mainnet etherlink smart contracts; 
* Set `NETWORK_KEY=ghostnet` to use the official ghostnet etherlink smart contracts; 
* Set `NETWORK_KEY=ghostnet_test` to use the test ghostnet etherlink smart contracts (periods are short, smart contracts are not tracked by etherlink and it is safe here to do test voting process in order to debug and test voting state UI in the app);

#### Set the DOMAINS variable
The domains variable contains a JSON object that specifies the URLs of deployed instances for each supported network. This information is used by the application to switch between different networks. The value of this variable should be the same across all instances of the application. Certain keys in the JSON object may be omitted to exclude them from the header selector.

Example:

`DOMAINS={"mainnet": "http://mainnet.etherlink.governance.com", "ghostnet": "http://ghostnet.etherlink.governance.com", "ghostnet_test": "http://demo.etherlink.governance.com"}`
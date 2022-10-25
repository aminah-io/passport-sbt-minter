# Passport Soulbound Token Minter
## Mint Soulbound Token (SBT) representations of your Gitcoin Passport!

-----
With this project, you can get a taste of soulbound tokens plus mint non-transferable token representations of your Gitcoin Passport stamps on the Goerli network.

*In order to successfully use this app, you will need a Gitcoin Passport with stamps.*
Visit https://passport.gitcoin.co to create your Gitcoin Passport

### To run locally:
1. Install the Passport SBT Minter:

```sh
git clone https://github.com/aminah-io/passport-sbt-minter
cd passport-sbt-minter
npm install
```

2. Create environment files, and replace environment variables with your own values

```sh
cp .env.example .env
```

3. To run the app locally

```sh
npm run dev
```

(The contract address for the Passport SBT Minter has been hard-coded into the .env.example for your use)

### Play with the App
You can visit https://passport-sbt-minter.vercel.app to play with the app!

## Things to remember:
1. Remember to create your .env file before you start if running the project locally
2. Make sure that you're on the Goerli network
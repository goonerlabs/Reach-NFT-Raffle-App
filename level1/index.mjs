import { loadStdlib } from "@reach-sh/stdlib";
import * as backend from "./build/index.main.mjs";
const stdlib = loadStdlib(process.env);

const startingBalance = stdlib.parseCurrency(100);

const [accAlice, accBob] = await stdlib.newTestAccounts(2, startingBalance);
console.log("Hello, Alice and Bob!");

console.log("Launching...");
const ctcAlice = accAlice.contract(backend);
const ctcBob = accBob.contract(backend, ctcAlice.getInfo());

console.log("The creator is creating the NFT");
const theNFT = await stdlib.launchToken(accAlice, "Love", "NFT", { supply: 1 });
const nftParams = {
  nftId: theNFT.id,
  numTickets: 10,
};

const OUTCOME = ["Your number is not a match!", "Your number matches!"];

await accBob.tokenAccept(nftParams.nftId);

const shared = {
  ...stdlib.hasRandom,
  getNum: (numTickets) => {
    const num = Math.floor(Math.random() * numTickets) + 1;
    return num;
  },
  seeOutcome: (outcome) => {
    console.log(OUTCOME[outcome]);
  },
};

console.log("Starting backends...");
await Promise.all([
  backend.Alice(ctcAlice, {
    ...shared,
    // implement Alice's interact object here
    startRaffle: () => nftParams,
    seeHash: (hash) => {
      console.log(`The digest hash is: ${hash}`);
    },
  }),
  backend.Bob(ctcBob, {
    ...shared,
    showNum: (num) => {
      console.log(`Your raffle number is ${num}`);
    },
    seeWinner: (num) => {
      console.log(`The winning number is ${num}`);
    },
    // implement Bob's interact object here
  }),
]);

console.log("Goodbye, Alice and Bob!");
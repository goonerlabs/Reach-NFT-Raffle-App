import { loadStdlib } from "@reach-sh/stdlib";
import * as backend from "./build/index.main.mjs";
const stdlib = loadStdlib(process.env);

const startingBalance = stdlib.parseCurrency(100);

const accAlice = await stdlib.newTestAccount(startingBalance);
console.log("Hello, Alice and Bobs!");

console.log("Launching...");
const ctcAlice = accAlice.contract(backend);
const users = [];

console.log("Alice is creating the NFT");
const theNFT = await stdlib.launchToken(accAlice, "The NFT", "NFT", { supply: 1 });
const nftParams = {
  nftId: theNFT.id,
  numTickets: 10,
};

const OUTCOME = ['Bob1 wins!!!', 'Bob2 wins!!!', 'Bob3 wins!!!', 'Bob4 wins!!!', 'Bob5 wins!!!', 'Bob6 wins!!!', 'Bob7 wins!!!', 'Bob8 wins!!!', 'Bob9 wins!!!', 'Bob10 wins!!!'];

const startBobs = async() => {
 const newBob = async (who) => {
  const acc = await stdlib.newTestAccount(startingBalance);
  const ctc = acc.contract(backend, ctcAlice.getInfo());
  await acc.tokenAccept(nftParams.nftId);
  users.push(acc.getAddress());
 };

 for (let i = 0; i < 6; i++) {
  await newBob(`Bob${i+1}`);
  console.log('creating new Bobs...');
  console.log(`New user Bob${i+1} Just attached to Alice's contract`);
 }
}; 


const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array
}

const common = {
  ...stdlib.hasRandom,
  getNum: (numTickets) => {
    const num = Math.floor(Math.random() * numTickets) + 1;
    return num;
  },
  seeOutcome: (outcome) => {
    console.log(OUTCOME[whoWon]);
  },
  showDigest: (digest) => {
   console.log(`The hash is: ${digest}`);
  }, 
 showNum: (num) => {
  console.log(`You chose this number: ${num}`);
 },
 showWinner: (num) => {
  console.log(`The winning number is ${num}`);
 }
};

console.log("Starting backends...");
await Promise.all([
  backend.Alice(ctcAlice, {
    ...common,
    startRaffle: () => {
      startBobs();
     return nftParams
    },
    setNums: (numTickets) => {
      const numArr = [];
      for (let i = 1; i <= numTickets; i++) {
        numArr.push(i);
      }
    const numArrRandom = shuffleArray(numArr);
    return numArrRandom
    },
    users: users,
  }),
]);

console.log("Goodbye, Alice and Bob!");
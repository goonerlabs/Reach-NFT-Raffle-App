'reach 0.1'

const [isOutcome,  BOB_LOSE, BOB_WINS] = makeEnum(2);

const amt = 1;

const winner = (winningNum,  bobNum) => {
 return bobNum == winningNum ? 1 : 0; 
}

forall(UInt, winningNum => 
 forall(UInt, bobNum => 
  assert(isOutcome(winner(winningNum, bobNum)))));

const common = {
 ...hasRandom,
 getNum: Fun([UInt], UInt),
 seeOutcome: Fun([UInt], Null),
 showDigest: Fun([Digest], Null), 
 showNum: Fun([UInt], Null),
 showWinner: Fun([UInt], Null),
};

export const main = Reach.App(() => {
 const Alice = Participant('Alice', {  
  ...common,
  startRaffle: Fun([], Object({
   nftId: Token,
   numTickets: UInt,
  })),
  setNums: Fun([UInt], Array(UInt, 10)),
  users: Array(Address, 10),
 })
 const Bob = API('Bob',{
  ...common,
 })
 setOptions({untrustworthyMaps: true});
 init();
 Alice.only(() => {
  const {nftId, numTickets} = declassify(interact.startRaffle());
  const _winningNum = interact.getNum(numTickets);
  const [_commitAlice, _saltAlice] = makeCommitment(interact, _winningNum);
  const commitAlice = declassify(_commitAlice);
  const numsArr = declassify(interact.setNums(numTickets));
  interact.showDigest(commitAlice);
  const users = declassify(interact.users);
 });

 Alice.publish(commitAlice, nftId, numTickets, numsArr, users);
 commit();


 Alice.pay([[amt, nftId]]);
 commit();

 Alice.publish();

 const bobsMap = new Map (Address, UInt);


 var counter = 0;
 invariant(balance(nftId) == amt);
 while(counter < 10) {
  bobsMap[users[counter]] = numsArr[counter];
  counter = counter + 1;
  continue;
 }

 Alice.only(() => {
  const saltAlice = declassify(_saltAlice);
  const winningNum = declassify(_winningNum);
 });

 commit();

 Alice.publish(saltAlice, winningNum);
 checkCommitment(commitAlice, saltAlice, winningNum);

 var [outcome, count] = [BOB_LOSE, 0];
 invariant(balance(nftId) == amt && count < users.length && users.length == 10);
 while(outcome == BOB_LOSE || count < users.length) {
  [outcome, count] = [winner(winningNum, bobsMap[users[count]]), count + 1];
  continue;
 }

 transfer(balance(nftId), nftId).to(users[count]);

 if(balance(nftId) > 0){
    transfer(balance(nftId), nftId).to(Alice);
  }

 if(balance() > 0){
    transfer(balance()).to(Alice);
  }
 Alice.interact.seeOutcome(count);
 Alice.interact.showWinner(winningNum);
 
 commit();
 exit();
})
const rollDice = document.getElementById("roll-dice");
const playerDice = document.querySelectorAll(".player-dice");
const diceDots = document.querySelectorAll(".dot");
const remainingRollsCounter = document.getElementById("curr-round-counter");
const startBtn = document.getElementById("start");
const lockBtns = document.querySelectorAll(".dice-lock");
const chooseScoreDisplay = document.getElementById("choose-score-option");
const chooseScoreBtnOptions = document.querySelectorAll(".score-option");
const scoreOptionUpper = document.querySelectorAll(".score-option-upper");
const diceFaces = document.querySelectorAll(".dice");
let currentScoreTotal = document.getElementById("current-score-total");
let rerollCounter : number = 2;
let currentDice : number[] = [];
let currentGameScore : number = 0;
let scoreToBeat : number = 220;
let remainTurns : number = 13;
let selectedScoreValue : number = 0;
let bonusScore : number = 0;
let bonusScoreCheck : boolean = false;
let chance : boolean = true;
const randDiceCol : string[] = ["#A9BCFF", "#9AFFFF", "#18FFB1", "#FFD493", "#FF9F8C", "#FFBDDA"];
const diceColourNameOptions : string[] = ["purple", "blue", "green", "orange", "red", "pink", "ivory", "yellow"];
const scoreTypeCheck = [
  {
    regex: /(.)\1{4}/,
    score: "yahtzee-score"
  },{
    regex: /12345|23456/,
    score: "large-straight-score"
  },{
    regex: /1234|2345|3456/,
    score: "small-straight-score"
  },{
    regex: /(.)\1{2}(.)\2|(.)\3(.)\4{2}/,
    score: "full-house-score"
  },{
    regex: /(.)\1{3}/,
    score: "four-of-a-kind-score"
  },{
    regex: /(.)\1{2}/,
    score: "three-of-a-kind-score"
  }
];


for (let btn of chooseScoreBtnOptions) btn.style.display = "none";

rollDice.style.display = "none";


function rollTheDice() { //implemented "DRY" when assigning values to the dice, moving it to a seperate function
  
   playerDice.forEach((dice) => {
     if (dice.style.disabled !== true)
     {
       dice.innerHTML = ""; //resets the dots in each die for each roll
       dice.classList.remove("bounce");
       let i : number = 0;
       do {
         dice.classList.contains(`dice-face-${i}`) ? dice.classList.remove(`dice-face-${i}`) : i += 1; //stops dice from having more than one 'dice-face-n' and interfering with the CSS
        } while (i <= 6);
  
        dice.value = randomRoll(dice);
        dice.classList.add(`dice-face-${dice.value}`);

       let span = document.createElement("span");
            span.classList.add("dot");
       
       let count : number = 0;
        do {
             dice.appendChild(span.cloneNode())
             count++;
            } while (count < dice.value);

       dotCheck(dice);
       dice.style.disabled = false;
       
        //animation for the dice to give an interactive feel; will only work on non-locked dice.
       for (let index = 0; index < playerDice.length; index++)
       {
          diceBounce(playerDice[index], index * 40)
       }
     }
  });
}


function diceBounce(die, delay) { //timeout for each dice animation to give a staggered effect
   setTimeout(() => {
     die.classList.add("bounce");
   }, delay)
 }


function randomRoll() {
  return Math.floor(Math.random() * 6 + 1);
}


function randomDiceColour() {
  return diceColourNameOptions[Math.floor(Math.random() * diceColourNameOptions.length)] + "-background";
}


function dotCheck(d : Node) { //assigns the correct class to the dots based on the colour of the dice (dark dots on light coluored dice etc...)
  let children = d.childNodes;
  if (!d.classList.contains("ivory-background"))
  {
    for (const el of children)
    {
      if (el.nodeName === "SPAN")
      {
        el.classList.add("dot");
        el.classList.remove("dot-dark");
      } else {return};
    }
  }
  else if (d.classList.contains("ivory-background"))
  { 
    for (const el of children)
    {
      if (el.nodeName === "SPAN")
      {
        el.classList.add("dot-dark");
        el.classList.remove("dot");
        if (d.value === 1)
        {
          el.classList.add("red-one");
          el.style.backgroundColor = "#e33051";
        }
      } else {return};
    }
  }
};


startBtn.addEventListener("click", () => {
  reset();
  if (remainTurns > 0)
    {
     playerDice.forEach((dice) => {
       dice.style.disabled = false;
       dice.style["boxShadow"] = "";
       dice.classList.remove("red-shadow");
       for (let i = 0; i < diceColourNameOptions.length; i++) {
         dice.classList.contains(`${diceColourNameOptions[i]}-background`) ? dice.classList.remove(`${diceColourNameOptions[i]}-background`) : "";
       }
       Math.random() < 0.3 ? dice.classList.add("ivory-background") : dice.classList.add(randomDiceColour());
     });
      
     rollTheDice();
     startBtn.disabled = true;
     rollDice.disabled = false;
     currentDice.length = 0;
     remainingRollsCounter.textContent = "Remaining re-rolls: 2";
     rerollCounter = 2;
     remainTurns -= 1;
     selectedScoreValue = 0;
     document.getElementById("remaining-turns-left").textContent = `Turns left: ${remainTurns}`;
    }
    else
      {
        currentGameScore <= scoreToBeat ? currentScoreTotal.textContent = `You got ${currentGameScore} points, you needed to beat ${scoreToBeat}... You lose...` : currentScoreTotal.textContent = `You got ${currentGameScore} points, You Win!`;
        document.getElementById("current-score-needed").textContent = "";
        document.getElementById("remaining-turns-left").textContent = "";
      }
});


rerollCounter === 0 ? rollDice.disabled = true : rollDice.disabled = false;


rollDice.addEventListener("click", () => {
  rerollCounter < 1 ? startBtn.disabled = false : startBtn.disabled = true;
  rerollCounter == 1 ? rollDice.textContent = "Choose Score" : rollDice.textContent = "Roll";
  if (rerollCounter > 0)
  {
    rerollCounter -= 1;
    remainingRollsCounter.textContent = `Remaining re-rolls: ${rerollCounter}`
    rollTheDice();
   }
  else if (rerollCounter === 0)
  {
    playerDice.forEach((dice) => {
      if (dice.style.disabled !== true) currentDice.push(dice.value); //pushes remaining dice into array that player didnt choose
    });
    remainingRollsCounter.textContent = `Remaining re-rolls: ${rerollCounter}`
    
    startBtn.disabled = false;
    checkScore();
  };
});


//improved visibility for players to see what dice have already been locked in
playerDice.forEach((dice) => {
  dice.addEventListener("click", () => {
    if (!dice.style.disabled)
    {
      currentDice.push(dice.value);
      dice.style["boxShadow"] = "0 0 20px var(--white)";
      dice.style.disabled = true;
    }
    else
    {
      const idx = currentDice.indexOf(dice.value);
      if (idx > -1)
      {
        currentDice.splice(idx, 1);
      }
      dice.style["boxShadow"] = "";
      dice.style.disabled = false;
    }   
  });
});


//allows comparisons to be made between the section boxes and the score buttons
function trim(str) {
  return str.substring(0, str.length - 6);
}


//check what options are available to the player once all rolls have been made
function checkScore() {
  
  let check = currentDice.sort((a,b) => a - b);
  check = check.join("");
  
  rollDice.disabled = true;
  startBtn.disabled = true;

  chance == false ? chance = true : chance = false;

  
  for (let i = 0; i < scoreTypeCheck.length; i++)
    {
       if (scoreTypeCheck[i].regex.test(check))
       {
          if (!document.getElementById(scoreTypeCheck[i].score).classList.contains("alreadyClicked"))
          {
            document.getElementById(scoreTypeCheck[i].score).style.display = "block";
            scoreTypeCheck[i].score == "four-of-a-kind-score" ? document.getElementById(scoreTypeCheck[i].score).value = currentDice.reduce((a,b) => a + b, 0)
            : scoreTypeCheck[i].score == "three-of-a-kind-score" ? document.getElementById(scoreTypeCheck[i].score).value = currentDice.reduce((a,b) => a + b, 0) : "";
          }
       }
    }

  /*
  if (/(.)\1{4}/.test(check)) //Yahtzee check
  {
    if (!document.getElementById("yahtzee-score").classList.contains("alreadyClicked"))
    {
      document.getElementById("yahtzee-score").style.display = "block";
    }
  }
  if (/12345|23456/.test(check)) //large straight check
  {
    if (!document.getElementById("large-straight-score").classList.contains("alreadyClicked"))
    {
      document.getElementById("large-straight-score").style.display = "block";
    }
  }
  if (/1234|2345|3456/.test(Array.from(new Set(check.split(""))).join("").toString())) //small straight check
  {
    if (!document.getElementById("small-straight-score").classList.contains("alreadyClicked"))
    {
      document.getElementById("small-straight-score").style.display = "block";
    }
  }
  if (/(.)\1{2}(.)\2|(.)\3(.)\4{2}/.test(check) && check.substring(0,1) !== check.substring(check.length -1)) //full house check
  {
    if (!document.getElementById("full-house-score").classList.contains("alreadyClicked"))
    {
      document.getElementById("full-house-score").style.display = "block";
    }
  }
  if (/(.)\1{3}/.test(check)) //four of a kind check
  {
    if (!document.getElementById("four-of-a-kind-score").classList.contains("alreadyClicked"))
    {
      document.getElementById("four-of-a-kind-score").style.display = "block";
      document.getElementById("four-of-a-kind-score").value = currentDice.reduce((a,b) => a + b, 0);
    }
    
  }
  if (/(.)\1{2}/.test(check)) //three of a kind check
  {
    if (!document.getElementById("three-of-a-kind-score").classList.contains("alreadyClicked"))
    {
      document.getElementById("three-of-a-kind-score").style.display = "block";
      document.getElementById("three-of-a-kind-score").value = currentDice.reduce((a,b) => a + b, 0);
    }
  }
  */
  if (chance)
  {
    if (!document.getElementById("chance-score").classList.contains("alreadyClicked"))
    {
      document.getElementById("chance-score").style.display = "block";
      document.getElementById("chance-score").value = currentDice.reduce((a,b) => a + b, 0);
    }
  }
  else
  {
    return;
  }
  // works for each of the upper section scores, now to find a way to disable them once already selected
    for (let op of document.querySelectorAll(".score-option-upper"))
    {
      if (currentDice.includes(Number(op.value)) && !op.classList.contains("alreadyClicked"))
      {
        op.style.display = "block";
        op.value = currentDice.filter((v) => v === Number(op.value)).reduce((a,b) => a + b, 0);
      };
    }
  chooseYourScore();
}

function bonusCheck(val : number) {
  let bonusVal : number = 35;
  if (bonusScore >= 63 && !bonusScoreCheck)
  {
    bonusScoreCheck = true;
    document.getElementById("bonus").textContent += ` ${bonusVal}`;
    return true;
  }
  else
  {
    return false;
  }
  
}
function chooseYourScore() {
  //if no options available, player skips banking points
  let count : number = 0;
  for (let i = 0; i < chooseScoreBtnOptions.length; i++) {
    if (chooseScoreBtnOptions[i].style.display === "block") count += 1;
  }
  count <= 0 ? startBtn.disabled = false : startBtn.disabled = true;
  
  let clicked : boolean = false;
  //select which score option to take, will remove the option from future hands
  chooseScoreBtnOptions.forEach((btn) => {
      btn.addEventListener("click", () => {
      if (!clicked) {
      clicked = true;
      btn.classList.add("alreadyClicked");
      btn.classList.contains("score-option-upper") ? bonusScore += Number(btn.value) : "";
      currentGameScore += Number(btn.value);
      bonusCheck(currentGameScore) == true ? currentGameScore += 35 : "";
      currentScoreTotal.textContent = `Current total score: ${currentGameScore}`;
      document.getElementById(trim(btn.id)).textContent = v(btn.id) + `${Number(btn.value)}`;
      startBtn.disabled = false;
      }
        for (let btn of chooseScoreBtnOptions) {
           btn.style.display = "none";
        };
     });
  }); 
}


function reset() {
  let v : number = 1;
  chance = false;
  for (let btn of scoreOptionUpper) { //reassigns the correct initial val to each of the buttons (needs refining somehow...)
    btn.value = v;
    v += 1;
  }
  rollDice.textContent = "Roll";
  rollDice.style.display = "block";
}


function v(str : string) { //changes score id from lowercase to first letter uppercase and returns it along with the chosen score
  let l = str.substring(0, str.length - 6).split("-");
  let o = [];
  o.push(l[0].substring(0,1).toUpperCase() + l[0].substring(1));
  l.forEach((el, index) => {
    if (index === 0) return
    o.push(el);
  })
  return o.length > 1 ? o.join("-") + ": " : `${o}: `;
}

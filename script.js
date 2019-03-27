// let the editor know that `d3` is defined by some code
// included in another file (in this case, `index.html`)
// Note: the code will still work without this line, but
// without it you will see an error in the editor
/* global d3 */ 
//Note to anyone reading this code. Some of the comments are from the original d3-dsv Starter App, some were added for data mystery.
// ~To help make these comment layers intellible, I've added a **DATA MYSTERY COMMENT** to all of the comments added subsequently.


let json; // will hold the parsed JSON
let output = document.getElementById("json-output"); // for easy access to this element
let fieldjson; // **ADDED BY EVE** This is my crazy idea on making a json file with one element for each field name in the column list...
let selectedField
let mode = 'easy';
let selectModeButton; 
let stateModeBox;
let getHintButton;
let hinted = 1


// this function is called when a "change" event happens on the "input" element in the HTML
function loadFile(event) {
  output.innerHTML = ""; // make sure to clear the output when getting a new file
  let file = event.target.files[0]; // the "change" event itself gets passed to this function

  // make sure the file is a CSV
  if (file.type !== "text/csv") {
    printToOutput("This app can only take CSV files!");
    return; // stop trying to do the other stuff in this function
  }

  // read the file with FileReader
  const reader = new FileReader();
  reader.onload = function(e) {
    // this function is called when the reader reads the file
    // use d3-dsv to parse the CSV
    json = d3.csvParse(e.target.result, d3.autoType); // see https://github.com/d3/d3-dsv#autoType
    
    /* **DATA MYSTERY COMMENT**
    We are no longer printing the whole file on-load, to keep all the data a ~mystery~
    */
    //printToOutput(JSON.stringify(json, null, 4));
    printToOutput("Success! We've prepared your data mystery. <br><br>Click ~Mystery Data~ to start.")
    addButtons();
  };
  // reader reads the text of the file, triggering the "onload" function
  reader.readAsText(file);
}

// when a file is added to the page, this function is called
// it adds buttons for transforming the data, which are not
// needed until there is actually data loaded!
function addButtons() {
  // define the column where the buttons will be added
  let operationsCol = document.getElementById("operations");
   // this avoids adding a new set of buttons for every new file chosen
  
   /* **DATA MYSTERY COMMENT**
    This creates the box tells the user what "mode" they're in.
   Note that the hint button only will appear if the user is in "hard" mode, because the hint is part of the default output in easy mode. */
  if (!document.getElementById("state-mode")){
    stateModeBox = document.createElement("div");
    stateModeBox.setAttribute("id", "state-mode");
    stateModeBox.innerHTML = "Current Mode: " + mode;
    operationsCol.appendChild(stateModeBox);
  }
   /* **DATA MYSTERY COMMENT**
    Here we are allowing the user to toggle between modes. 
    */
  if(!document.getElementById("select-mode")){
    selectModeButton = document.createElement("button");
    selectModeButton.setAttribute("id", "select-mode");
    if(mode !== "hard"){
    selectModeButton.innerHTML = "Switch to HARD MODE";
    } else {
    selectModeButton.innerHTML = "Switch to easy mode";
    }
    stateModeBox.appendChild(selectModeButton);
    selectModeButton.addEventListener("click", selectMode);
  }
    /* **DATA MYSTERY COMMENT**
    Here we are allowing the the user to ask for a hint, if they are in hard mode. (Hints are shown by default in easy mode.)
    Note that when getHint() runs, we set "hinted" to 1, so that someone can't reprint the same hint on their field.
    */
  if(!document.getElementById("get-hint")){
    getHintButton = document.createElement("button");
    getHintButton.setAttribute("id", "select-mode");
    getHintButton.innerHTML = "Hint"
    if(mode !== "easy"){
      stateModeBox.appendChild(getHintButton);
      getHintButton.addEventListener("click", getHint);
    }
     }

    /* **DATA MYSTERY COMMENT**
    This is the main buton, running the data mystery.
    */
  if(!document.getElementById("select-field")){
    let selectFieldButton = document.createElement("button");
    selectFieldButton.setAttribute("id", "select-field");
    selectFieldButton.innerHTML = "~Mystery Data~";
    operationsCol.appendChild(selectFieldButton);
    selectFieldButton.addEventListener("click", selectField);
  }
}

// adds the new output to the "output"
function printToOutput(text) {
  output.innerHTML = "<pre>" + text + "<br><br></pre>";
}

// return a list of fields in the CSV
function getFields() {
  if (!json) {
    printToOutput("Select a CSV");
  } else {
    let fieldOutput = "";
    json.columns.forEach(col => {
      fieldOutput += col + "<br>";
    });
    printToOutput(fieldOutput);
  }
}

    /* **DATA MYSTERY COMMENT**
    We are finding the number of columns, then randomly selecting a number between 0 and the number of columns.
    Note that we have to reset hinted to 0 for each new data mystery.
    We 
    */
function selectField(){
  let numFields = json.columns.length
  selectedField = json.columns[Math.floor(Math.random() * (numFields))];
  hinted = 0 
  printToOutput("Now tell me, what does " + selectedField + " mean?");
  if(mode !== "hard"){
    getHint()  
    } 
  return selectedField;
}


/* **DATA MYSTERY COMMENT**
Here we are selecting an individual item from a random row for the selected field. This is for a hint, or for easy mode. Note that hinted is being changed to 1.

*/
function getHint(){
  let numRows = json.length;
  let selectedRow = [Math.floor(Math.random() * (numRows) + 1)];
  let selectedItem = json[selectedRow][selectedField];
  let hint = `HINT, think:<br>${selectedItem}`  
  if(hinted !== 1){
    output.innerHTML += hint;
  }
  hinted = 1
}

/* **DATA MYSTERY COMMENT**
//Changing the mode for those who can't take the data mysteries. 
*/
function selectMode(){
  var b = document.body; 
  if(mode !== "easy"){
    mode = "easy";
    b.setAttribute("style", "background-color: rgb(0,255,0, 0.6)");
    stateModeBox.innerHTML = "Current Mode: " + mode;
    selectModeButton.innerHTML = "Switch to HARD MODE";
    stateModeBox.appendChild(selectModeButton);
  } else {
    mode = "hard";
    b.setAttribute("style", "background-color: rgb(255, 0, 0, 0.6)");
    stateModeBox.innerHTML = "Current Mode: " + mode;
    selectModeButton.innerHTML = "Switch to easy mode";
    stateModeBox.appendChild(selectModeButton);
    stateModeBox.appendChild(getHintButton);
    getHintButton.addEventListener("click", getHint);
  }
}
document.getElementById("input").addEventListener("change", loadFile);


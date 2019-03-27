// let the editor know that `d3` is defined by some code
// included in another file (in this case, `index.html`)
// Note: the code will still work without this line, but
// without it you will see an error in the editor
/* global d3 */ 


let json; // will hold the parsed JSON
let output = document.getElementById("json-output"); // for easy access to this element
let fieldjson; // **ADDED BY EVE** This is my crazy idea on making a json file with one element for each field name in the column list...
let selectedField
let mode = 'easy';
let selectModeButton; 
let stateModeBox;
let getHintButton;
let hinted = 1

//NOTE TO EVE, can use json.length to get number of rows, then json.columns to get the number of columns. 
//Then use number of columns to first select a column. 
//(Easy Mode also prints out a sample item from the data along with the field name!)

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
    
    // **ADDED BY EVE, keeping the data a ~mystery~
    // printToOutput(JSON.stringify(json, null, 4));
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
  // only make 'count-rows' if it doesn't exist yet
    //**Added by eve! :) This box tells the user what "mode" they're in.
  if (!document.getElementById("state-mode")){
    stateModeBox = document.createElement("div");
    stateModeBox.setAttribute("id", "state-mode");
    stateModeBox.innerHTML = "Current Mode: " + mode;
    operationsCol.appendChild(stateModeBox);
  }
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
  
  if(!document.getElementById("get-hint")){
    getHintButton = document.createElement("button");
    getHintButton.setAttribute("id", "select-mode");
    getHintButton.innerHTML = "Hint"
    if(mode !== "easy"){
      stateModeBox.appendChild(getHintButton);
      getHintButton.addEventListener("click", getHint);
    }
     }

  if(!document.getElementById("select-field")){
    let selectFieldButton = document.createElement("button");
    selectFieldButton.setAttribute("id", "select-field");
    selectFieldButton.innerHTML = "~Mystery Data~";
    operationsCol.appendChild(selectFieldButton);
    selectFieldButton.addEventListener("click", selectField);
  }
}

// make a dropdown element with correct fields
function updateSortBy(operationsCol) {
  let sortByDropdown;
  // remove the dropdown if it's there already
  if (document.getElementById("sort-by")) {
    document
      .getElementById("operations")
      .removeChild(document.getElementById("sort-by"));
  }
  sortByDropdown = document.createElement("select");
  sortByDropdown.setAttribute("id", "sort-by");
  
  // fancy built-in way to add options to a dropdown
  sortByDropdown.options[sortByDropdown.options.length] = new Option(
    "Sort by...",
    ""
  );
  // add new options for each column
  for (let col in json.columns) {
    let colValue = json.columns[col];
    sortByDropdown.options[sortByDropdown.options.length] = new Option(
      json.columns[col],
      colValue
    );
  }
  return sortByDropdown;
}

// adds the new output to the "output"
function printToOutput(text) {
  output.innerHTML = "<pre>" + text + "<br><br></pre>";
}

// counts the rows in the input CSV
// note: actually counts the number of objects in the parsed JSON!
function countRows() {
  if (!json) {
    printToOutput("Select a CSV");
  } else {
    printToOutput("CSV has " + json.length + " rows");
  }
}

// sort the array of objects by a field value
// note: the way this is written only sorts descending
function sortBy(event) {
  let field = event.target.value;
  let sorted = json.sort(function(a, b) {
    if (a[field] > b[field]) return -1;
    if (a[field] < b[field]) return 1;
    return 0;
  });
  printToOutput(JSON.stringify(sorted, null, 4));
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

 // The below is **ADDED BY EVE** 
//Trying to make the column names into a data dictionary, so then I can get people to add things to them. (Where the data was collected, etc.)
function makeDictionary(){
   if (!json) {
    printToOutput("Select a CSV");
  } else {
    let dictionaryOutput = []
    json.columns.forEach(col => {
      dictionaryOutput.push({"fieldName": col})
    });
    printToOutput(JSON.stringify(dictionaryOutput, null, 4))
  }
}

// We are finding the number of columns, then randomly selecting a number between 0 and the number of columns.
function selectField(){
  let numFields = json.columns.length
  selectedField = json.columns[Math.floor(Math.random() * (numFields))];
  hinted = 0 
  printToOutput("Now tell me, what does " + selectedField + " mean?");
  if(mode !== "hard"){
    // selectRow();
    getHint()  
    } 
  return selectedField;
}

//Here we are selecting an individual item from a random row for the selected field. This is for easy mode, when it's too hard to guess a column without an example of the data.
function selectRow(){
  let numRows = json.length;
  let selectedRow = [Math.floor(Math.random() * (numRows) + 1)];
  let selectedItem = json[selectedRow][selectedField];
  printToOutput(`Now tell me, what does ${selectedField} mean? 


How about a hint? OK: ${selectedItem}`);
}

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


//Changing the mode for those who can't take the data mysteries. 
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



chrome.storage.local.get(["hands"], function(result) {
	console.log('Value currently is ' + result.hands);
	var hands = result.hands;
	var historyString = "";
	for(var i=0; i<hands.length; i++){
		historyString = historyString + hands[i] + "\n";
	}
	console.log(historyString);
	constructPage(historyString);
    checkIfMaxSize(hands);
});

function constructPage(historyString) {
	let history = document.createElement('p');
	history.innerText = historyString;
	var main = document.getElementById("main");
	main.appendChild(history);
}

function checkIfMaxSize(hands){
    if(hands.length >= 2000){
        alert("The size of your hand history file has exceeded it's maximum (2000 hands). In order to keep recording hands copy it's contents somewhere and click \"Clear History\".");
    }
}
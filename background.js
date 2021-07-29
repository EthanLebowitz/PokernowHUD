chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.local.get(["stats"], function(result) {
		if(result["stats"]==null){
			chrome.storage.local.set({"stats": {}}, function() {
				console.log("created stats dict");
			}); 
		}
    });
	/* chrome.storage.local.get(["handNumber"], function(result) {
		if(result["handNumber"]==null){
			chrome.storage.local.set({"handNumber": 0}, function() {
				console.log("created handNumber variable");
			}); 
		}
    }); */
	chrome.storage.local.get(["hands"], function(result) {
		if(result["hands"]==null){
			chrome.storage.local.set({"hands": []}, function() {
				console.log("created hands dict");
			}); 
		}
    }); 	
	chrome.storage.local.get(["handCount"], function(result) {
		if(result["handCount"]==null){
			chrome.storage.local.set({"handCount": 0}, function() {
				console.log("created hand count variable");
			}); 
		}
    });
	chrome.storage.local.set({"settings": {"panelSettings":[["nH", "nVPIP", "nPFR", "nAF"],[],[],["lCB", "l2B", "l3Ba", "l3B", "l4B", "lFC", "lF2B", "lF3B", "lF3", "lWTSD"]], "recordBox": true, "showingHUD": true, "panelOffset":[0,0]}}, function() { //initialize settings storage
		console.log("created stats dict");
    });
	/* chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
	  chrome.declarativeContent.onPageChanged.addRules([{
		conditions: [new chrome.declarativeContent.PageStateMatcher({
		  pageUrl: {hostEquals: 'https://donkhouse.com/group/22722/52168'},
		})
		],
			actions: [new chrome.declarativeContent.ShowPageAction()]
	  }]);
	}); */
});

/* function sendToHUD(command, data){
	
	
	
} */

var checked = [];

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.log(sender.tab ?
			"from a content script:" + sender.tab.url :
			"from the extension");
		if (request.command == "updateRecord"){
			state = request.record;
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {"state": state, "command": "record2"}, function(response) {
					console.log(response.confirmation);
				});
			});
			console.log("papapa");
			sendResponse({"confirmation": "success"});
		}
		if (request.command == "updateStats"){
			lines = request.stats;
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {"stats": lines, "command": "updateStats2"}, function(response) {
					console.log(response.confirmation);
				});
			});
			console.log("papapa");
			sendResponse({"confirmation": "success"});
		}
		/* if(request.command == "backup"){
			chrome.storage.local.get(['stats'], function(result) {
				var stats = result.stats;
				console.log("backup");
				console.log(stats);
				download("backup.txt",JSON.stringify(stats));
				//prompt("This data can be used to restore the statistics that DHUD has accumulated so far (ie. if you're clearing the browser data or moving to a new computer). Copy it somewhere safe. (ctrl + a) to select all, and then (ctrl + c) to copy.", JSON.stringify(stats));
			});
			sendResponse({"confirmation": "success"});
		} */
		if(request.command == "restore"){
			chrome.storage.local.set({"stats":JSON.parse(request.stats)}, function() { //initialize settings storage
				console.log("created stats dict");
			});
			
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, request, function(response) {// doesn't tell content.js to get stats from memory, rather tells content.js to set aggregator.stats to data messaged
					console.log(response.confirmation);
				});
			});
			sendResponse({"confirmation": "success"});
		}
		if(request.command == "assimilate"){
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, request, function(response) {// doesn't tell content.js to get stats from memory, rather tells content.js to set aggregator.stats to data messaged
					console.log(response.confirmation);
				});
			});
			sendResponse({"confirmation": "success"});
		}
		if(request.command == "cleared"){
			var confirm = window.confirm("Are you sure you want to clear your data? Without a backup it will not be recoverable.");
			if(confirm == true){
				chrome.storage.local.set({'stats':{}}, function(data) {
					console.log("success");
				});
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					chrome.tabs.sendMessage(tabs[0].id, {"command": "cleared"}, function(response) {// doesn't tell content.js to get stats from memory, rather tells content.js to set aggregator.stats to data messaged
						console.log(response.confirmation);
					});
				});
			}
			sendResponse({"confirmation": "success"});
		}
		if(request.command == "clearedHistory"){
			var confirm = window.confirm("Are you sure you want to clear your hand history? It will not be recoverable.");
			if(confirm == true){
				/* chrome.storage.local.set({'handNumber':0}, function(data) { 
					console.log("success");
				}); */
				chrome.storage.local.set({'hands':[]}, function(data) { 
					console.log("success");
				});
			}
			sendResponse({"confirmation": "success"});
		}
        if(request.command == "AlertHandHistorySize"){
			
            alert("The size of your hand history file has exceeded it's maximum (2000 hands). In order to keep recording hands copy it's contents somewhere and click \"Clear History\". You can ignore this message and stats will continue to update normally.");
			sendResponse({"confirmation": "success"});
		}
		if(request.command == "requestServerAnalysis"){ //all serverside code has been moved to the background script.
			//var xhttp = new XMLHttpRequest();
			//xhttp.open("POST", "https://g112z5acnj.execute-api.us-east-1.amazonaws.com/default/dhudServerside", true);
			//xhttp.setRequestHeader("Content-type", "application/json");
			var handLines = request.handLines;
			var stats = request.stats;
            console.log(stats);
            var newStats = analyze(stats, handLines);
			var response = newStats
			console.log(response);
			chrome.storage.local.set({"stats":response}, function() { //initialize settings storage
				console.log("updated stats with new stats");
			});
			sendResponse({"confirmation": "success"});
			incrementHandCount();
		}
		/* if(request.command == "getSettings"){
			sendResponse({"stats":checked});
		} */
		console.log(request.command);
	}
);

//https://html.com/javascript/popup-windows
function popup(mylink, windowname) { 
	if (! window.focus)return true; 
	var href; 
	if (typeof(mylink) == 'string') href=mylink; 
	else href=mylink.href; 
	window.open(href, windowname, 'width=400,height=200,scrollbars=yes'); 
	return false; 
}

function incrementHandCount(){
	chrome.storage.local.get(["handCount"], function(result) {
		chrome.storage.local.set({"handCount":result["handCount"]+1}, function() { //initialize settings storage
			console.log("incremented hand count");
		});
		if(result.handCount == 500){
			popup("donatePopup.html", "test");
		}
	});
}

function download(filename, text) { //for backup from https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

////https://developer.chrome.com/extensions/getstarted

function analyze(stats, handLines){
	var hand = new Hand(handLines);
	var calc = new Calculator();
	var newStats = calc.processHand(hand, stats);
    return newStats;
};

class Hand { //hand class
	
	constructor(handLines){
		this.handLines = handLines;
        this.playerNumber = this.getPlayerNumber(this.handLines); //number of players
        this.players = this.getPlayers(this.handLines, this.playerNumber); //list of players. index is position.
		this.wasFlop = this.checkFlop(handLines);
		this.streetLines = this.chopStreets(handLines);
		this.postflopLines = this.extractPostflopLines(handLines);
		this.leveledDict = this.getLeveledDict(this.streetLines[0]);
		this.playersByStreetDict = this.getPlayersByStreet(this.handLines, this.players);
		this.preflopAggressor = this.getPreflopAggressor(this.leveledDict);
	}
	
	/* function wholeCardConverter(wholeCards){ //expects list with two items. one for each card.
		var firstValue = wholeCards[0][:-3];
		var firstSuit = wholeCards[0][-3:];
		var secondValue = wholeCards[1][:-3];
		var secondSuit = wholeCards[1][-3:];
		var suitedState = "o";
		if(firstValue == "10"){
			firstValue = "T";
		}
		if(secondValue == "10"){
			secondValue = "T";
		}
		var bothValues = firstValue + secondValue;
		if(firstSuit == secondSuit){
			suitedState = "s";
		}
		if{firstValue == secondValue){
			suitedState = ""
		}
		var hand = bothValues+suitedState;
		return hand;
	} */
	
	checkFlop(handLines){ //check if a flop was seen
		var wasFlop = false;
		for(var i=0; i<handLines.length; i++){
			if(handLines[i].includes("board")){
				wasFlop = true
			}
		}
		return wasFlop;
	}
	
	getPlayerNumber(handLines){ //return how many players are in the hand
        var firstLineSplit = handLines[0].split(" ");
        var playerNumber = firstLineSplit[0];
        return playerNumber;
	}
	
	extractPreflopAction(handLines){
		var preflopLines = [];
		if(!this.wasFlop){ //if there was no flop
			preflopLines = handLines.slice(1, handLines.length); //then the whole thing is preflop
			return preflopLines;
		}
        for(var i=0; i<handLines.length; i++){
            if (handLines[i].includes("board")){
				preflopLines = handLines.slice(1, i); //does not include the first line which states number of players
                break;
			}
		}
        return preflopLines;
	}
	
	checkForBoard(lines){
		for(var i=0; i<lines.length; i++){
			if(lines[i].includes("board:")){return true;}
		}
		return false;
	}
	
	chopStreets(handLines){ //chops out street action, excluding all boards
        var slicedLines = [[],[],[],[]];
		var lastSlice = 0;
		var sliceNumber = 0;
        for(var i=0; i<handLines.length; i++){
            if (handLines[i].includes("board")){
				slicedLines[sliceNumber] = (handLines.slice(lastSlice, i));
				lastSlice = i+1;
				sliceNumber+=1;
			}
			if(i == handLines.length-1){ //end of lines
				slicedLines[sliceNumber] = (handLines.slice(lastSlice, i));
			}
		}
        return slicedLines;
	}
	
	extractPostflopLines(handLines){
		if(!this.checkForBoard(handLines)){return [];} //if there was no flop then there are no postflop lines
		var postflopLines = [];
        for(var i=0; i<handLines.length; i++){
            if (handLines[i].includes("board")){
				postflopLines = handLines.slice(i, handLines.length);
				break;
			}
		}
		return postflopLines;
	}
	
	getPlayers(handLines, playerNumber){ //returns list of players in the hand, including all those that folded preflop
        var players = [];
        var relevantLines = handLines.slice(1, 1 + parseInt(playerNumber, 10));
		for(var i=0; i<relevantLines.length; i++){
			var playerName = relevantLines[i].split(" ")[0];
			players.push(playerName);
		}
		console.log(players);
        return players;
	}
	
	getLeveledDict(preflopLines){ //dictionary representation of preflop action {1:[list of players who bet at this level (limpers)], 2:[another list, first item being the raiser to this level]}
        var leveledDict = { 1:[] };
        var betLevel = 1;
		for(var i=0; i<preflopLines.length; i++){
			var line = preflopLines[i];
            var player = line.split(" ")[0];
            if (line.includes("called")){
                leveledDict[betLevel].push(player);
			}
            if (line.includes("raised") || line.includes("bet")){
                betLevel += 1;
                leveledDict[betLevel] = [player];
			}
		}
        return leveledDict;
	}
	
	getPlayersByStreet(handLines, players){
		
		var playersStillIn = [...players];
		var street = 0; //street 1 is flop, 2 is turn, 3 is river, 4 is showdown
		var playersByStreetDict = {1:[], 2:[], 3:[], 4:[]};
		for(var i=0; i<handLines.length; i++){
			var line = handLines[i];
			if(line.includes("folded")){
				var player = line.split(" ")[0];
				playersStillIn.splice(playersStillIn.indexOf(player), 1);
			}
			if(line.split(" ")[0] == "board:" || line.includes("showed")){ //"showed" should bring us to street 4
				if(street <= 4){ //because there can be more than one "showed" at showdown
					street+=1;
				}
				playersByStreetDict[street] = [...playersStillIn];
			}
 		}
		return playersByStreetDict;
		
	}
	
	getPreflopAggressor(leveledDict){
		
		var leveledDictKeys = Object.keys(leveledDict);
		var preflopAggressor = null;
		if(leveledDictKeys.length > 1){
			var finalKey = leveledDictKeys[leveledDictKeys.length-1];
			preflopAggressor = leveledDict[finalKey][0];
		}
		return preflopAggressor;
		
	}
}

class Calculator{
	
	processHand(hand, stats){  
		
		this.stats = stats;
		this.unpackStats();
		var tableSize = this.handed(hand);
		this.HandsData = this.getHandsData(hand, this.HandsData, tableSize);
		this.VPIPdata = this.getVPIPdata(hand, this.VPIPdata, tableSize);
		this.PFRdata = this.getPFRdata(hand, this.PFRdata, tableSize);
		this.AFdata = this.getAFdata(hand, this.AFdata, tableSize);
		this.threeBetData = this.get3Bdata(hand, this.threeBetData, tableSize);
		this.fourBetData = this.get4Bdata(hand, this.fourBetData, tableSize);
		this.F3data = this.getF3data(hand, this.F3data, tableSize);
		this.WTSDdata = this.getWTSD(hand, this.WTSDdata, tableSize);
		this.CBdata = this.getCBdata(hand, this.CBdata, tableSize);
		this.twoBarrelData = this.get2Bdata(hand, this.twoBarrelData, tableSize);
		this.threeBarrelData = this.get3Bardata(hand, this.threeBarrelData, tableSize);
		this.FCdata = this.getFCdata(hand, this.FCdata, tableSize);
		this.F2Bdata = this.getF2Bdata(hand, this.F2Bdata, tableSize);
		this.F3Bdata = this.getF3Bdata(hand, this.F3Bdata, tableSize);
		
		this.packStats(this.HandsData, this.VPIPdata, this.PFRdata, this.AFdata, this.threeBetData, this.fourBetData, this.F3data, this.WTSDdata, this.CBdata, this.twoBarrelData, this.threeBarrelData, this.FCdata, this.F2Bdata, this.F3Bdata);
		return this.stats;
		
		//this.printStats(tableSize, hand.players);
            
		/* VPIP = (float(VPIPdata[player][size][0]) / float(VPIPdata[player][size][1])) * 100 #calculate vpip
        VPIP = str(VPIP)[:5]#cut down on decimal places
        PFR = (float(PFRdata[player][size][0]) / float(PFRdata[player][size][1])) * 100 #calculate pfr
        PFR = str(PFR)[:5]#cut down on decimal places
        Agg = (float(aggData[player][size][0]) / float(aggData[player][size][1])) * 100 #calculate agg
        Agg = str(Agg)[:5] #cut down on decimal places */
		
	}
	
	packStats(HandsData, VPIPdata, PFRdata, AFdata, threeBetData, fourBetData, F3data, WTSDdata, CBdata, twoBarrelData, threeBarrelData, FCdata, F2Bdata, F3Bdata){
		
		this.stats["H"] = HandsData;
		this.stats["VPIP"] = VPIPdata;
		this.stats["PFR"] = PFRdata;
		this.stats["AF"] = AFdata;
		this.stats["3B"] = threeBetData;
		this.stats["4B"] = fourBetData;
		this.stats["F3"] = F3data;
		this.stats["WTSD"] = WTSDdata;
		this.stats["CB"] = CBdata;
		this.stats["2B"] = twoBarrelData;
		this.stats["3Ba"] = threeBarrelData;
		this.stats["FC"] = FCdata;
		this.stats["F2B"] = F2Bdata;
		this.stats["F3B"] = F3Bdata;
				
	}
	
	allStats(){
	//return {"VPIP":this.VPIPdata, "PFR":this.PFRdata, "AF": this.AFdata, "3B":this.threeBetData, "4B":this.fourBetData, "F3":this.F3data, "WTSD":this.WTSDdata, "CB":this.CBdata, "2B":this.twoBarrelData, "3B":this.threeBarrelData, "FC":this.FCdata, "F2":this.F2Bdata, "F3B":this.F2Bdata};
		return ["H", "VPIP", "PFR", "AF", "3B", "4B", "F3", "WTSD", "CB", "2B", "3Ba", "FC", "F2B", "F3B"];
	}
	
	unpackStats(){
		
		var statKeys = Object.keys(this.stats);
		var statList = this.allStats();
		
		for(var i=0; i<statList.length; i++){ 
			var stat = statList[i]
			if(!statKeys.includes(stat)){//make empty directory for every stat that doesn't exist yet
				this.stats[statList[i]] = {};
			}
		}
		this.HandsData = this.stats["H"];
		this.VPIPdata = this.stats["VPIP"];  //{player:{tableSize:[handsPlayed, totalHands]}}
        this.PFRdata = this.stats["PFR"];
        this.AFdata = this.stats["AF"]; //{player:{tableSize:[aggressiveActions, actions]}}
		this.threeBetData = this.stats["3B"];
		this.fourBetData = this.stats["4B"];
		this.F3data = this.stats["F3"];
		this.WTSDdata = this.stats["WTSD"];
		this.CBdata = this.stats["CB"];
		this.twoBarrelData = this.stats["2B"];
		this.threeBarrelData = this.stats["3Ba"];
		this.FCdata = this.stats["FC"];
		this.F2Bdata = this.stats["F2B"];
		this.F3Bdata = this.stats["F3B"];
		
	}
	
	makePath(dataDict, tableSize, player){
		if(dataDict == null){
			dataDict = {};
		}
		if (! Object.keys(dataDict).includes(player)){
			dataDict[player] = {};
		}
		if (! Object.keys(dataDict[player]).includes(tableSize)){//{player:{tableSize:[handsPlayed, totalHands]}}
			dataDict[player][tableSize] = [0,0];
		}
		return dataDict;
	}
	
	getData(dataDict, tableSize, player){ //get list representation of the data from a path of player and . player argument is username, not a Player object
		dataDict = this.makePath(dataDict, tableSize, player);
		return dataDict[player][tableSize];
	}
	
	putData(dataDict, tableSize, player, data){
		dataDict = this.makePath(dataDict, tableSize, player);
		dataDict[player][tableSize] = data;
		return dataDict;
	}
	
	updateData(dataDict, tableSize, player, dataChange){
		var data = this.getData(dataDict, tableSize, player);
		data[0]+=dataChange[0];
		data[1]+=dataChange[1];
		dataDict = this.putData(dataDict, tableSize, player, data);
		return dataDict;
	}
	
	getHandsData(hand, HandsData, tableSize){
		
		var players = hand.players;
		for(var i=0; i<players.length; i++){
			var username = players[i];
			var dataChange = [1,1]; //every hand we see of a player
			this.updateData(HandsData, tableSize, username, dataChange);
		}
		return HandsData;
		
	}
	
	foldToBarrelStatus(hand, street, dataDict, tableSize){
		
		var streetLines = hand.streetLines[street];
		var betLine = 0;
		for(var i=0; i<streetLines.length; i++){
			if(streetLines[i].includes("bet")){
				betLine = i;
				break;
			}
		}
		for(var i=betLine+1; i<streetLines.length; i++){
			var line = streetLines[i];
			var splitLine = line.split(" ");
			if(line.includes("folded")){
				var player = splitLine[0];
				dataDict = this.updateData(dataDict, tableSize, player, [1,1]); //had the chance to fold to a cbet and did so
			}
			if(line.includes("called") || line.includes("raised")){
				var player = splitLine[0];
				dataDict = this.updateData(dataDict, tableSize, player, [0,1]); //had the chance to fold to a cbet and didn't
			}
		}
		return dataDict;
		
	}
	
	getF3Bdata(hand, F3Bdata, tableSize){
		
		var preflopAggressor = hand.preflopAggressor;
		if(preflopAggressor !== null){//if there was a preflop aggressor
			var CBchange = this.barrelStatus(hand, 1, preflopAggressor, tableSize); 
			if(JSON.stringify(CBchange) == JSON.stringify([1,1])){ //if preflopAggressor cbet
				var twoBchange = this.barrelStatus(hand, 2, preflopAggressor, tableSize); 
				if(JSON.stringify(twoBchange) == JSON.stringify([1,1])){ //if they 2barreled
					var threeBchange = this.barrelStatus(hand, 3, preflopAggressor, tableSize); 
					if(JSON.stringify(threeBchange) == JSON.stringify([1,1])){ //if they 3barreled
						F3Bdata = this.foldToBarrelStatus(hand, 3, F3Bdata, tableSize);
					}
				}
			}
		}
		return F3Bdata
		
	}
	
	getF2Bdata(hand, F2Bdata, tableSize){
		
		var preflopAggressor = hand.preflopAggressor;
		if(preflopAggressor !== null){//if there was a preflop aggressor
			var CBchange = this.barrelStatus(hand, 1, preflopAggressor, tableSize); 
			if(JSON.stringify(CBchange) == JSON.stringify([1,1])){ //if preflopAggressor cbet
				var twoBchange = this.barrelStatus(hand, 2, preflopAggressor, tableSize); 
				if(JSON.stringify(twoBchange) == JSON.stringify([1,1])){ //if they 2barreled
					F2Bdata = this.foldToBarrelStatus(hand, 2, F2Bdata, tableSize);
				}
			}
		}
		return F2Bdata
		
	}
	
	getFCdata(hand, FCdata, tableSize){
		
		var preflopAggressor = hand.preflopAggressor;
		if(preflopAggressor !== null){//if there was a preflop aggressor
			var CBchange = this.barrelStatus(hand, 1, preflopAggressor, tableSize); 
			if(JSON.stringify(CBchange) == JSON.stringify([1,1])){ //if preflopAggressor cbet
				FCdata = this.foldToBarrelStatus(hand, 1, FCdata, tableSize);
			}
		}
		return FCdata
		
	}
	
	barrelStatus(hand, street, preflopAggressor, tableSize){
		var dataChange = [0,0]; 
		var streetLines = hand.streetLines[street];
		for(var i=0; i<streetLines.length; i++){ //for each line post flop
			var line = streetLines[i]; //line
			var player = line.split(" ")[0];
			
			if(line.includes(preflopAggressor) && line.includes("bet")){ //if it was the aggressors turn and he bet (not raised) (that's a shot fired)
				var player = line.split(" ")[0];
				dataChange = [1,1];
				break;
			}else if(line.includes(preflopAggressor) && !line.includes("bet")){//had the chance to barell and didn't
				dataChange = [0,1];
				break;
			}else if(line.includes("bet") && !line.includes(preflopAggressor)){// someone else beat em to the punch
				dataChange = [0,0]
				break;
			} //these cases should be comprehensive and each break
			
		}
		return dataChange;
	}
	
	get3Bardata(hand, threeBarrelData, tableSize){
		
		var preflopAggressor = hand.preflopAggressor;
		if(preflopAggressor !== null){//if there was a preflop aggressor
			var CBchange = this.barrelStatus(hand, 1, preflopAggressor, tableSize); 
			if(JSON.stringify(CBchange) == JSON.stringify([1,1])){ //if preflopAggressor cbet
				var twoBchange = this.barrelStatus(hand, 2, preflopAggressor, tableSize); 
				if(JSON.stringify(twoBchange) == JSON.stringify([1,1])){ //if they 2barreled
					var dataChange = this.barrelStatus(hand, 3, preflopAggressor, tableSize);
					threeBarrelData = this.updateData(threeBarrelData, tableSize, preflopAggressor, dataChange);
				}
			}
		}
		return threeBarrelData;
		
	}
	
	get2Bdata(hand, twoBarrelData, tableSize){ //second barrell after a cbet
		
		var preflopAggressor = hand.preflopAggressor;
		if(preflopAggressor !== null){//if there was a preflop aggressor
			var CBchange = this.barrelStatus(hand, 1, preflopAggressor, tableSize);
			if(JSON.stringify(CBchange) == JSON.stringify([1,1])){ //if preflopAggressor cbet
				var dataChange = this.barrelStatus(hand, 2, preflopAggressor, tableSize);
				twoBarrelData = this.updateData(twoBarrelData, tableSize, preflopAggressor, dataChange);
			}
		}
		return twoBarrelData;
		
	}
	
	getCBdata(hand, CBdata, tableSize){
		
		var preflopAggressor = hand.preflopAggressor;
		if(preflopAggressor !== null){//if there was a preflop aggressor
			var dataChange = this.barrelStatus(hand, 1, preflopAggressor, tableSize); 
			CBdata = this.updateData(CBdata, tableSize, preflopAggressor, dataChange, tableSize);
		}
		return CBdata
	}
	
	getWTSD(hand, WTSDdata, tableSize){ //%of times player sees showdown after seeing flop
		
		var playersAtFlop = hand.playersByStreetDict[1];
		var playersAtShowdown = hand.playersByStreetDict[4];
		for(var i=0; i<playersAtFlop.length; i++){ //for each player who saw the flop
			var player = playersAtFlop[i];
			var dataChange = [0,1];
			if(playersAtShowdown.includes(player)){
				dataChange[0]+=1;
			}
			WTSDdata = this.updateData(WTSDdata, tableSize, player, dataChange);
		}
		return WTSDdata;
		
	}
	
	getF3data(hand, F3data, tableSize){ //fold to 3bet statistic. if they folded to a 3bet regardless of prior actions were raised
		var preflopLines = hand.streetLines[0];
		var leveledDict = hand.leveledDict;
		var leveledDictKeys = Object.keys(leveledDict);
		var bettingLevels = Object.keys(leveledDict);
		var players = hand.players;
		var handLines = hand.handLines;
		if(leveledDictKeys.length >= 3){ //if there was a 3bet
			
			var threeBetLineNumber = this.getXRaiseLineNumber(hand, 2, preflopLines)
			
			for(var i=threeBetLineNumber+1; i<preflopLines.length; i++){ //add data for all players who folded at this level
				var line = preflopLines[i];
				var continuingPlayers = [];
				if(line.includes("folded")){
					var player = line.split(" ")[0];
					F3data = this.updateData(F3data, tableSize, player, [1,1]);
				}
				if(line.includes("raised")){break;} //if there is another raise then we can no longer get meaningful data as players are now facing a 4bet
			}
			
			for(var i=1; i<leveledDict[3].length; i++){ //for all players who called a 3bet
				var player = leveledDict[3][i];
				var data = this.getData(F3data, tableSize, player);
				data[1]+=1; //add 1 to 3bets seen but not 1 to 3bets folded to
				F3data = this.putData(F3data, tableSize, player, data);
			}
			
			if(leveledDictKeys.length >= 4){ //update data for the 4 bettor too (they didn't fold). after the 4 bet we leave the statistic
				var player = leveledDict[4][0];
				F3data = this.updateData(F3data, tableSize, player, [0,1]);
			}
			
		}
		return F3data;
	}
	
	getXRaiseLineNumber(hand, X, preflopLines){ //x is the raise number after the blinds. shouldn't be 0
		
		var lineNumber = 0;
		var raiseNumber = 0;
		for(var i=0; i<preflopLines.length; i++){ //get line number of 3bet
			var line = preflopLines[i];
			if(line.includes("raised")){
				raiseNumber+=1;
			}
			if(raiseNumber == X){
				//open = line;
				lineNumber = i;
				break;
			}
		}
		return lineNumber;
		
	}
	
	getBstatus(hand, X, leveledDict, statDict, tableSize){
		var players = hand.players;
		var preflopLines = hand.streetLines[0]
		
		var prevBetLineNumber = this.getXRaiseLineNumber(hand, X, preflopLines);
		
		for(var i=prevBetLineNumber+1; i<preflopLines.length; i++){ //add data for all players who folded at this level
			var line = preflopLines[i];
			var continuingPlayers = [];
			if(line.includes("folded") || line.includes("called")){
				//console.log("no raise");
				var player = line.split(" ")[0];
				//console.log(player);
				statDict = this.updateData(statDict, tableSize, player, [0,1]);
			}
			if(line.includes("raised")){
				//console.log("raise");
				var player = line.split(" ")[0];
				//console.log(player);
				statDict = this.updateData(statDict, tableSize, player, [1,1]);
				break;
			} //if there is another raise then we can no longer get meaningful data as no one else can raise at this level
		}
		return statDict;
	}
	
	get3Bdata(hand, threeBetData, tableSize){ //3bet data
		var leveledDict = hand.leveledDict;
		var leveledDictKeys = Object.keys(leveledDict);
		
		if(leveledDictKeys.length >= 2){ //if there was a raise
			//console.log("3bet");
			threeBetData = this.getBstatus(hand, 1, leveledDict, threeBetData, tableSize);
		}
		return threeBetData;
		
		/* if(leveledDict.length >= 3){ //if there was a three bet add to first value in threebettors list (3bets seen)
			threeBettor = leveledDict[3][0];
			threeBetData = this.updateData(threeBetData, tableSize, threeBettor, [1,0]);
		} */
	}
	
	get4Bdata(hand, fourBetData, tableSize){
		
		var leveledDict = hand.leveledDict;
		var leveledDictKeys = Object.keys(leveledDict);
		
		if(leveledDictKeys.length >= 3){ //if there was a raise
			fourBetData = this.getBstatus(hand, 2, leveledDict, fourBetData, tableSize);
		}
		return fourBetData;
		/* var leveledDict = hand.leveledDict;
		var players = hand.players;
		var fourBettor = "";
		for(var i=0; i<players.length; i++){
			var player = players[i];
			fourBetData = this.updateData(fourBetData, tableSize, player, [0,1]);
		}
		if(leveledDict.length >= 4){
			fourBettor = leveledDict[4][0];
			fourBetData = this.updateData(fourBetData, tableSize, fourBettor, [1,0]);
		} */
		return fourBetData;
	}
	
	getVPIPdata(hand, VPIPdata, tableSize){
        var leveledDict = hand.leveledDict;
		//console.log(leveledDict);
        var leveledDictValues = Object.values(leveledDict);
        var players = hand.players;
        var playersWhoPlayed = [];
		
		//get list of players who vpipd
		for(var i=0; i<leveledDictValues.length; i++){//for each list of players at a bet level 
            for(var j=0; j<leveledDictValues[i].length; j++){    //iterate through that list
				var player = leveledDictValues[i][j];
                if (! playersWhoPlayed.includes(player)){
                    playersWhoPlayed.push(player);
				}
			}
		}
        for(var i=0; i<players.length; i++){
			var player = players[i];
			VPIPdata = this.updateData(VPIPdata, tableSize, player, [0,1]);
            if (playersWhoPlayed.includes(player)){
				VPIPdata = this.updateData(VPIPdata, tableSize, player, [1,0]);
			}
		}
                
        return VPIPdata;
	}
		
	getPFRdata(hand, PFRdata, tableSize){
        var leveledDict = hand.leveledDict;
        var leveledDictValues = Object.values(leveledDict);
        var players = hand.players;
        var playersWhoRaised = [];
        
        for(var i=1; i<leveledDictValues.length; i++){//for each list of players at a bet level , not including the first one because those are limpers
			var value = leveledDictValues[i];
            if (!playersWhoRaised.includes(value[0])){
                playersWhoRaised.push(value[0]);
			}
		}
                
        for(var i=0; i<players.length; i++){
			var player = players[i];
			PFRdata = this.updateData(PFRdata, tableSize, player, [0,1]);
            if (playersWhoRaised.includes(player)){
				PFRdata = this.updateData(PFRdata, tableSize, player, [1,0]);
			}
		}
		
		return PFRdata;
	}
		
		
    
    getAFdata(hand, AFdata, tableSize){
        var postflopLines = hand.postflopLines;
        var players = hand.players;
		for(var i=0; i<postflopLines.length; i++){//for each line
			var line = postflopLines[i];
            var splitLine = line.split(" ");
			var player = splitLine[0];
			if(players.includes(player)){//if it is a player doing an action
				if (splitLine[1] == "called"){ //if it's a call then it goes in the denominator
					AFdata = this.updateData(AFdata, tableSize, player, [0,1]);
				}
				if ((splitLine[1] == "bet") || (splitLine[1] == "raised")){ //if it's aggressive it goes in the numerator
					AFdata = this.updateData(AFdata, tableSize, player, [1,0]);
				}
			}
		}
			   
        return AFdata;
	}
		
	raiseOrCall(firstInAction, key){
        if (firstInAction || key == 1){
            return "";
		}
        return " call";
	}
        
    convertKeyToActionName(key){ //might not be needed
        if (key == 1){
            return "limp";
		}
        if (key == 2){
            return "open raise";
        }
		else{
            return str(key) + " bet";
		}
	}
    
    handed(hand){
		var number = 0;
        if (parseInt(hand, 10) === hand){ //if an int is input
            number = hand;
		}
        else{
            number = parseInt(hand.playerNumber, 10);
		}
        if (number == 2){
            return "heads up";
		}
        if (number > 2 && number < 7){
            return "short handed";
		}
        if (number > 6 || number == 1){
            return "full ring";
		}
	}
            
    listTableSizes(){
        var sizes = [];
		for(var i=2; i<11; i++){
            var size = self.handed(i);
            if (!sizes.includes(size)){
                sizes.push(size);
			}
		}
        return sizes;
	}
    
    position(hand, player){
        var pos = hand.players.indexOf(player);
        var playerNumber = hand.playerNumber;
        var positionNames = {2:["CO", "BU"], 3:["SB", "BB", "BU"], 4:["SB", "BB", "CO", "BU"], 5:["SB", "BB", "UTG", "CO", "BU"], 6:["SB", "BB", "UTG", "MP", "CO", "BU"], 7:["SB", "BB", "UTG", "MP1", "MP2", "CO", "BU"], 8:["SB", "BB", "UTG", "MP1", "MP2", "MP3", "CO", "BU"], 9:["SB", "BB", "UTG", "UTG+1", "MP1", "MP2", "MP3", "CO", "BU"], 10:["SB", "BB", "UTG", "UTG+1", "UTG+2", "MP1", "MP2", "MP3", "CO", "BU"]};
        
        var positionName = positionNames[parseInt(playerNumber, 10)][pos];
        return positionName;
	}
	
}

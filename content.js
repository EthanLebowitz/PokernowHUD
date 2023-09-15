/*
*
* Copyright 2020, Ethan Lebowitz, All Rights Reserved
*
*
*
*/


class Player {
	
	constructor(username, x, y, height, fontSize, seat){
		
		this.username = username;
		this.x = x;
		this.y = y;
		this.seat = seat;
        this.height = height;
        this.fontSize = fontSize;
		
	}
	
}

class Settings {
	
	constructor(){
		
		var self = this;
		this.statsToShow = [];
		this.recordBox = true;
		this.showingHUD = true;
		this.panelOffset = this.getPanelOffset();
		chrome.storage.local.get(['settings'], function(result) {
			//console.log('Value currently is ' + result.settings);
			//self.setStatsToShow(result.settings.stats);
			self.statsToShow = result.settings.panelSettings;
			//console.log(result.settings.stats);
			self.recordBox = result.settings.recordBox;
		});
		
	}
	
	checkIfRecordingHands(){
		
		var self = this;
		chrome.storage.local.get(['settings'], function(result) {
			self.recordBox = result.settings.recordBox;
		});
		return this.recordBox;
		
	}
	
	checkIfShowingHUD(){
		
		var self = this;
		chrome.storage.local.get(['settings'], function(result) {
			self.showingHUD = result.settings.showingHUD;
		});
		return this.showingHUD;
		
	}
	
	getPanelOffset(){
		
		var self = this;
		chrome.storage.local.get(['settings'], function(result) {
			self.panelOffset = result.settings.panelOffset;
		});
		return this.panelOffset;
		
	}
	
}

class Panel { //gets made by HUD
	
	constructor(player, aggregator, playerNumber, settings){
		
		this.settings = settings;
		//var canvas = this.getCanvas(); //scale coordinates to canvas size
		var scaleFactor = this.getScaleFactor(); //returns [xScale, yScale]
		this.aggregator = aggregator;
		this.playerNumber = playerNumber;
		this.div = document.createElement("div");
		this.div = this.addCoordinates(player, this.div);
		this.div = this.addPadding(this.div, scaleFactor);
		this.div = this.addText(player, this.div);
		var ID = player.username+"Stats";
		this.div.id = ID;
		this.div.style.background = "rgba(35, 84, 92, 0.6)";
        //console.log(this.div);
		
	}
	
	addFontSize(div, player){
		
        div.style.fontSize = player.fontSize;
		return div; 
		/* var baseFontSize = 15;
		var potatoWidth = 1440; 
		var canvasRes = parseInt(canvas.width, 10);
		var resScale = canvasRes / potatoWidth; //if resolution is potato resScale == 1. else resScale > 1.
		var scaledToResolution = baseFontSize * resScale; //only gonna use width for this
		var scaledFontSize = scaledToResolution * scaleFactor[0]; //just using one of the scale dimensions. both scale dimensions should be the same anyway
		div.style.fontSize = String(scaledFontSize) + "px";
		return div; */
		
	}
	
	addStatText(player, div){
		
		var stats = this.aggregator.stats;
		//console.log(stats);
		var lines = this.settings.statsToShow;
		//if(statsToDisplay == null){statsToDisplay = ["VPIP", "PFR", "AF"]}
		var tableSize = this.aggregator.handed(this.playerNumber);
		var username = player.username;
		var string = "";
		for(var k=0; k<lines.length-1; k++){ //for each line
			if(!(lines[k].length == 0) && !(k==0)){
				string = string + "\n";
			}
			for(var i=0; i<lines[k].length; i++){ //for each stat in line
				var statName = lines[k][i].slice(1, lines[k][i].length); //chop off the label setting on the front
				var labelStatus = lines[k][i].slice(0, 1);
				var dataDict = stats[statName];
				var statText = this.aggregator.getStat(statName, dataDict, tableSize, username);
				if(labelStatus == "l"){
					string = string + statName + ": " + statText + "/";
				}else if(labelStatus == "n"){
					string = string + " " + statText + " /";
				}
			}
		}
		div.innerText = string;
		div.style.color = "white";
		return div;
	}
	
	addText(player, div){
		
		div = this.addFontSize(div, player);
		div = this.addStatText(player, div);
		return div;
		
	}
	
	addPadding(div, scaleFactor){
		
		var top = 2;
		var right = 5;
		var bottom = 2;
		var left = 5;
		var scaledTop = top * scaleFactor[1];
		var scaledRight = right * scaleFactor[0];
		var scaledBottom = bottom * scaleFactor[1];
		var scaledLeft = left * scaleFactor[0];
		div.style.padding = "2px 5px 2px 5px"; //top right bottom left
		return div;
		
	}
	
	getCanvasDimensions(canvas){ //canvas resolution dimensions
		
		var canvasWidth = parseInt(canvas.width, 10);
		var canvasHeight = parseInt(canvas.height, 10);
		return [canvasWidth, canvasHeight];
		
	}
	
	getCanvasAbsoluteDimensions(canvas){ //actual dimensions of canvas on page
		
		var canvasAbsoluteWidth = canvas.offsetWidth;
		var canvasAbsoluteHeight = canvas.offsetHeight;
		return [canvasAbsoluteWidth, canvasAbsoluteHeight];
		
	}
	
	getScaleFactor(){
		
		return [1, 1];
	
	}
	
	getXOffset(div){
		
		var offset = this.settings.getPanelOffset();
		return offset[0] 
		
	}
	
	getYOffset(div){
		
		var offset = this.settings.getPanelOffset();
		//console.log(offset[1])
		return -offset[1] //flip sign
		
	}
	
	addCoordinates(player, div){
		
		var x = parseFloat(player.x.replace("px", ""));
		var y = parseFloat(player.y.replace("px", ""));
        var yShift = 0.75*parseFloat(player.height.replace("px", ""));
		yShift += this.getYOffset();
		//console.log(yShift);
		var xShift = this.getXOffset();
		
		div.style.position = "absolute";
		div.style.top = String(y+yShift)+"px";
		div.style.left = String(x+xShift)+"px";
        div.style.zIndex = "99";
        //console.log(y);
		
		return div;
		
	}
	
	/* findFirstDescendant(parent, tagname){ //https://stackoverflow.com/questions/236624/how-to-access-html-element-without-id
		parent = document.getElementById(parent);
		var descendants = parent.getElementsByTagName(tagname);
		if ( descendants.length ){
			return descendants[0];
		}
		return null;
	} */
	
}

class HUD { //class for hud graphical overlay. gets made by 
	
	constructor(aggregator, settings, builder){
		this.settings = settings
		this.aggregator = aggregator;
		this.playerNumber = 0; //so that panel knows what table size stats to show
		//this.activeStatsPanelIDs = [];
		this.waitForGameToLoad();
		this.builder = builder; //to pass seat number to
        this.tableDiv = document.body;
	}
	
	initializePotObserver(){ //begin watching the pot size for new hands (when pot becomes 0.00 again)
		//console.log("watch the pot");
		
		//const targetNode = document.getElementsByClassName('table-pot-size')[0];
		const targetNode = document.getElementsByClassName('dealer-button-ctn')[0];
		const config = { attributes: true, childList: true, subtree: true };
		
		const callback = function(mutationsList, observer) {
			scraper.getLog();
		};

		const observer = new MutationObserver(callback);
		observer.observe(targetNode, config);
	}
	
	initializeHUD(){
		
		//console.log(settings.statsToShow);
		this.n_seats = 10; //I don't believe there are any other options on pokernow
		this.builder.setSeatNumber(this.n_seats);
		this.players = this.retrievePlayerData(this.n_seats);
		//this.aggregator.playerNames = this.players;
		this.display(this.players, this.settings);
		
	}
    
    getTableDiv(){
        var tableDiv = document.getElementsByClassName("table")[0];
        return tableDiv;
    }
	
	createHUDdiv(){
		
        var tableDiv = this.tableDiv;
		var div = document.createElement("div");
		div.id = "HUD";
		tableDiv.appendChild(div);
		
	}
	
	HUDloop(iteration){
		
		this.sleep(500).then(() => {
			if(this.settings.checkIfShowingHUD()){
				this.initializeHUD();
			}else{this.clearDisplay();}
            /* if(iteration % 8 == 0){ //only request logs every 4 seconds
                scraper.getLog();
            } */
			getStats(this.aggregator); //every update of the HUD retrieve stats from memory and store them in the aggregator stats variable
            this.HUDloop(iteration+1);
		})
		
	}
	
	sleep(ms) { //https://www.sitepoint.com/delay-sleep-pause-wait/
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	async waitForPlayersToLoad(){
		var self = this; //"this" is not available in the promise because async stuff runs in the context of the window
		var loaded = await new Promise(function(resolve, reject){
			//console.log("checking");
			var youLoaded = false;
            var userDiv = document.getElementsByClassName("table-player-name")[0];
            if(! (userDiv == null)){youLoaded = true;}
			console.log(youLoaded);
			
			if(!youLoaded){
				self.sleep(500).then(() => { 
					resolve(self.waitForPlayersToLoad());//should resolve down stack
				})
			}
			if(youLoaded){resolve(true);}
		})
		//console.log("loaded: "+String(loaded));
		return loaded;
	}
	
	async waitForGameToLoad(){
		
		//if(!gameLoaded){this.sleep(500).then(() => { this.waitForGameToLoad(); });}
		var gameLoaded = await this.waitForPlayersToLoad();//.then(this.waitForVariableToLoad("game.players")).then(this.initializeHUD());
        this.builder.getYou();
        this.tableDiv = this.getTableDiv();
		this.createHUDdiv();
        
		this.initializePotObserver();
		scraper.getFullLog(); //gets last created_at
		this.HUDloop(0);
		//self.sleep(300).then(() => {this.initializeHUD();});//give a moment for players to fill
		
		return;
		
	}
	
	clearDisplay(){
		var HUDdiv = document.getElementById("HUD");
		HUDdiv.innerText = ""; //remove all panels
	}
	
	display(players, settings){
		
		/* for(var i=0; i<players.length; i++){//delete last panel
			var player = players[i];
			var ID = player.username+"Stats";
			this.removeDisplay(ID);
		}
		for(var i=0; i<this.activeStatsPanelIDs.length; i++){ //delete panel if someone stands. Seems i need this loop and above loop for code to function properly
			var ID = this.activeStatsPanelIDs[i];
			this.removeDisplay(ID);
		}
		console.log(this.activeStatsPanelIDs); */
		var HUDdiv = document.getElementById("HUD");
		HUDdiv.innerText = ""; //remove all panels
		this.playerNumber = 0;
		for(var i=0; i<players.length; i++){
			var player = players[i];
			if(!(player.username == null)){
				this.playerNumber++;
			}
		}
		for(var i=0; i<players.length; i++){ //add new panels
			var player = players[i];
			if(!(player.username == null)){
				this.createDisplay(player, settings);
			}
		}
	}
	
	/* removeDisplay(ID){
		var element = document.getElementById(ID);
		if(element !== null){
			element.parentNode.removeChild(element);
		}
		this.activeStatsPanelIDs.splice(this.activeStatsPanelIDs.indexOf(ID), 1);
	} */
	
	createDisplay(player, settings){
        
		var panel = new Panel(player, this.aggregator, this.playerNumber, settings);
		var HUDdiv = document.getElementById("HUD");
		var div = panel.div;
		//var div = document.createElement("div"); //"<div id='stats' style='position: abosolute; top: '"+translatedY+"; left: "+translatedX+";>HELLO</div>"
		//var node = document.createTextNode("This is new. ");
		//div.appendChild(node);
		//if(!this.activeStatsPanelIDs.includes(ID)){
		//this.activeStatsPanelIDs.push(ID);
		//}
		HUDdiv.appendChild(div);

	}
	
	retrievePlayerData(n_seats) { //gets list of players and info about them
		var players = [];
        
        var playerDivs = document.getElementsByClassName("table-player");
        
        for(var i=0; i<playerDivs.length; i++){
            var currentPlayer = playerDivs[i];
            if( ! currentPlayer.classList.contains("table-player-seat") ){
                var nameDiv = currentPlayer.getElementsByClassName("table-player-name")[0].children[0];
                var name = nameDiv.innerHTML.replaceAll(" ", "__");
                var styles = window.getComputedStyle(playerDivs[i]);
                var x = styles.getPropertyValue("left");
                var y = styles.getPropertyValue("top");
                var height = styles.getPropertyValue("height");
                var fontSize = window.getComputedStyle(nameDiv).getPropertyValue("font-size");
                //console.log(x);
                players.push(new Player(name, x, y, height, fontSize, i));
            }
        }

		return players;
	}
	
}

class HandBuilder{ //gets called by execute()
	
	constructor(aggregator, settings){
		
		this.aggregator = aggregator;
		//console.log(this.you);
		this.currentHand = [""];
		this.currentHandForLogging = [""]; //includes "revealed lines"
		this.dealtLine = "";
		this.handNumber = 0;
		this.hands = [];
		this.recordingHands = false;
		this.stackLines = [];
		this.seatNumber;
		this.settings = settings;
        this.you;
		/* this.statsAggregator = new Aggregator();
		getStats(this.statsAggregator); //gets stats from memory */
		
	}
	
	getYou(){  //gets users username from a spot in the code. May need changing if code changes
		
        /* var userDiv = document.getElementsByClassName("you-player")[0];
        var nameDiv = userDiv.getElementsByClassName("table-player-name")[0];
        
        var name = nameDiv.innerHTML;
        
		this.you = name;
		this.aggregator.setYou(name); */
        
		return "None";
		
	}
	
	addHand(jsonLog){
		
		this.currentHand = [""]; //reset log for a new hand
		this.currentHandForLogging = [""];
		//this.stackLines = [""];
		var lastHandOriginal = this.extractLastHand(jsonLog);
        if(lastHandOriginal.length == 0){return;}
        //convert to donkhouse format here
        var lastHand = this.convertToDonkhouseFormat(lastHandOriginal);
		
		var previousLastLine = "";
		for(var i = 0; i<lastHand.length; i++){
			var lastLine = lastHand[i];
			if(!(lastLine == previousLastLine)){
				var lineWords = lastLine.split(" ");
				//if(lineWords[0] === "you"){lastLine = lastLine.replace("you", this.you);} //translate you to username of user
				//this.currentHandForLogging.push(lastLine);
				if(lastLine.includes("timed out")){lastLine = lastLine.replace("timed out and ", "");} //removing "timed out and " leaves only the username and "folded". translates to a basic folded message
				if(lastLine.includes("were dealt")){this.dealtLine = lastLine;} 
				if(lastLine.includes("(") && !lastLine.includes("showed")){ //if there's a parenthasis and it wasn't from a showed statement
					this.stackLines.push(lastLine);
					//console.log(this.stackLines);
				}
				if(!lastLine.includes("came through") && !lastLine.includes("added on") && !lastLine.includes("were dealt") && !lastLine.includes("stood up") && !(lastLine.includes("(")  && (!lastLine.includes("showed")))){
					if(!lastLine.includes("revealed")){
						this.currentHand.push(lastLine);
					}
					this.currentHandForLogging.push(lastLine);
					//console.log(lastLine);
				}
				previousLastLine = lastLine;
			}
		}
		
		this.currentHand[0] = this.stackLines.length.toString()+" players are in the hand";
		this.currentHandForLogging[0] = this.stackLines.length.toString()+" players are in the hand";
		//console.log(this.currentHand);
		//console.log(this.stackLines);
		this.createHand(this.currentHand, this.dealtLine); //passes list of hand lines
		if(this.recordingHands){
			//console.log("record");
			this.updateHands(); // gets array of hands. again must be done every hand in case user is multitabling //storeHandHistory now gets called from inside updateHands to ensure correct function call order
		}else{this.cleanup();}
		this.currentHand = [""]; //reset log for a new hand
		
	}
    
    position(stackLines, playerIndex){
        var pos = playerIndex;
        var playerNumber = stackLines.length;
        //pos = (pos + 1) % playerNumber; //shift position to the right
        var positionNames = {2:["BB", "SB"], 3:["SB", "BB", "BU"], 4:["SB", "BB", "CO", "BU"], 5:["SB", "BB", "UTG", "CO", "BU"], 6:["SB", "BB", "UTG", "MP", "CO", "BU"], 7:["SB", "BB", "UTG", "MP1", "MP2", "CO", "BU"], 8:["SB", "BB", "UTG", "MP1", "MP2", "MP3", "CO", "BU"], 9:["SB", "BB", "UTG", "UTG+1", "MP1", "MP2", "MP3", "CO", "BU"], 10:["SB", "BB", "UTG", "UTG+1", "UTG+2", "MP1", "MP2", "MP3", "CO", "BU"]};
        
        var positionName = positionNames[parseInt(playerNumber, 10)][pos];
        return positionName;
	}
    
    removeNameSpecialCharacters(line){
        if(line.includes("@")){ //&& (line.split(" ").length - line.split(" ").findIndex(word => word === "@")) > 2){ //if the player name is at the beginning and not at the end
            var player = line.split("\"")[1].split("@")[0];
            player = player.substring(0,player.length-1);//cut off trailing space
            //console.log(player);
            var spacelessPlayer = player.replaceAll(" ", "__"); //two underscores.
			var parenthasislessPlayer = spacelessPlayer.replaceAll("(", "--").replaceAll(")", "--");
            line = line.replace(player, parenthasislessPlayer); //this is to deal with players with spaces in there names
            //console.log(player);
        }
        return line;
    }
    
    convertToDonkhouseFormat(handLines){
        
        var translatedHandLines = [];
        var dealer = "";
        //console.log(handLines);
        //var stackLines = [];
        
        for(var i=0; i<handLines.length; i++){
            
            var line = handLines[i];
            
            line = this.removeNameSpecialCharacters(line);
            var player = line.split(" ")[0].split("\"")[1];
            
            if(line.includes("starting hand")){
                if(line.includes("dead button")){
                    dealer = "dead button";
                }
                else{
                    dealer = line.split("dealer: ")[1].split(" ")[0].split("\"")[1];
                }
            }
            //translate dealt line
            if(line.includes("Your hand is")){
                var hand = line.replace("Your hand is ", "").replace(",", "");
                translatedHandLines.push("you were dealt "+hand);
            }
            //translate stack lines
            if(line.includes("Player stacks: ")){
                var stackLines = line.replace("Player stacks: ", "").split(" | ");
                var translatedStackLines = [];
                for(var j=0; j<stackLines.length; j++){
                    var stackLine = stackLines[j];
                    stackLine = this.removeNameSpecialCharacters(stackLine);
                    player = stackLine.split(" ")[1].split("\"")[1];
                    var stack = stackLine.split("(")[1].replace(")", "");
                    translatedStackLines.push(player+" ("+stack+", "+"[position]"+")");
                }
                //console.log(translatedStackLines);
                if(! dealer === "dead button"){ //quick fix for infinite loop caused by dead button. Not sure yet if this will cause other problems. Will definitely mess up hand history for that hand.
                    while(! (translatedStackLines[translatedStackLines.length-1].split(" ")[0] === dealer)){ //if the last guy isn't the dealer shift until they are
                        //console.log(dealer);
                        //console.log(translatedStackLines[translatedStackLines.length-1].split(" ")[0]);
                        var firstElement = translatedStackLines[0];
                        translatedStackLines.shift();
                        translatedStackLines.push(firstElement);
                    }
                }
                    //console.log(translatedStackLines);
                for(var j=0; j<translatedStackLines.length; j++){
                    var position = this.position(translatedStackLines, j);
                    translatedHandLines.push(translatedStackLines[j].replace("[position]", position));
                }
                //console.log(translatedStackLines);
            }
            //translate blinds
            if(line.includes("posts a small blind of") || line.includes("posts a big blind of")){
                var blindSize = line.split("blind of ")[1].split(" ")[0];
                translatedHandLines.push(player+" posted "+blindSize);
            }
            //translate raises
            if(line.includes("raises to")){
                var raiseSize = line.split("raises to ")[1];
                translatedHandLines.push(player+" raised to "+raiseSize);
            }
            //translate folds
            if(line.includes("\" folds")){
                translatedHandLines.push(player+" folded");
            }
            //translate boards
            if(line.includes("Flop: ") || line.includes("Turn: ") || line.includes("River: ")){
                var strippedBoard = line.replace("Flop:  ", "").replace("Turn: ", "").replace("River: ", "").replace("[", "").replace("]", "").replaceAll(",", "").replace("Flop: ", ""); //last replace statement is in case they ever remove the wierd two spaces after flop in the log
                translatedHandLines.push("board: "+strippedBoard);
            }
            //translate calls
            if(line.includes(" calls ")){
                var callSize = line.split(" calls ")[1];
                translatedHandLines.push(player+" called "+callSize);
            }
            //translate bets
            if(line.includes(" bets ")){
                var betSize = line.split(" bets ")[1];
                translatedHandLines.push(player+" bet "+betSize);
            }
            //translate showdowns
            if(line.includes(" shows a ")){
                var hand = line.split(" shows a ")[1].replace(",", "").replace(".","");
                translatedHandLines.push(player+" showed "+hand);
            }
            
            if(line.includes(" collected ")){
                var wonAmount = line.split(" collected ")[1].split(" ")[0];
                translatedHandLines.push(player+" won "+wonAmount)+" chips";
            }
            //translate checks
            if(line.includes(" checks")){
                translatedHandLines.push(player+" checked");
            }
            
        }
        
        //console.log(translatedHandLines);
        return translatedHandLines;
        
    }
	
				/* while(inPlayerLines){
					var currentLine = lines[lines.length-currentLineOffset];
					if(currentLine.includes("(") && (!currentLine.includes(":"))){ //if there's a parenthasis and no one said it in the chat
						currentLineOffset++;
						stackLines.push(currentLine);
					}
					else{
						inPlayerLines = false;
					}
					console.log(currentLine);
					console.log(currentLineOffset);
				}
				var players = currentLineOffset - 2;
				for(var i = stackLines.length-1; i > -1; i--){ //since we added the stacklines going up the chat we have to reverse the order
					builder.addLine(stackLines[i].replace(" are in the hand.", "")); //send to hand builder and strip out " are in the hand cause that confuses it"
				}
				lastLine = players.toString() + " players are in the hand" */
	
	extractLastHand(jsonLog){
		
		var handStart;
		var handEnd;
		for(var i=0; i<Object.keys(jsonLog.logs).length; i++){ //get hand end
            var line = jsonLog.logs[i].msg;
			if( line.includes("ending hand #") ){ //once we get out of the stack lines
				handEnd = i;
			}
            if( ( handEnd != undefined ) && line.includes("starting hand #") ){ //check if handEnd is already set, otherwise we run the risk of just pulling out a partial currently running hand instead of the last complete hand
                handStart = i;
                break;
            }
		}
		//console.log(handStart);
		//console.log(handEnd);
        
        var handLines = [];
        
        var logs = jsonLog.logs;
        for(var i = handStart; i >= handEnd; i--){
            var message = logs[i].msg;
            handLines.push(message);
        }
        
		//console.log(handLines);
		return handLines;
		
	}
    
    cleanup(){
        
        //console.log("cleanup");
		this.currentHandForLogging = [""]; //these must all be cleared after the history string is created
		this.dealtLine = "";
		this.stackLines = [];
        
    }
	
	storeHandHistory(){
		
        if(this.hands.length >= 2000){
            var haveAlerted = this.sentHistorySizeAlert;
            if(!haveAlerted){
				alert("The size of your hand history file has exceeded it's maximum (2000 hands). In order to keep recording hands copy it's contents somewhere and click \"Clear History\". You can ignore this message and stats will continue to update normally.");
                this.sentHistorySizeAlert = true;
            }
            this.cleanup();
            return;
        }else{this.sentHistorySizeAlert = false;}
		
		//console.log("brapapa");
		try{
			var logString = this.convertToPokerStarsFormat(this.currentHandForLogging, this.dealtLine, this.stackLines);
		}catch{
			console.log("something went wrong logging the hand");
			var logString = "";
		}
        this.cleanup();
		this.handNumber += 1;
		//console.log(logString);
		var self = this;
		/* chrome.storage.local.get(['hands'], function(result) {
			console.log('Value currently is ' + result.hands);
			self.hands = result.hands;
		}); */
		this.hands.push(logString);
		chrome.storage.local.set({"hands": self.hands}, function() {
			console.log("updated hands!");
		});
		/* console.log(this.handNumber);
		chrome.storage.local.set({"handNumber": self.handNumber}, function() {	
			console.log('Value is set to ' + self.handNumber);
		}); */
		
	}
	
	updateHands(){ //setting this.handNumber to what it currently is
		
		var self = this;
		chrome.storage.local.get(['hands'], function(result) {
			self.hands = result.hands;
			self.storeHandHistory();
		});
		
	}
	
	setSeatNumber(n){
		this.seatNumber = n;
	}
	
	convertToPokerStarsFormat(handLines, dealtLine, stackLines){
		
		//console.log(handLines.slice());
		//console.log(dealtLine);
		//console.log(stackLines.slice());
		
		var history = "";
		
		var sb = handLines[1].split(" ")[2];
		var bb = handLines[2].split(" ")[2];
		var date = new Date();
		var year = date.getFullYear().toString();
		var month = (date.getMonth() + 1).toString();
		if(month.length == 1){month = "0"+month;}
		var day = date.getDate().toString();
		if(day.length == 1){day = "0"+day;}
		var hour = date.getHours().toString();
		if(hour.length == 1){hour = "0"+hour;}
		var minute = date.getMinutes().toString();
		if(minute.length == 1){minute = "0"+minute;}
		var second = date.getSeconds().toString();
		if(second.length == 1){second = "0"+second;}
		var timezone = date.toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2];
		
		history = "Hold'em No Limit ("+sb+"/"+bb+") - "+year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second+' '+timezone+'\n'
		
		var tabTitle = document.getElementsByTagName('title')[0].innerHTML;
		var tableName = tabTitle.slice(0,tabTitle.length-" - donkhouse.com".length);
		var seatNumber = this.seatNumber;
		//console.log(seatNumber);
		var buttonSeatNumber;
		var buttonAbbrv = "BU)"; //parenthasis is included so that someone with BU in their name won't trigger a false positive
		if(stackLines.length == 2){
			buttonAbbrv = "SB)"; //when headsup the chat says SB instead of BU
		}
		for(var i=0; i<stackLines.length; i++){
			var line = stackLines[i];
			if(line.includes(buttonAbbrv)){
				buttonSeatNumber = i+1;
			}
		}
		
		history = history + "Table '"+ tableName +"' "+seatNumber.toString()+"-max Seat #"+buttonSeatNumber.toString()+" is the button\n"
		
		for(var i=0; i<stackLines.length; i++){
			var line = stackLines[i];
			var seat = i+1;
			var username = line.split(" ")[0];
			var chips = line.split(" ")[1].slice(1, line.split(" ")[1].length-1);
			history = history + "seat "+seat.toString()+": "+username+" ("+chips+" in chips)\n";
		}
		
		var sbUser = handLines[1].split(" ")[0];
		var sbSize = handLines[1].split(" ")[2];
		
		history = history + sbUser + ": posts small blind "+sbSize+"\n";
		
		var bbUser = handLines[2].split(" ")[0];
		var bbSize = handLines[2].split(" ")[2];
		
		history = history + bbUser + ": posts big blind "+bbSize+"\n";
		
		if(dealtLine != ""){
			history = history + "*** HOLE CARDS ***\n";
			
			var selfUsername = dealtLine.split(" ")[0];
			var firstCard = this.replaceSymbol(dealtLine.split(" ")[3]);
			var secondCard = this.replaceSymbol(dealtLine.split(" ")[4]);
			
			history = history + "Dealt to " + selfUsername + " [" +firstCard+" "+secondCard+ "]\n";
		}
		
		var street = 0;
		var firstShow = true;
		for(var i = 3; i<handLines.length; i++){
			var line = handLines[i]; // needs to not affect hand history
			if(line.includes("showed") && firstShow){
				history = history + "*** SHOW DOWN ***\n";
				firstShow = false;
			}
			if(line.includes("board")){
				history = history + this.translateBoard(line, street);
				street+=1;
			}else{
				history = history + this.translateAction(line);
			}
		}
		
		return history;
		
	}
	
	translateBoard(line, street){
		var line = this.replaceSymbol(line);
		var streets = ["FLOP", "TURN", "RIVER"];
		var streetSizes = {0:[7, 15], 1:[16, 18], 2:[19, 21]};
		
		var boardLine = "*** " + streets[street] + " ***"
		
		var lastChop = 0; // for use in double board situations
		for(var i=0; i<street+1; i++){
			//console.log(i);
			boardLine = boardLine + " [";
			var chopStart = streetSizes[i][0];
			var chopEnd = streetSizes[i][1];
			lastChop = chopEnd;
			boardLine = boardLine + line.slice(chopStart, chopEnd);
			boardLine = boardLine + "]";
		}
		
		if(line.includes("/")){ //if it's ran twice or is a double board
			boardLine = boardLine + " / ";
			lastChop = lastChop + " / ".length - streetSizes[0][0];
			for(var i=0; i<street+1; i++){
				boardLine = boardLine + " [";
				var chopStart = streetSizes[i][0] + lastChop;
				var chopEnd = streetSizes[i][1] + lastChop;
				boardLine = boardLine + line.slice(chopStart, chopEnd);
				boardLine = boardLine + "]";
			}
		}
		
		boardLine = boardLine + "\n";
		
		return boardLine;
	}
	
	translateAction(line){
		var username = line.split(" ")[0];
		var action = line.split(" ")[1];
		var newAction = "";
		if(action == "bet"){newAction = "bets " + line.split(" ")[2];}
		else if(action == "called"){newAction = "calls " + line.split(" ")[2];}
		else if(action == "checked"){newAction = "checks";}
		else if(action == "folded"){newAction = "folds";}
		else if(action == "raised"){newAction = "raises to " + line.split(" ")[3];}
		else if(action == "mucked"){newAction = "mucks hand";}
		else if(action == "revealed"){newAction = "reveals " + this.replaceSymbol(line.slice(username.length+action.length+2,line.length));}
		else if(action == "showed"){
			var firstCard = this.replaceSymbol(line.split(" ")[2]);
			var secondCard = this.replaceSymbol(line.split(" ")[3]);
			newAction = "shows [" + firstCard + " " + secondCard + "]";
		}
		else if(action == "won"){newAction = "wins " + line.split(" ")[2];}
		
		var translatedLine = username+": " + newAction + "\n";
		return translatedLine;
	}
	
	replaceSymbol(card){
		var card = card;
		card = card.replaceAll("10", "T");
		card = card.replaceAll("♥", "h");
		card = card.replaceAll("♦", "d");
		card = card.replaceAll("♠", "s");
		card = card.replaceAll("♣", "c");
		return card;
	}
	
	createHand(handLines){
		
		this.aggregator.requestServerAnalysis(handLines);
		
	}
	
}

/* function store(key, value){ //for stats dict: key is player, value is {statName:statValue}. I think this function is never called?
	
	chrome.storage.local.set({key: value}, function() { 
		console.log(key + ' is set to ' + value);
	});
	
} */

function getStats(aggregator){
	
	chrome.storage.local.get(["stats"], function(result) {
		aggregator.stats = result["stats"];//["stats"];
		//console.log("STATS");
		//console.log(aggregator.stats);
		//console.log(JSON.stringify(aggregator.stats));
		aggregator.unpackStats();
	});
	
}

class Aggregator{
	
	constructor(){
		
		this.stats = {};
		this.you = "";
	
	}
	
	setYou(you){
		this.you = you;
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
	
	/* getNumberOfHands(username, tableSize){
		
		var data = this.getData(this.stats["VPIP"], tableSize, username);
		return data[1];
		
	} */
	
	getData(dataDict, tableSize, player){ //get list representation of the data from a path of player and . player argument is username, not a Player object
		dataDict = this.makePath(dataDict, tableSize, player);
		return dataDict[player][tableSize];
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
	
	getStat(statName, dataDict, tableSize, username){  
		
		var percentStats = ["VPIP", "PFR", "3B", "4B", "F3", "WTSD", "CB", "2B", "3Ba", "FC", "F2B", "F3B"];//stats that are represented as a percent
		var nonPercentStats = ["AF", "H"];
		
		var data = this.getData(dataDict, tableSize, username);
		var string = "";
		if(statName == "H"){
			string = "("+data[1]+")"
		}else if(percentStats.includes(statName)){
			string = ((data[0]/data[1])*100).toFixed(1);
		}else{
			string = (data[0]/data[1]).toFixed(2);
		}
		return string;
		
	}
	
	/* printStats(tableSize, players){
		
		var statKeys = Object.keys(this.stats);
		var handPlayers = [...players];
		var dict = {};
		
		for(var i=0; i<statKeys.length; i++){
			var stat = statKeys[i]; //stat name
			var statData = this.stats[stat]; //data in stat name (dict with keys as player data)
			for(var j=0; j<Object.keys(statData).length; j++){
				var player = Object.keys(statData)[j];
				if(!Object.keys(dict).includes(player)){
					dict[player] = [];//[this.stats["VPIP"][player][tableSize][1]];
				}
				try{
					dict[player].push(stat +": "+ String(statData[player][tableSize][0]/statData[player][tableSize][1]));
				}catch{}
			}
		}
		for(var i=0; i<players.length; i++){
			var player = players[i];
			console.log(player);
			console.log(dict[player]);
		}
		
	} *///////
	
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
		
		//console.log(this.stats);
		
	}
	
	storeStats(HandsData, VPIPdata, PFRdata, AFdata, threeBetData, fourBetData, F3data, WTSDdata, CBdata, twoBarrelData, threeBarrelData, FCdata, F2Bdata, F3Bdata){ 
		if(arguments.length > 0){ //if dicts got passed in as args then they need packing. otherwise we are just storing the current stats dict (which we do when restoring and assimilating dicts)
			this.packStats(HandsData, VPIPdata, PFRdata, AFdata, threeBetData, fourBetData, F3data, WTSDdata, CBdata, twoBarrelData, threeBarrelData, FCdata, F2Bdata, F3Bdata); //packs stats into this.stats
		}
		chrome.storage.local.set({"stats": this.stats}, function() {
			console.log('Value is set to ' + this.stats);
		});
		
	}
	
	requestServerAnalysis(handLines){
		
		chrome.runtime.sendMessage({"handLines": handLines, "stats": this.stats, "command": "requestServerAnalysis", "you": this.you}, function(response) {
			console.log(response.confirmation);
		});
		
	}
	
	assimilate(newData){
		var nativeStats = this.stats;
		var dataStats = Object.keys(newData);
		dataStats.forEach(function(stat){
			var statData = dataStats.stat;
			Object.keys(statData).forEach(function(name){
				var nameData = statData.name;
				Object.keys(nameData).forEach(function(tableSize){
					var data = nameData.tableSize();
					var nativeDataDict = nativeStats.stat;
					var nativeDataPoint = getData(nativeDataDict, tableSize, name);
					var newDataPoint = newData.stat.name.tableSize;
					var assimilatedDataPoint = [nativeDataPoint[0]+newDataPoint[0], nativeDataPoint[1]+newDataPoint[1]];
					this.stats.stat.name.tableSize = assimilatedDataPoint;
				})
			})
		})
	}
	
}

class LogScraper{
    
    constructor(){
        this.lastHandNumber = 0;
		this.lastCreatedAt = 0; //holds last created at number to reduce server load.
		//this.getFullLog(); //sets lastCreatedAt
    }
    
    removeChat(chatText){
        
        var jHtmlObject = jQuery("<p>"+chatText);
        var editor = jQuery("<p>").append(jHtmlObject);
        editor.find(".speech_container_yyy").remove();
        var newHtml = editor.html();
        var activityText = newHtml;
        return activityText;
        
    }

    seperateIntoLines(chat){
        
        var chatLines = chat.split("<br>");
        for(var i=0; i<chatLines.length; i++){
            chatLines[i] = chatLines[i].replace(/(<([^>]+)>)/ig,"");
        }
        return chatLines;
        
    };
    
    //extractHand(){}

    httpGetAsync(theUrl, callback){//https://stackoverflow.com/questions/247483/http-get-request-in-javascript
        var xmlHttp = new XMLHttpRequest();
        var self = this;
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(xmlHttp.responseText, self);
        }
        xmlHttp.open("GET", theUrl, true); // true for asynchronous 
        xmlHttp.send(null);
    }

    processLog(text, self){
        if(Object.prototype.toString.call(text) === "[object String]"){
            var jsonLog = JSON.parse(text);
        }else if(Object.prototype.toString.call(x) === "[object Object]"){ //it looks like for some people the log might get returned as an object and not a string.
            var jsonLog = text;
        }
		
		var searchDepth = 10;
		if(jsonLog.logs.length <= searchDepth){searchDepth = jsonLog.logs.length-1;}
		
        for(var i = searchDepth; i >= 0; i--){ //we can probably drop the starting value of i way down
            var message = jsonLog.logs[i].msg;
            //console.log(message);
            if(message.includes("ending hand #")){ //if a hand is ending
				self.lastCreatedAt = jsonLog.logs[i].created_at;
                var number = message.split("#")[1].split(" ")[0];
                if(number > self.lastHandNumber){ //if it's a new hand that we haven't seen before
                    self.lastHandNumber = number;
                    //console.log(self.lastHandNumber);
                    builder.addHand(jsonLog);
                }
            }
        }
    }
	
	setInitialCreatedAt(text, self){
        if(Object.prototype.toString.call(text) === "[object String]"){
            var jsonLog = JSON.parse(text);
        }else if(Object.prototype.toString.call(x) === "[object Object]"){ //it looks like for some people the log might get returned as an object and not a string.
            var jsonLog = text;
        }
		self.lastCreatedAt = jsonLog.logs[0].created_at;
	}
	
	getFullLog(){
        var currentURL = window.location.href;
        this.httpGetAsync(window.location.href+"/log", this.setInitialCreatedAt);
	}
	
    getLog(){
        builder.recordingHands = settings.checkIfRecordingHands();
        var currentURL = window.location.href;
        this.httpGetAsync(window.location.href+"/log?after_at="+this.lastCreatedAt, this.processLog);
    }
    
}

function arraysEqual(a, b) { //https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length !== b.length) return false;

	// If you don't care about the order of the elements inside
	// the array, you should sort both arrays here.
	// Please note that calling sort on an array will modify that array.
	// you might want to clone your array first.

	for (var i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

function sleep(ms) { //https://www.sitepoint.com/delay-sleep-pause-wait/
	return new Promise(resolve => setTimeout(resolve, ms));
}

var aggregator = new Aggregator();
getStats(aggregator); //gets stats from memory

var settings = new Settings();

//https://html.com/javascript/popup-windows
function popup(mylink, windowname) { 
	if (! window.focus)return true; 
	let popupURL = chrome.runtime.getURL(mylink)
	window.open(popupURL, windowname, 'width=400,height=200,scrollbars=yes'); 
	return false; 
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.command == "updateStats2"){ //updateStats2 is from background.js to content.js wheras updateStats is from popup.js to background.js
			settings.statsToShow = request.stats;
			sendResponse({"confirmation": "success"});
		}
		if (request.command == "record2"){ //updateStats2 is from background.js to content.js wheras updateStats is from popup.js to background.js
			settings.record = request.state;
			sendResponse({"confirmation": "success"});
		}
		if(request.command == "restore"){
			console.log("restore");
			console.log(request.stats);
			aggregator.stats = JSON.parse(request.stats);
			console.log(aggregator.stats);
			aggregator.storeStats();
			sendResponse({"confirmation": "success"});
		}
		if(request.command == "assimilate"){
			console.log("assimilate");
			aggregator.assimilate(JSON.parse(request.stats));
			aggregator.storeStats();
			sendResponse({"confirmation": "success"});
		}
		if(request.command == "cleared"){
			var confirm = window.confirm("Are you sure you want to clear your data? Without a backup it will not be recoverable.");
			if(confirm == true){
				chrome.storage.local.set({'stats':{}}, function(data) {
					console.log("success");
				});
				
				console.log("cleared");
				getStats(aggregator);
				sendResponse({"confirmation": "success"});
			}
		}
		if(request.command == "popupDonation"){
			popup("donatePopup.html", "test")
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
		/*if(request.command == "serverUpdate"){
			console.log("server!");
			aggregator.stats = request.stats;
			console.log(aggregator.stats);
			sendResponse({"confirmation": "success"});
		}*/
	}
);

var builder = new HandBuilder(aggregator, settings);
var hud = new HUD(aggregator, settings, builder);
var scraper = new LogScraper();

function tester(){
    scraper.getLog();
    sleep(500).then(() => { tester(); });
}

//tester();

//execute();
//sleep(1000).then(() => { tester(0); })

//"https://donkhouse.com/group/*/*"
//file:///C:/Users/ethan/OneDrive/Documents/code/chromeExtensions/test/index.txt

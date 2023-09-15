
$( function() {
	$( "#tabs" ).tabs();
} );

$( function() {
    $( "#sortable1, #sortable3, #sortableBin, #sortable2" ).sortable({
      connectWith: ".connectedSortable"
    }).disableSelection();
  } );

$(".tab").click(function() {
	$(".tab").removeClass('selected')
	$(this).addClass('selected')
	$( "#restoreDiv" ).hide();
	$( "#addDiv" ).hide();
	console.log("hide");
	$( "#backupDiv" ).hide();
	$( "#buttonsDiv" ).show();
})

$( "#restoreDiv" ).hide();
$( "#addDiv" ).hide();
$( "#backupDiv" ).hide();

class PanelTab { //im including the checkbox on the data tab cause im too lazy to make a new class for it
	
	constructor(){
		this.stats = ["H", "VPIP", "PFR", "AF", "CB", "2B", "3Ba", "3B", "4B", "FC", "F2B", "F3B", "F3", "WTSD"];
		this.lists = ["sortable1", "sortable2", "sortable3", "sortableBin"]; //will have to change if more lines are added or smth
		this.listItems = {};
		//this.reverseListItems = {};
		this.generateListItems(this.stats);
		//this.generateReverseListItems(this.stats)
	}
	
	addCheckListeners(){ //if one of the stats is clicked then add a label when dispayed
		this.stats.forEach(function(stat){
			var statCheckBox = document.getElementById("checkbox-"+stat);
			statCheckBox.addEventListener('click', function(event) {
				console.log("-----------------------------");
				var statName = stat;
				console.log(stat);
				var statBox = document.getElementById("checkbox-"+statName);
				var label = statBox.getAttribute("data-label");
				if(label == "false"){
					statBox.setAttribute("data-label", "true");
					var labelElement = document.getElementById(statName+"BoxLabel")
					labelElement.innerText = "L:"+statName;
				}else{
					statBox.setAttribute("data-label", "false");
					var labelElement = document.getElementById(statName+"BoxLabel")
					labelElement.innerText = statName;
				}
			});
		})
	}
	
	isStableState(lines){
		console.log(lines);
		var allStatsN = this.stats.length;
		var panelStatsN = 0; //number of stats in lists on the panel. certain behavior can leave a stat in limbo and we want to be sure not to save such a state
		for(var i=0; i<lines.length; i++){ //for each line
			panelStatsN += lines[i].length;
		}
		if(allStatsN == panelStatsN){
			console.log(true);
			return true;
		}
		else{
			console.log(false);
			return false;
		}
	}
	
	generateListItems(stats){
		
		for(var i=0; i<stats.length; i++){
			var stat = stats[i];
			this.listItems["n"+stat] = '<li class="ui-state-default" id="'+stat+'"><label class="statLabels" for="checkbox-'+stat+'" id="'+stat+'BoxLabel">'+stat+'</label><input type="checkbox" name="checkbox-'+stat+'" id="checkbox-'+stat+'" data-label="false" data-stat="'+stat+'" class="statBrick"></li>'
			this.listItems["l"+stat] = '<li class="ui-state-default" id="'+stat+'"><label class="statLabels" for="checkbox-'+stat+'" id="'+stat+'BoxLabel">L:'+stat+'</label><input type="checkbox" name="checkbox-'+stat+'" id="checkbox-'+stat+'" data-label="true" data-stat="'+stat+'" class="statBrick"></li>'
		}  
		
	}
	
	/* generateReverseListItems(stats){
		
		for(var i=0; i<stats.length; i++){
			var stat = stats[i];
			this.reverseListItems['<li class="ui-state-default" id="'+stat+'">'+stat+'</li>'] = stat; 
		}
		
	} */
	
	restorePanelSettings(panelSettings){
		
		console.log(this.listItems);
		for(var i=0; i<panelSettings.length; i++){ //for each list
			var str = "";
			console.log(panelSettings);
			for(var j=0; j<panelSettings[i].length; j++){ //for each stat
				console.log(str);
				var stat = panelSettings[i][j];
				str = str + this.listItems[stat];
			}
			document.getElementById(this.lists[i]).innerHTML = str;
		}
		
		this.addCheckListeners();
		return true;
		
	}

	extractPanelSettings(){ //generates panelSettingsList from html. pretty messy function. could use reworking
		
		var panelLists = []; //last one is the bin of unused
		for(var i=0; i<this.lists.length; i++){ //for each line
			panelLists.push([]);
			var lineID = this.lists[i];
			var line = document.getElementById(lineID);
			var listItems = line.childNodes;
            console.log(listItems);
			for(var j=0; j<listItems.length; j++){ //for each item in line
				var listItem = listItems[j];
                console.log(listItem.className);
                var item;
                if(! (listItem.className == "ui-sortable-placeholder ui-state-default")){ //fixes bug that tries to get data from the placeholder of the block before it's placed
                    var item = listItem.childNodes[1].id; //[1] is checkbox, 0 is label
                
                    console.log(item);
                    var labeled = document.getElementById(item).getAttribute("data-label");
                    var statName = document.getElementById(item).getAttribute("data-stat");
                    console.log(item+labeled);
                    if(labeled == "true"){ //if item is labeled append lowercase l in front of it
                        statName = "l"+statName;
                    }else{ //else lowercase n
                        statName = "n"+statName;
                    }
                    if(!(item==null)){ //when does this occur? when it's a placeholder?
                        panelLists[i].push(statName);
                    }else{return;}  
                }          
			}
		}
		console.log(panelLists);
		return panelLists;
		
	}
}

class Main {
	
	constructor(){
		
		this.panelTab = new PanelTab();
		this.restoreLastState();
		this.loadComplete = false;
		var self = this;
		this.settings = {};
		
		this.watchRecordCheckbox();
		this.watchHUDCheckbox();
		this.watchSetOffsets();

		$('body').on('DOMSubtreeModified', '#tabs-1', function(){
			console.log(document.getElementById("tabs-1"));
			if(self.loadComplete){
				console.log("a");
				self.saveState();
				self.updateStats();
			}
		});
		
	}
	
	watchRecordCheckbox(){
		
		var self = this;
		var recordBox = document.getElementById("recordBox");
		recordBox.addEventListener('change', function() {
			console.log("buttabell");
			self.saveState();
			self.updateRecord();
		});
		
	}
	
	watchSetOffsets(){
		
		var self = this;
		var setOffsetButton = document.getElementById("setOffsetButton");
		setOffsetButton.addEventListener('click', function() {
			console.log("offset!");
			self.saveState();
			//self.updateOffset();
		});
		
	}
	
	watchHUDCheckbox(){
		
		var self = this;
		var showHUD = document.getElementById("showingHUDBox");
		showHUD.addEventListener('change', function() {
			console.log("show");
			self.saveState();
			//self.updateShow();
		});
		
	}
	
	updateRecord(settings){
		
		chrome.runtime.sendMessage({"record": settings.recordBox, "command": "updateRecord"}, function(response) {
			console.log(response.confirmation);
		});
		
	}
	
	updateOffset(settings){
		
		chrome.runtime.sendMessage({"panelOffset": settings.panelOffset, "command": "updateOffset"}, function(response) {
			console.log(response.confirmation);
		});
		
	}
	
	recallPanel(){
		
		var panelSettings = [[],[],[],["lH", "lVPIP", "lPFR", "lAF", "lCB", "l2B", "l3Ba", "l3B", "l4B", "lFC", "lF2B", "lF3B", "lF3", "lWTSD"]];
		this.panelTab.restorePanelSettings(panelSettings);
		
	}
	
	restoreLastState(){
		
		var self = this;
		chrome.storage.local.get(['settings'], function(result) {
			var panelSettings = result.settings.panelSettings; //should just be the html of the panel tab
			console.log("restore");
			console.log(panelSettings);
			console.log(result);
			self.settings = result.settings;
			self.restoreRecordBox(result.settings.recordBox);
			self.restoreShowBox(result.settings.showingHUD);
			self.restorePanelOffsetBoxes(result.settings.panelOffset);
			self.loadComplete = self.panelTab.restorePanelSettings(panelSettings);
			console.log('Value currently is ' + result.key);
		});
		
	}
	
	restoreShowBox(state){
		document.getElementById("showingHUDBox").checked = state;
	}
	
	restoreRecordBox(state){
		document.getElementById("recordBox").checked = state;
	}
	
	restorePanelOffsetBoxes(state){
		console.log(state);
		document.getElementById("xOffsetBox").value = state[0];
		document.getElementById("yOffsetBox").value = state[1];
	}
	
	packSettings(){ //pack settings for storage
		
		var settings = {};
		var panelSettings = this.panelTab.extractPanelSettings(); //this just extracts the stat tile info
		console.log(1);
		console.log(panelSettings);
		if(this.panelTab.isStableState(panelSettings)){
			settings["panelSettings"] = panelSettings;
		}else{
			settings["panelSettings"] = this.settings.panelSettings;
		}
		console.log(document.getElementById("recordBox").checked);
		settings["recordBox"] = document.getElementById("recordBox").checked;
		settings["showingHUD"] = document.getElementById("showingHUDBox").checked;
		var yOffset = parseInt(document.getElementById("yOffsetBox").value);
		var xOffset = parseInt(document.getElementById("xOffsetBox").value);
		settings["panelOffset"] = [xOffset,yOffset];
		console.log(settings);
		return settings;
		
	}

	saveState(){
		
		console.log(1);
		var settings = this.packSettings();
		this.settings = settings;
		console.log(settings);
		chrome.storage.local.set({"settings": settings}, function() {
			console.log('Value is set to ' + settings);
		});	
	}
	
	updateStats(){
		console.log("triggered");
		var settings = this.settings;
		
		console.log("settings being sent");
		console.log(settings);
		chrome.runtime.sendMessage({"stats": settings.panelSettings, "command": "updateStats"}, function(response) {
			console.log(response.confirmation);
		});
	}
}


/* function getCheckedBoxIDs(){
	
	var checked = [];
	for(var i=0; i<checkBoxIDs.length; i++){
		var box = checkBoxIDs[i];
		if(document.getElementById(box).checked){
			checked.push(document.getElementById(box).id);
		}
	}
	console.log("checked");
	console.log(checked);
	return checked;
	
}

function getCheckedBoxValues(){
	
	var checkedBoxIDs = getCheckedBoxIDs();
	var checkedValues = [];
	for(var i=0; i<checkedBoxIDs.length; i++){
		var value = document.getElementById(checkedBoxIDs[i]).value;
		checkedValues.push(value);
	}
	return checkedValues;
	
} */
/* 
function updateStats(){
	console.log("triggered");
	var checkedValues = getCheckedBoxValues();
	
	console.log("values");
	console.log(checkedValues);
	chrome.runtime.sendMessage({"stats": checkedValues, "command": "updateStats"}, function(response) {
		console.log(response.confirmation);
	});
} */

/* function restoreBoxes(stats){
	
	console.log("stats");
	console.log(stats);
	for(var i=0; i<stats.length; i++){
		var ID = stats[i]+"box";
		console.log(ID);
		document.getElementById(ID).checked = true;
	}
	
} */

document.addEventListener('DOMContentLoaded', function() {
	
    var clearButton = document.getElementById('clearStats');
    // onClick's logic below:
    clearButton.addEventListener('click', function() {
        clearStats();
    });
	var backupButton = document.getElementById('backup');
    // onClick's logic below:
    backupButton.addEventListener('click', function() {
        showBackup();
    });
	var restoreButton = document.getElementById('restoreStats');
    // onClick's logic below:
    restoreButton.addEventListener('click', function() {
        showRestore();
    });
	var addButton = document.getElementById('add');
    // onClick's logic below:
    addButton.addEventListener('click', function() {
        showAdd();
    });
	var clearHistoryButton = document.getElementById('clearHistory');
    // onClick's logic below:
    clearHistoryButton.addEventListener('click', function() {
        clearHistory();
    });
	var handHistoryButton = document.getElementById('handHistory');
    handHistoryButton.addEventListener('click', function() {
		chrome.tabs.create({active: true, url: "history.html"});
    });
	for(var i=1; i<=3; i++){
		var cancelButton = document.getElementById('cancel'+String(i));
		console.log('cancel'+String(i));
		cancelButton.addEventListener('click', function() {
			cancel();
		});
	}
	
	var addSubmit = document.getElementById('addButton');
    // onClick's logic below:
    addSubmit.addEventListener('click', function() {
        addStats();
    });
	var restoreSubmit = document.getElementById('restoreButton');
    // onClick's logic below:
    restoreSubmit.addEventListener('click', function() {
        restoreStats();
    });
	
	var copyButton = document.getElementById('copyButton');
    // onClick's logic below:
    copyButton.addEventListener('click', function() {
        copyStats();
    });
	
	var main = new Main();
	
	var recallButton = document.getElementById('recall');
    // onClick's logic below:
    recallButton.addEventListener('click', function() {
        console.log("b");
		main.recallPanel();
    });
	
});

/* chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.log(sender.tab ?
			"from a content script:" + sender.tab.url :
			"from the extension");
		if (request.request == "settings"){
			var checked = [];
			for(var i=0; i<checkBoxes.length; i++){
				var box = checkBoxes[i];
				console.log(box);
				if(document.getElementById(box).checked){
					checked.push(document.getElementById(box).value);
					console.log(checked);
				}
			}
			sendResponse({"stats": checked});
		}
	}
); */

function clearStats(){
	console.log("clear stats");
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {"command": "cleared"}, function(response) {// doesn't tell content.js to get stats from memory, rather tells content.js to set aggregator.stats to data messaged
			console.log(response.confirmation);
		});
	});
}

function clearHistory(){
	
	console.log("clear history");
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {"command": "clearedHistory"}, function(response) {
			console.log(response.confirmation);
		});
	});
	
}

function copyStats(){
	
	var copyText = document.getElementById("backupBox");
	copyText.select();
	copyText.setSelectionRange(0, 999999)
	document.execCommand("copy");
	
}

function showBackup(){
	
	$( "#buttonsDiv" ).hide();
	$( "#backupDiv" ).show();
	console.log("shown");
	backupStats();
	
}

function backupStats(){
	
	chrome.storage.local.get(['stats'], function(result) {
		var stats = result.stats;
		console.log("backup");
		console.log(stats);
		var textBox = document.getElementById("backupBox");
		textBox.value = JSON.stringify(stats);
		//prompt("This data can be used to restore the statistics that DHUD has accumulated so far (ie. if you're clearing the browser data or moving to a new computer). Copy it somewhere safe. (ctrl + a) to select all, and then (ctrl + c) to copy.", JSON.stringify(stats));
	});
	/* chrome.runtime.sendMessage({"command": "backup"}, function(response) {
		console.log(response.confirmation);
	}); */
	
}

function showRestore(){
	
	$( "#buttonsDiv" ).hide();
	$( "#restoreDiv" ).show();
	
}

function restoreStats(){
	
	var statText = document.getElementById("restoreBox").value;
	console.log(statText);
	chrome.runtime.sendMessage({"command": "restore", "stats":statText}, function(response) {
		console.log(response.confirmation);
	});
	document.getElementById("restoreBox").value = "";
	$( "#restoreDiv" ).hide();
	$( "#buttonsDiv" ).show();
	
}

function showAdd(){
	
	$( "#buttonsDiv" ).hide();
	$( "#addDiv" ).show();
	
}

function addStats(){
	
	var statText = document.getElementById("addBox").value;
	chrome.runtime.sendMessage({"command": "assimilate", "stats": statText}, function(response) {
		console.log(response.confirmation);
	});
	document.getElementById("addBox").value = "";
	$( "#addDiv" ).hide();
	$( "#buttonsDiv" ).show();
	
}

function cancel(){
	
	console.log("cancel");
	$( "#restoreDiv" ).hide();
	$( "#addDiv" ).hide();
	console.log("hide");
	$( "#backupDiv" ).hide();
	$( "#buttonsDiv" ).show();
	
}
/* 
$( function() {
    $( "#sortable" ).sortable();
    $( "#sortable" ).disableSelection();
} ); */
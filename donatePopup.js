chrome.storage.local.get(["handCount"], function(result) {
	document.getElementById("handCount").innerHTML = result.handCount;
});

function clicked(){
	chrome.storage.local.set({"donateBtnClicked":true}, function() { //initialize settings storage
		console.log("Clicked!");
	});
	window.close();
}

document.getElementById("donateBtn").addEventListener("click", clicked);
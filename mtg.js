var module = angular.module('mtg', ['ngRoute', 'timer']);

DEBUG = true;

module.controller('main', function($scope, $filter) {
	$scope.matches = [];
	$scope.players = [{}, {}];
	var orderBy = $filter('orderBy');
	
	$scope.importFromStorage = function() {
		console.log("Importing from local storage");
		tourney = JSON.parse(localStorage.tourney);
		console.log(tourney);
		$scope.title = tourney.title;
		$scope.players = tourney.players;
		$scope.matches = tourney.matches;
		// ugly way of rebind players to respective matches.
		for(var m = 0; m < $scope.matches.length; m++)
		{
			for(var i = 0; i < $scope.players.length; i++) {
				if($scope.matches[m].players[0].id == $scope.players[i].id)
					$scope.matches[m].players[0] = $scope.players[i];
				if($scope.matches[m].players[1].id == $scope.players[i].id)
					$scope.matches[m].players[1] = $scope.players[i];	
			}
		}
		$scope.inited = true;
		$scope.updatePlayerRanks();
	};
	
	$scope.exportToStorage = function() {		
		localStorage.tourney = JSON.stringify({
			players: $scope.players,
			matches: $scope.matches,
			title: $scope.title,
			inited: $scope.inited,
		});
		console.log("Exported to storage");
	};
	
	$scope.initPlayers = function() {
		for(var p = 0; p < $scope.players.length; p++) {
			$scope.players[p].won = 
			$scope.players[p].lost = 
			$scope.players[p].draw = 0;
			$scope.players[p].rank = 1;
			$scope.players[p].id = p;
		}
	};
	
	$scope.updatePlayerRanks = function() {
		$scope.players = orderBy($scope.players, ['-won','-draw']);
		prev = $scope.players[0];
		prev.rank = 1;
		for(var i = 1; i < $scope.players.length; i++) {
			curr = $scope.players[i];
			if(curr.won == prev.won && curr.draw == prev.draw) // Not counting losses here.
			{
				curr.rank = prev.rank;
			} else {
				curr.rank = prev.rank + 1;
				prev = curr;
			}
		}
		console.log($scope.players);		
	};
	
	$scope.createMatches = function() {					
		$scope.matches = [];
		index = 0;
		for(var p = 0; p < $scope.players.length; p++) {
			var player1 = $scope.players[p];
			
			for(var p2 = p+1; p2 < $scope.players.length; p2++) {					
				
				var player2 = $scope.players[p2];
				
				var match = {
					players: [player1, player2],
					scores: [0, 0],
					status: 'queued',
					index: -1
				}
				
				
				$scope.matches.push(match);
			}
		}
		
		// Semi-Random ordering of the matches. 
		// Should be so that min n-1 players have a match in the first
		// round. This problem could be reduced to finding a Hamilton path...
		indexes = [];
		for(var i = 0; i < $scope.matches.length; i++)
			indexes.push(i);
		
		// Random shuffle. This could probably be improved in terms of efficiency.
		matches_without_index = [];
		while(indexes.length > 0) {			
			pick = Math.floor(Math.random() * indexes.length);
			ind = indexes[pick];
			matches_without_index.push(ind);
			indexes.splice(pick, 1);
		}
		
		console.log(matches_without_index);
		
		
		picked_players = [];
		for(var i = 0; i < $scope.matches.length;) {			
			var m = 0;
			for(; m < $scope.matches.length; m++) {
				var match = $scope.matches[matches_without_index[m]]; // accessing the random order.
				
				if(match.index > -1)
					continue; // already visited.
					
				if(picked_players.indexOf(match.players[0]) > -1 || picked_players.indexOf(match.players[1]) > -1)
					continue; // at least one of the players already has a matchup this round.
					
				match.index = i++;
				picked_players.push(match.players[0]);
				picked_players.push(match.players[1]);
				break;
			}
			
			if(m == $scope.matches.length) {
				picked_players = []; // new round.
			}
		}
		
		$scope.matchesLeft = $scope.matches.length;
	};
	
	$scope.init = function() {
		console.log("Init was called");
		$scope.inited = true;
		$scope.initPlayers();
		$scope.createMatches();	
		$scope.exportToStorage();			
	};
	
	$scope.matchEvaluator = function(a) {
		statusorder = ['playing','queued','ended']
		letters = ['a','b','c'];
		return letters[statusorder.indexOf(a.status)] + a.index;
	};
	
	$scope.getMatchesLeft = function() {
		var count = 0;
		for(var i = 0; i < $scope.matches.length; i++)
			if($scope.matches[i].status != 'ended')
				count++;
		return count;
	};
	
	$scope.reorderMatches = function() {
		$scope.matches = orderBy($scope.matches, $scope.matchEvaluator, false);
		$scope.exportToStorage();
	};
	
	$scope.startMatch = function(match) {
		match.status = 'playing'; 
		match.endtime = new Date().getTime() + 45*60*1000; // todo flytta till setting.
		$scope.reorderMatches();		
	};
	
	$scope.editMatch = function(match) {
		match.status = 'playing'; 
		if(match.scores[0] == match.scores[1])
		{
			match.players[0].draw -= 1;
			match.players[1].draw -= 1;
		} else if(match.scores[0] > match.scores[1]) {
			match.players[0].won -= 1;
			match.players[1].lost -= 1;
		} else {
			match.players[1].won -= 1;
			match.players[0].lost -= 1;
		}
		$scope.updatePlayerRanks();
		$scope.reorderMatches();	
	};
	
	$scope.endMatch = function(match) {
		match.status = 'ended';
		if(match.scores[0] == match.scores[1])
		{
			match.players[0].draw += 1;
			match.players[1].draw += 1;
		} else if(match.scores[0] > match.scores[1]) {
			match.players[0].won += 1;
			match.players[1].lost += 1;
		} else {
			match.players[1].won += 1;
			match.players[0].lost += 1;
		}
		
		$scope.reorderMatches();
		$scope.updatePlayerRanks();
	};
	
	$scope.reset = function() {
		$scope.matches = [];
		$scope.players = [{}, {}];
		
		$scope.inited = false;
		
		if(DEBUG) {
			$scope.players = [{name:'Herp'}, {name:'Derp'}, {name:'Merp'}];
		}
		
		$scope.exportToStorage();
	};
	
	if (localStorage.tourney) {
		$scope.importFromStorage();
	} 
});

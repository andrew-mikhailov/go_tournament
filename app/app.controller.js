(function (angular) {
  'use strict';

  angular
    .module('go_tournament')
    .controller('MainController', function ($filter, TournamentConfig) {
      var MainCtrl = this;
        
      MainCtrl.matches = [];
      MainCtrl.players = [{}, {}];
      var orderBy = $filter('orderBy');

      MainCtrl.importFromStorage = function () {
        var tourney = JSON.parse(localStorage.tourney);
        MainCtrl.title = tourney.title;
        MainCtrl.players = tourney.players;
        MainCtrl.matches = tourney.matches;
        // ugly way of rebind players to respective matches.
        for (var m = 0; m < MainCtrl.matches.length; m++) {
          for (var i = 0; i < MainCtrl.players.length; i++) {
            if (MainCtrl.matches[m].players[0].id == MainCtrl.players[i].id)
              MainCtrl.matches[m].players[0] = MainCtrl.players[i];
            if (MainCtrl.matches[m].players[1].id == MainCtrl.players[i].id)
              MainCtrl.matches[m].players[1] = MainCtrl.players[i];
          }
        }
        MainCtrl.inited = true;
        MainCtrl.updatePlayerRanks();
      };

      MainCtrl.exportToStorage = function () {
        localStorage.tourney = JSON.stringify({
          players: MainCtrl.players,
          matches: MainCtrl.matches,
          title: MainCtrl.title,
          inited: MainCtrl.inited
        });
      };

      MainCtrl.initPlayers = function () {
        for (var p = 0; p < MainCtrl.players.length; p++) {
          MainCtrl.players[p].won =
            MainCtrl.players[p].lost =
              MainCtrl.players[p].draw = 0;
                MainCtrl.players[p].points = 0;
          MainCtrl.players[p].rank = 0;
          MainCtrl.players[p].id = p;
        }
      };

      MainCtrl.updatePlayerRanks = function () {
        MainCtrl.players = orderBy(MainCtrl.players, ['-won', '-draw', '-points']);
        var prev = MainCtrl.players[0];
        prev.rank = 1;
        for (var i = 1; i < MainCtrl.players.length; i++) {
          var curr = MainCtrl.players[i];
          if (curr.won == prev.won && curr.draw == prev.draw) {
            curr.rank = prev.rank;
          } else {
            curr.rank = prev.rank + 1;
            prev = curr;
          }
        }
      };
      
      MainCtrl.disableMatch = function (status) {
        var statuses = ['queued', 'ended'];
        return statuses.indexOf(status) != -1;
      };

      MainCtrl.createMatches = function () {
        var i;

        MainCtrl.matches = [];
        for (var p = 0; p < MainCtrl.players.length; p++) {
          var player1 = MainCtrl.players[p];
          for (var p2 = p + 1; p2 < MainCtrl.players.length; p2++) {
            var player2 = MainCtrl.players[p2];

            MainCtrl.matches.push({
              players: [player1, player2],
              scores: [0, 0],
              status: 'queued',
              index: -1
            });
          }
        }

        // Semi-Random ordering of the matches.
        // Should be so that min n-1 players have a match in the first
        // round. This problem could be reduced to finding a Hamilton path...
        var indexes = [];
        for (i = 0; i < MainCtrl.matches.length; i++)
          indexes.push(i);

        // Random shuffle. This could probably be improved in terms of efficiency.
        var matches_without_index = [];
        while (indexes.length > 0) {
          var pick = Math.floor(Math.random() * indexes.length);
          var ind = indexes[pick];
          matches_without_index.push(ind);
          indexes.splice(pick, 1);
        }

        var picked_players = [];
        for (i = 0; i < MainCtrl.matches.length;) {
          var m = 0;
          for (; m < MainCtrl.matches.length; m++) {
            var match = MainCtrl.matches[matches_without_index[m]]; // accessing the random order.

            if (match.index > -1)
              continue; // already visited.

            if (picked_players.indexOf(match.players[0]) > -1 || picked_players.indexOf(match.players[1]) > -1)
              continue; // at least one of the players already has a matchup this round.

            match.index = i++;
            picked_players.push(match.players[0]);
            picked_players.push(match.players[1]);
            break;
          }

          if (m == MainCtrl.matches.length) {
            picked_players = [];
          }
        }

        MainCtrl.matchesLeft = MainCtrl.matches.length;
      };

      MainCtrl.init = function () {
        for (var i = 0; i < MainCtrl.players.length; i++) {
          if (!MainCtrl.players[i].name) {
            MainCtrl.players.splice(i, 1);
            i--;
          }
        }
        
        MainCtrl.inited = true;
        MainCtrl.initPlayers();
        MainCtrl.createMatches();
        MainCtrl.exportToStorage();
      };

      MainCtrl.matchEvaluator = function (a) {
        var statusorder = ['playing', 'queued', 'ended'];
        var letters = ['a', 'b', 'c'];
        return letters[statusorder.indexOf(a.status)] + a.index;
      };

      MainCtrl.getMatchesLeft = function () {
        var count = 0;
        for (var i = 0; i < MainCtrl.matches.length; i++)
          if (MainCtrl.matches[i].status != 'ended')
            count++;
        return count;
      };

      MainCtrl.reorderMatches = function () {
        MainCtrl.matches = orderBy(MainCtrl.matches, MainCtrl.matchEvaluator, false);
        MainCtrl.exportToStorage();
      };

      MainCtrl.startMatch = function (match) {
        match.status = 'playing';
        match.endtime = new Date().getTime() + 60 * TournamentConfig.time * 1000;
        MainCtrl.reorderMatches();
      };

      MainCtrl.editMatch = function (match) {
        match.status = 'playing';
        if (Number(match.scores[0]) > Number(match.scores[1])) {
          match.players[0].won -= 1;
          match.players[0].points -= 1 +
            (Number(match.scores[0]) - Number(match.scores[0]) % TournamentConfig.points)/TournamentConfig.points;

          match.players[1].lost -= 1;
          match.players[1].points -=
            (Number(match.scores[1]) - Number(match.scores[1]) % TournamentConfig.points)/TournamentConfig.points;
        }
        else {
          match.players[1].won -= 1;
          match.players[1].points -= 1 +
            (Number(match.scores[1]) - Number(match.scores[1]) % TournamentConfig.points)/TournamentConfig.points;

          match.players[0].lost -= 1;
          match.players[0].points -=
            (Number(match.scores[0]) - Number(match.scores[0]) % TournamentConfig.points)/TournamentConfig.points;
        }
        MainCtrl.updatePlayerRanks();
        MainCtrl.reorderMatches();
      };

      MainCtrl.endMatch = function (match) {
        match.status = 'ended';
        if (Number(match.scores[0]) > Number(match.scores[1])) {
          match.players[0].won += 1;
          match.players[0].points += 1 +
            (Number(match.scores[0]) - Number(match.scores[0]) % TournamentConfig.points)/TournamentConfig.points;

          match.players[1].lost += 1;
          match.players[1].points +=
            (Number(match.scores[1]) - Number(match.scores[1]) % TournamentConfig.points)/TournamentConfig.points;
        }
        else {
          match.players[1].won += 1;
          match.players[1].points += 1 +
            (Number(match.scores[1]) - Number(match.scores[1]) % TournamentConfig.points)/TournamentConfig.points;

          match.players[0].lost += 1;
          match.players[0].points +=
            (Number(match.scores[0]) - Number(match.scores[0]) % TournamentConfig.points)/TournamentConfig.points;
        }

        MainCtrl.reorderMatches();
        MainCtrl.updatePlayerRanks();
      };

      MainCtrl.reset = function () {
        MainCtrl.matches = [];
        MainCtrl.players = [{}, {}];
        MainCtrl.inited = false;
        MainCtrl.exportToStorage();
      };

      if (localStorage.tourney) {
        MainCtrl.importFromStorage();
      }
    });

})(angular);
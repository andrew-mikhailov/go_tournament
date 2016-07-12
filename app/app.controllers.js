(function (angular) {
  'use strict';

  angular
    .module('go_tournament')
    .controller('RegistrationFormController', function ($filter, TournamentConfig) {
      var RegistrationFormCtrl = this;
      RegistrationFormCtrl.players = TournamentConfig.players;

      RegistrationFormCtrl.init = function () {
        for (var i = 0; i < RegistrationFormCtrl.players.length; i++) {
          if (!RegistrationFormCtrl.players[i].name) {
            RegistrationFormCtrl.players.splice(i, 1);
            i--;
          }
        }

        RegistrationFormCtrl.inited = true;
        RegistrationFormCtrl.initPlayers();
        RegistrationFormCtrl.createMatches();
        RegistrationFormCtrl.exportToStorage();
      };

      RegistrationFormCtrl.initPlayers = function () {
        for (var p = 0; p < RegistrationFormCtrl.players.length; p++) {
          RegistrationFormCtrl.players[p].won =
            RegistrationFormCtrl.players[p].lost =
              RegistrationFormCtrl.players[p].draw = 0;
          RegistrationFormCtrl.players[p].points = 0;
          RegistrationFormCtrl.players[p].rank = 0;
          RegistrationFormCtrl.players[p].id = p;
        }
      };

      RegistrationFormCtrl.createMatches = function () {
        var i;

        RegistrationFormCtrl.matches = [];
        for (var p = 0; p < RegistrationFormCtrl.players.length; p++) {
          var player1 = RegistrationFormCtrl.players[p];
          for (var p2 = p + 1; p2 < RegistrationFormCtrl.players.length; p2++) {
            var player2 = RegistrationFormCtrl.players[p2];

            RegistrationFormCtrl.matches.push({
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
        for (i = 0; i < RegistrationFormCtrl.matches.length; i++)
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
        for (i = 0; i < RegistrationFormCtrl.matches.length;) {
          var m = 0;
          for (; m < RegistrationFormCtrl.matches.length; m++) {
            // Accessing the random order.
            var match = RegistrationFormCtrl.matches[matches_without_index[m]];
            // Already visited.
            if (match.index > -1)
              continue;
            // At least one of the players already has a matchup this round.
            if (picked_players.indexOf(match.players[0]) > -1 || picked_players.indexOf(match.players[1]) > -1)
              continue;

            match.index = i++;
            picked_players.push(match.players[0]);
            picked_players.push(match.players[1]);
            break;
          }

          if (m == RegistrationFormCtrl.matches.length) {
            picked_players = [];
          }
        }

        RegistrationFormCtrl.matchesLeft = RegistrationFormCtrl.matches.length;
      };

      RegistrationFormCtrl.exportToStorage = function () {
        localStorage.tourney = JSON.stringify({
          players: RegistrationFormCtrl.players,
          matches: RegistrationFormCtrl.matches,
          title: RegistrationFormCtrl.title,
          inited: RegistrationFormCtrl.inited
        });
      };

      RegistrationFormCtrl.reset = function () {
        RegistrationFormCtrl.matches = [];
        RegistrationFormCtrl.players = TournamentConfig.players;
        RegistrationFormCtrl.inited = false;
        RegistrationFormCtrl.exportToStorage();
      };
    })
    .controller('MainController', function ($filter, TournamentConfig) {
      // var MainCtrl = this;
      //
      // MainCtrl.matches = [];
      // MainCtrl.players = TournamentConfig.players;
      // var orderBy = $filter('orderBy');
      //
      // MainCtrl.importFromStorage = function () {
      //   var tourney = JSON.parse(localStorage.tourney);
      //   MainCtrl.title = tourney.title;
      //   MainCtrl.players = tourney.players;
      //   MainCtrl.matches = tourney.matches;
      //   // ugly way of rebind players to respective matches.
      //   for (var m = 0; m < MainCtrl.matches.length; m++) {
      //     for (var i = 0; i < MainCtrl.players.length; i++) {
      //       if (MainCtrl.matches[m].players[0].id == MainCtrl.players[i].id)
      //         MainCtrl.matches[m].players[0] = MainCtrl.players[i];
      //       if (MainCtrl.matches[m].players[1].id == MainCtrl.players[i].id)
      //         MainCtrl.matches[m].players[1] = MainCtrl.players[i];
      //     }
      //   }
      //   MainCtrl.inited = true;
      //   MainCtrl.updatePlayerRanks();
      // };
      //
      // MainCtrl.updatePlayerRanks = function () {
      //   MainCtrl.players = orderBy(MainCtrl.players, ['-won', '-draw', '-points']);
      //   var prev = MainCtrl.players[0];
      //   prev.rank = 1;
      //   for (var i = 1; i < MainCtrl.players.length; i++) {
      //     var curr = MainCtrl.players[i];
      //     if (curr.won == prev.won && curr.draw == prev.draw) {
      //       curr.rank = prev.rank;
      //     } else {
      //       curr.rank = prev.rank + 1;
      //       prev = curr;
      //     }
      //   }
      // };
      //
      // MainCtrl.disableMatch = function (status) {
      //   var statuses = ['queued', 'ended'];
      //   return statuses.indexOf(status) != -1;
      // };
      //
      // MainCtrl.matchEvaluator = function (a) {
      //   var letters = ['a', 'b', 'c'];
      //   return letters[['playing', 'queued', 'ended'].indexOf(a.status)] + a.index;
      // };
      //
      // MainCtrl.getMatchesLeft = function () {
      //   var count = 0;
      //   for (var i = 0; i < MainCtrl.matches.length; i++)
      //     if (MainCtrl.matches[i].status != 'ended')
      //       count++;
      //   return count;
      // };
      //
      // MainCtrl.reorderMatches = function () {
      //   MainCtrl.matches = orderBy(MainCtrl.matches, MainCtrl.matchEvaluator, false);
      //   MainCtrl.exportToStorage();
      // };
      //
      // MainCtrl.startMatch = function (match) {
      //   match.status = 'playing';
      //   match.endtime = new Date().getTime() + 60 * TournamentConfig.time * 1000;
      //   MainCtrl.reorderMatches();
      // };
      //
      // MainCtrl.editMatch = function (match) {
      //   match.status = 'playing';
      //   if (Number(match.scores[0]) > Number(match.scores[1])) {
      //     match.players[0].won -= 1;
      //     match.players[0].points -= 1 +
      //       (Number(match.scores[0]) - Number(match.scores[0]) % TournamentConfig.points)/TournamentConfig.points;
      //
      //     match.players[1].lost -= 1;
      //     match.players[1].points -=
      //       (Number(match.scores[1]) - Number(match.scores[1]) % TournamentConfig.points)/TournamentConfig.points;
      //   }
      //   else {
      //     match.players[1].won -= 1;
      //     match.players[1].points -= 1 +
      //       (Number(match.scores[1]) - Number(match.scores[1]) % TournamentConfig.points)/TournamentConfig.points;
      //
      //     match.players[0].lost -= 1;
      //     match.players[0].points -=
      //       (Number(match.scores[0]) - Number(match.scores[0]) % TournamentConfig.points)/TournamentConfig.points;
      //   }
      //   MainCtrl.updatePlayerRanks();
      //   MainCtrl.reorderMatches();
      // };
      //
      // MainCtrl.endMatch = function (match) {
      //   match.status = 'ended';
      //   if (Number(match.scores[0]) > Number(match.scores[1])) {
      //     match.players[0].won += 1;
      //     match.players[0].points += 1 +
      //       (Number(match.scores[0]) - Number(match.scores[0]) % TournamentConfig.points)/TournamentConfig.points;
      //
      //     match.players[1].lost += 1;
      //     match.players[1].points +=
      //       (Number(match.scores[1]) - Number(match.scores[1]) % TournamentConfig.points)/TournamentConfig.points;
      //   }
      //   else {
      //     match.players[1].won += 1;
      //     match.players[1].points += 1 +
      //       (Number(match.scores[1]) - Number(match.scores[1]) % TournamentConfig.points)/TournamentConfig.points;
      //
      //     match.players[0].lost += 1;
      //     match.players[0].points +=
      //       (Number(match.scores[0]) - Number(match.scores[0]) % TournamentConfig.points)/TournamentConfig.points;
      //   }
      //
      //   MainCtrl.reorderMatches();
      //   MainCtrl.updatePlayerRanks();
      // };
      //
      // if (localStorage.tourney) {
      //   MainCtrl.importFromStorage();
      // }
    });

})(angular);
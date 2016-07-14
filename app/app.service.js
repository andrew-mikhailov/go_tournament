(function (angular) {
  'use strict';

  angular
    .module('go_tournament')
    .constant('TournamentConfig', {
      'points': 25,
      'time': 45,
      'title': 'Some Tournament',
      'players': [
        {name: 'larionov.a@i20.biz'},
        {name: 'kovalevich.a@i20.biz'},
        {name: 'isay.r@i20.biz'},
        {name: 'voinov.a@i20.biz'},
        {name: 'semenov.e@i20.biz'},
        {name: 'mikhailov.a@i20.biz'},
        {name: 'shlyapkin.g@i20.biz'},
        {name: 'fantalin.a@devicement.com'},
        {name: 'gulya.i@devicement.com'}
      ]
    })
    .constant('FIREBASE_CONFIG', {
        apiKey: "AIzaSyDKoTHp5IgWsCBUpWS7Nfp7kG2E99P7zzE",
        authDomain: "go-tournament-1b80b.firebaseapp.com",
        databaseURL: "https://go-tournament-1b80b.firebaseio.com",
        storageBucket: "go-tournament-1b80b.appspot.com"
      }
    )
    .factory('tournamentsService', function (FIREBASE_CONFIG) {
      firebase.initializeApp(FIREBASE_CONFIG);

      return firebase.database();
    });

})(angular);


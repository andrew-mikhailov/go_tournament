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
    .constant('MONGOLAB_CONFIG', {
        API_KEY: '--O9QFZaHymh87TkAK7IrlYYwL4sRIYa',
        DB_NAME: 'go_tournament'
      }
    )
    .factory('tournamentsService', function ($mongolabResourceHttp) {
      return $mongolabResourceHttp('tournaments');
    });

})(angular);


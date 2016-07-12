
(function (angular) {
  'use strict';

  angular
    .module('go_tournament')
    .constant('TournamentConfig', {
      'points': 25,
      'time': 45,
      'players': [
        {name: 'mikhailov.a@i20.biz'},
        {name: 'isay.r@i20.biz'},
        {name: 'larionov.a@i20.biz'},
        {name: 'kovalevich.a@i20.biz'},
        {name: 'voinov.a@i20.biz'},
        {name: 'semenov.e@i20.biz'},
        {name: 'shlyapkin.g@i20.biz'}
      ]
    })

})(angular);


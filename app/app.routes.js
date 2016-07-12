(function (angular) {
  'use strict';

  angular
    .module('go_tournament')
    .config(['$compileProvider', function ($compileProvider) {
      $compileProvider.debugInfoEnabled(false);
    }])
    .config(function($stateProvider, $urlRouterProvider, $locationProvider) {
      $urlRouterProvider.otherwise("/registration");

      $stateProvider
        .state('registration', {
          url: '/registration',
          templateUrl: 'partials/registration.html',
          controller: 'RegistrationFormController',
          controllerAs: 'RegistrationFormCtrl'
        })
        .state('tournament', {
          url: '/tournament',
          templateUrl: 'partials/tournament.html',
          controller: 'TournamentController',
          controllerAs: 'TournamentCtrl'
        })
    })

})(angular);
(function (angular) {
  'use strict';

  angular
    .module('go_tournament', [
      'timer',
      'mongolabResourceHttp',
      'ui.router',
      'ui.gravatar',
      'ngSanitize'
    ])
    .config(['$compileProvider', function ($compileProvider) {
      $compileProvider.debugInfoEnabled(false);
    }]);

})(angular);
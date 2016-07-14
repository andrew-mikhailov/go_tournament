(function (angular) {
  'use strict';

  angular
    .module('go_tournament', [
      'timer',
      'ui.router',
      'ui.gravatar',
      'ngSanitize'
    ])
    .config(['$compileProvider', function ($compileProvider) {
      $compileProvider.debugInfoEnabled(false);
    }])
    .run(['$rootScope', function ($rootScope) {
      $rootScope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
          if (fn && (typeof(fn) === 'function')) {
            fn();
          }
        } else {
          this.$apply(fn);
        }
      };
    }]);

})(angular);

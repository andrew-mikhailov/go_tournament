(function (angular) {
  'use strict';

  angular
    .module('timer')
    .directive('timer', ['$interval', 'dateFilter', function($interval, dateFilter) {

    return {
      restrict: 'E',
      template: '<span ng-class="{ blink: done }">{{ timeleft }}</span>',
      scope: {
        endtime: '=endtime'
      },
      link: function(scope, element, attr){
        var timeoutId = $interval(function() {
          // update DOM
          updateTime();
        }, 1000);

        function updateTime() {
          var diff = scope.endtime - new Date().getTime();

          if(diff <= 0) {
            $interval.cancel(timeoutId);
            diff = 0;
            scope.done = true;
          }
          scope.timeleft = dateFilter(diff, 'mm:ss');
        }
      }
    };
  }]);
})(angular);

var imtApp = angular.module("imtApp", ["ngRoute","ui.bootstrap"]);

//Route providers
imtApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/home', {
        templateUrl: 'templates/home.html',
        controller: 'HomeController'
      }).
      when('/inventory', {
        templateUrl: 'templates/inventory.html',
        controller: 'InventoryController'
      }).
      when('/myloans', {
        templateUrl: 'templates/loans.html',
        controller: 'LoanController'
      }).
      when('/requests', {
        templateUrl: 'templates/request.html',
        controller: 'RequestsController'
      }).
      when('/admin', {
        templateUrl: 'templates/admin.html',
        controller: 'AdminController'
      })
      .when("/error",{
            templateUrl: 'templates/error.html',
            controller: 'ErrorController'
      }).
      otherwise({
        redirectTo: '/home'
      });
  }]);
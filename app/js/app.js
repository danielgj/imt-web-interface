var imtApp = angular.module("imtApp", ["ngRoute","ui.bootstrap"]);

var url_base_api = "put_url_to_your_api_here";

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
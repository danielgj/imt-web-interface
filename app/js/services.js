imtApp

.service('configService',function() {
        var config = {};
    
        config.url_base_api = 'your_api_url_here';        
        return config;
})
    
.service('MenuService', function($http,$rootScope, Utils) {

   this.menu = function() {

       if(Utils.isUndefinedOrNull($rootScope.user)) {
            $rootScope.user = localStorage.getItem("user");
            $rootScope.username = localStorage.getItem("username");
            $rootScope.token = localStorage.getItem("token");
            $rootScope.role = localStorage.getItem("role");            
       }


     if(Utils.isUndefinedOrNull($rootScope.user)) {
         return   [];
     } else if($rootScope.role=='user'){
         return   [
            {"label" : "LOGOUT",
            "url" : "#logout"},
            {"label" : "MY LOANS",
            "url" : "#myloans"},
            {"label" : "INVENTORY",
            "url" : "#inventory"},
            {"label" : "HOME",
            "url" : "#home"}
         ];
     } else if($rootScope.role=='approver'){
         return   [
           {"label" : "LOGOUT",
           "url" : "#logout"},
           {"label" : "REQUESTS",
           "url" : "#requests"},
           {"label" : "MY LOANS",
           "url" : "#myloans"},
           {"label" : "INVENTORY",
           "url" : "#inventory"},
           {"label" : "HOME",
           "url" : "#home"}
         ];
     } else if($rootScope.role=='admin'){
         return   [
            {"label" : "LOGOUT",
            "url" : "#logout"},
            {"label" : "ADMIN",
            "url" : "#admin"},
            {"label" : "REQUESTS",
           "url" : "#requests"},
           {"label" : "MY LOANS",
           "url" : "#myloans"},
           {"label" : "INVENTORY",
           "url" : "#inventory"},
           {"label" : "HOME",
            "url" : "#home"}
         ];
     }

  }})


.service('dataService', ['$rootScope', '$http', 'configService', function($rootScope, $http, configService){
        
        return {
            async: function(object_url) {
            
                return $http({
                  method: 'GET',
                  url: configService.url_api + object_url,
                  headers: {
                        "Accept": "application/json;charset=utf-8",
                        "Authorization": "bearer " + $rootScope.token
                  },
                  dataType:"json"
            }).then(function(obj) {                
                return {
                        'status': true,
                        'data': obj.data                                           
                       };
            }).catch(function(err) {                
                    return {
                        'status': false,
                        'data': err
                    };                                
            });
          }
        }
        
}])


.factory('Utils', function() {
  var service = {
     isUndefinedOrNull: function(obj) {
         return !angular.isDefined(obj) || obj===null;
     }
  }

  return service;
});

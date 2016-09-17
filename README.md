# IMT Web Interface

This Angular + Boostrap Web Application has been developed as a Capstone Project for Coursera's Full Stack Development Certification Track.

It works in conjuction with a [REST API](https://github.com/danielgj/imt-rest-api) connected to a Mongo DB Database. An [Ionic mobile app](https://github.com/danielgj/imt-ionic-app) is also provided.

This project is generated with [yo angular generator](https://github.com/yeoman/generator-angular)
version 0.0.2.

## Functionallity

* Every mobile app development company handles many devices for development and testing purposes.
* When development teams grow, managing which devices are in used and who has loan a particular device gets more and more difficult.
* Inventory Management Tool (IMT) will allow inventory and loans management giving real time information on which devices are free or in use and will support searching for available devices based on its characteristics.
* IMT will implement a workflow for the loan process that determine the approvals needed to request or to finish a loan of one particular item.

## Deployment and Testing

For the app to work, API URL must be set in file app/js/services.js:

```javascript
.service('configService',function() {
        var config = {};
        config.url_base_api = 'your_api_url_here';        
        return config;
})
```

For deployment, just serve app/ folder on any web server.

A node web server is provided for testing purposes. To run it just run `node server` on any Node.js environment.

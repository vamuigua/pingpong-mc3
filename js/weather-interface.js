var apiKey = require('./../.env').apiKey;
var Weather = require('./../js/weather.js').weatherModule;

//The then() method of a promise is called when a promise enters the fulfilled state
//The fail() method is called when a promise enters the rejected state

$(document).ready(function() {
  var currentWeatherObject = new Weather();
  $('#weatherLocation').click(function() {
    var city = $('#location').val();
    $('#location').val("");
    currentWeatherObject.getWeather(city);
  });
});

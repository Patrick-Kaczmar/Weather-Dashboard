// global variabls needed for functions
var ul = $("#ul")
var searchBtn = $("#searchBtn")
var apiKey = "17f7ddc18df22bcc249395572a4c7b7c"
var userInput = $("#userInput")
var currentDate = new Date()
var cityHistory = []

// displays the last serched city from local storage
renderCities()

// function including multiple ajax searches 
var ajaxSearch = function (event) {
    // if the function is triggered by a button click, use user input value from search bar
    if (event.target.matches("button")) {
        var selectorValue = userInput.val()
        // if function is triggered by clicking an item with the list-group-item class, use the text content of the target
    } else if (event.target.matches(".list-group-item")) {
        selectorValue = event.target.textContent
    }

    // url built from the user input of a specific city
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + selectorValue + "&appid=" + apiKey

    console.log(selectorValue);
    console.log(queryURL);

    // ajax request of the searched city to get the lat. and lon. location of the city for the next ajax request
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        // saves the searched city and turns it into a list item for the sidebar
        function saveCity() {
            if (response && event.target.matches("button")) {
                ul.prepend(`<li class="list-group-item">${selectorValue}</li>`)
            }
        }

        saveCity();

        // builds the second url with the coordinates from the first ajax response
        var uvURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + response.coord.lat + "&lon=" + response.coord.lon + "&appid=" + apiKey
        // gets the current weather icon from first response
        var curIcon = "http://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png"

        // second ajax request to get the UV index of the searched city
        $.ajax({
            url: uvURL,
            method: "GET"
        }).then(function (uvResponse) {
            console.log(uvResponse)
            // converts kelvin to fahrenheit
            var fahrenheit = (response.main.temp - 273.15) * 1.80 + 32
            // cuts the number of fahrenheit to the first decimal place
            var temp = fahrenheit.toFixed(1)

            // displays the information from the two responses to the current weather dashboard
            $("#cityName").html(`${response.name} ${currentDate.toLocaleDateString()} <img src="${curIcon}"></img>`)
            $("#curTemp").html(`Temp: ${temp}&deg;F`)
            $("#curHumid").html(`Humidity: ${uvResponse.current.humidity} %`)
            $("#curWind").html(`Wind Speed: ${response.wind.speed} MPH`)
            var currentUV = $("#curUV").html(`UV Index: ${uvResponse.current.uvi}`)

            // changes the class of the uv index to give it a color representing its severity
            if (uvResponse.current.uvi < 3) {
                currentUV.attr("class", "green")
            } else if (uvResponse.current.uvi >= 3 && uvResponse.current.uvi < 6) {
                currentUV.attr("class", "yellow")
            } else if (uvResponse.current.uvi >= 6 && uvResponse.current.uvi < 8) {
                currentUV.attr("class", "orange")
            } else {
                currentUV.attr("class", "red")
            }

            // url to get the five day forcast api
            var fiveDay = "https://api.openweathermap.org/data/2.5/forecast?q=" + selectorValue + "&appid=" + apiKey

            $.ajax({
                url: fiveDay,
                method: "GET"
            }).then(function (forcastResponse) {
                console.log(forcastResponse)

                // displays the information from the forcast api response in the five card boxes below the dashboard
                $("#date1").html(`${forcastResponse.list[3].dt_txt}`.split(" ", 1))
                $("#date2").html(`${forcastResponse.list[11].dt_txt}`.split(" ", 1))
                $("#date3").html(`${forcastResponse.list[19].dt_txt}`.split(" ", 1))
                $("#date4").html(`${forcastResponse.list[27].dt_txt}`.split(" ", 1))
                $("#date5").html(`${forcastResponse.list[35].dt_txt}`.split(" ", 1))

                $("#icon1").html(`<img src="http://openweathermap.org/img/wn/${forcastResponse.list[3].weather[0].icon}@2x.png"</img>`)
                $("#icon2").html(`<img src="http://openweathermap.org/img/wn/${forcastResponse.list[11].weather[0].icon}@2x.png"</img>`)
                $("#icon3").html(`<img src="http://openweathermap.org/img/wn/${forcastResponse.list[19].weather[0].icon}@2x.png"</img>`)
                $("#icon4").html(`<img src="http://openweathermap.org/img/wn/${forcastResponse.list[27].weather[0].icon}@2x.png"</img>`)
                $("#icon5").html(`<img src="http://openweathermap.org/img/wn/${forcastResponse.list[35].weather[0].icon}@2x.png"</img>`)

                $("#temp1").html(`temp: ${((forcastResponse.list[3].main.temp - 273.15) * 1.80 + 32).toFixed(1)}&deg;F`)
                $("#temp2").html(`temp: ${((forcastResponse.list[11].main.temp - 273.15) * 1.80 + 32).toFixed(1)}&deg;F`)
                $("#temp3").html(`temp: ${((forcastResponse.list[19].main.temp - 273.15) * 1.80 + 32).toFixed(1)}&deg;F`)
                $("#temp4").html(`temp: ${((forcastResponse.list[27].main.temp - 273.15) * 1.80 + 32).toFixed(1)}&deg;F`)
                $("#temp5").html(`temp: ${((forcastResponse.list[35].main.temp - 273.15) * 1.80 + 32).toFixed(1)}&deg;F`)

                $("#humidity1").html(`humidity: ${forcastResponse.list[3].main.humidity} %`)
                $("#humidity2").html(`humidity: ${forcastResponse.list[11].main.humidity} %`)
                $("#humidity3").html(`humidity: ${forcastResponse.list[19].main.humidity} %`)
                $("#humidity4").html(`humidity: ${forcastResponse.list[27].main.humidity} %`)
                $("#humidity5").html(`humidity: ${forcastResponse.list[35].main.humidity} %`)

                // checks to see if the current city is already inside the city history array, and if its not we push it into the array
                if (cityHistory.indexOf(selectorValue) == -1) {
                    cityHistory.push(selectorValue)
                }
                console.log(cityHistory)
                // saves the new city history array in local storage 
                localStorage.setItem("cityHistory", JSON.stringify(cityHistory))
            })
        })
    })
};


// function that only runs once when the page first loads, checks to see if there is anything in the local storage array, and if there is, get the last value pushed into it and display that city
function renderCities() {
    if (localStorage.getItem("cityHistory") !== null) {
        cityHistory = JSON.parse(localStorage.getItem("cityHistory"))
        for (i = 0; i < cityHistory.length; i++) {
            ul.prepend(`<li class="list-group-item">${cityHistory[i]}</li>`)
        }
        lastSearch()
        function lastSearch() {
            var selectorValue = cityHistory[cityHistory.length - 1]

            var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + selectorValue + "&appid=" + apiKey

            console.log(selectorValue);
            console.log(queryURL);
            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function (response) {
                console.log(response);

                var uvURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + response.coord.lat + "&lon=" + response.coord.lon + "&appid=" + apiKey
                var curIcon = "http://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png"
                $.ajax({
                    url: uvURL,
                    method: "GET"
                }).then(function (uvResponse) {
                    console.log(uvResponse)
                    // converts kelvin to fahrenheit
                    var fahrenheit = (response.main.temp - 273.15) * 1.80 + 32
                    // cuts the number of fahrenheit to the first decimal place
                    var temp = fahrenheit.toFixed(1)

                    $("#cityName").html(`${response.name} ${currentDate.toLocaleDateString()} <img src="${curIcon}"></img>`)
                    $("#curTemp").html(`Temp: ${temp}&deg;F`)
                    $("#curHumid").html(`Humidity: ${uvResponse.current.humidity} %`)
                    $("#curWind").html(`Wind Speed: ${response.wind.speed} MPH`)
                    var currentUV = $("#curUV").html(`UV Index: ${uvResponse.current.uvi}`)

                    if (uvResponse.current.uvi < 3) {
                        currentUV.attr("class", "green")
                    } else if (uvResponse.current.uvi >= 3 && uvResponse.current.uvi < 6) {
                        currentUV.attr("class", "yellow")
                    } else if (uvResponse.current.uvi >= 6 && uvResponse.current.uvi < 8) {
                        currentUV.attr("class", "orange")
                    } else {
                        currentUV.attr("class", "red")
                    }

                    var fiveDay = "https://api.openweathermap.org/data/2.5/forecast?q=" + selectorValue + "&appid=" + apiKey

                    $.ajax({
                        url: fiveDay,
                        method: "GET"
                    }).then(function (forcastResponse) {
                        console.log(forcastResponse)

                        $("#date1").html(`${forcastResponse.list[3].dt_txt}`.split(" ", 1))
                        $("#date2").html(`${forcastResponse.list[11].dt_txt}`.split(" ", 1))
                        $("#date3").html(`${forcastResponse.list[19].dt_txt}`.split(" ", 1))
                        $("#date4").html(`${forcastResponse.list[27].dt_txt}`.split(" ", 1))
                        $("#date5").html(`${forcastResponse.list[35].dt_txt}`.split(" ", 1))

                        $("#icon1").html(`<img src="http://openweathermap.org/img/wn/${forcastResponse.list[3].weather[0].icon}@2x.png"</img>`)
                        $("#icon2").html(`<img src="http://openweathermap.org/img/wn/${forcastResponse.list[11].weather[0].icon}@2x.png"</img>`)
                        $("#icon3").html(`<img src="http://openweathermap.org/img/wn/${forcastResponse.list[19].weather[0].icon}@2x.png"</img>`)
                        $("#icon4").html(`<img src="http://openweathermap.org/img/wn/${forcastResponse.list[27].weather[0].icon}@2x.png"</img>`)
                        $("#icon5").html(`<img src="http://openweathermap.org/img/wn/${forcastResponse.list[35].weather[0].icon}@2x.png"</img>`)

                        $("#temp1").html(`temp: ${((forcastResponse.list[3].main.temp - 273.15) * 1.80 + 32).toFixed(1)}&deg;F`)
                        $("#temp2").html(`temp: ${((forcastResponse.list[11].main.temp - 273.15) * 1.80 + 32).toFixed(1)}&deg;F`)
                        $("#temp3").html(`temp: ${((forcastResponse.list[19].main.temp - 273.15) * 1.80 + 32).toFixed(1)}&deg;F`)
                        $("#temp4").html(`temp: ${((forcastResponse.list[27].main.temp - 273.15) * 1.80 + 32).toFixed(1)}&deg;F`)
                        $("#temp5").html(`temp: ${((forcastResponse.list[35].main.temp - 273.15) * 1.80 + 32).toFixed(1)}&deg;F`)

                        $("#humidity1").html(`humidity: ${forcastResponse.list[3].main.humidity} %`)
                        $("#humidity2").html(`humidity: ${forcastResponse.list[11].main.humidity} %`)
                        $("#humidity3").html(`humidity: ${forcastResponse.list[19].main.humidity} %`)
                        $("#humidity4").html(`humidity: ${forcastResponse.list[27].main.humidity} %`)
                        $("#humidity5").html(`humidity: ${forcastResponse.list[35].main.humidity} %`)

                        if (cityHistory.indexOf(selectorValue) == -1) {
                            cityHistory.push(selectorValue)
                        }
                        console.log(cityHistory)
                        localStorage.setItem("cityHistory", JSON.stringify(cityHistory))
                    })
                })
            })
        }
    }
}
// click handler for the search button
searchBtn.on("click", ajaxSearch)
// click handler for the list group item class
$(document).on('click', '.list-group-item', ajaxSearch)
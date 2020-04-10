// logFile.appendFile(
//   "log.txt",
//   JSON.stringify(response.data),
//   function (err) {
//     if (err) throw err;
//     console.log("Saved!");
//   }
// );
require("dotenv").config();
var Spotify = require("node-spotify-api");
var moment = require("moment");
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);
var doThis = process.argv[2];
var searchThis = process.argv[3];
var outputLimit = 5;
var logFile = require("fs");
const OMDB = require("axios").create({
  baseURL: "https://www.omdbapi.com/",
  timeout: 5000,
});
const bandsinTown = require("axios").create({
  baseURL: "https://rest.bandsintown.com/",
  timeout: 5000,
});

if(doThis === "do-what-it-says") {
// Read the file and print its contents.
var random = require("fs"),
  filename = "random.txt";
  try{
      const data = random.readFileSync(filename, 'utf8')
    //   console.log("OK: " + filename);
    //   console.log(data);
      var fileInput = data.split(",")
      doThis = fileInput[0]
      searchThis = fileInput[1]    
  }
  catch (err) {
      console.error(err)
  }
};

switch (doThis) {
  case "spotify-this-song":
    var songQuery = "";
    if (typeof searchThis === "string") {
      songQuery = searchThis;
    } else {
      songQuery = "The Sign";
    }
    spotify.search(
      { type: "track", query: songQuery, limit: outputLimit },
      function (err, data) {
        if (err) {
          return console.log("Error occurred: " + err);
        }
        const spotifyData = data["tracks"]["items"];
        for (var i = 0; i < spotifyData.length; i++) {
          var artistarray = spotifyData[i]["album"]["artists"];
          var artist = [];
          var album = spotifyData[i]["album"]["name"];
          var previewURL = spotifyData[i]["preview_url"];
          var song = spotifyData[i]["name"];
          for (var j = 0; j < artistarray.length; j++) {
            artist.push(artistarray[j]["name"]);
          }
          artist = artist.join(", ");
          console.log(
            "artist: ",
            artist,
            "\nalbum: ",
            album,
            "\npreviewURL: ",
            previewURL,
            "\nsong: ",
            song
          );
          console.log("\n-------------\n");
        }
      }
    );
    break;
  case "movie-this":
    var movieQuery = "";
    var extraconsole = false
    if (typeof searchThis === "string") {
      movieQuery = searchThis;
    } else {
      movieQuery = "Mr. Nobody";
      extraconsole = true
    }
    OMDB.get("?apikey=trilogy&t=" + movieQuery)
      .then(function (response) {
        const omdbData = response["data"];
        var title = omdbData["Title"];
        var year = omdbData["Year"];
        var imdbRating = omdbData["imdbRating"];
        var rottenTomatoes = omdbData["Ratings"][1]["Value"];
        var country = omdbData["Country"];
        var language = omdbData["Language"];
        var plot = omdbData["Plot"];
        var actors = omdbData["Actors"];
        // handle success
        // console.log(response.data);
        console.log(
          "title: ",
          title,
          "\nyear: ",
          year,
          "\nIMDB rating: ",
          imdbRating,
          "\nrotten tomatoes rating: ",
          rottenTomatoes,
          "\ncountry: ",
          country,
          "\nlanguage: ",
          language,
          "\nplot: ",
          plot,
          "\nactors: ",
          actors
        );
        if(extraconsole === true) {
            console.log(
                "\nIf you haven't watched Mr. Nobody, then you should: <http://www.imdb.com/title/tt0485947/>"
              );
              console.log("It's on Netflix!");
        }
        console.log("\n-------------\n");
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
    //   .finally(function () {
    //     // always executed
    //   });
    break;
  case "concert-this":
    bandsinTown
      .get(
        "artists/" + searchThis + "/events?app_id=codingbootcamp&date=upcoming"
      )
      .then(function (response) {
        const concertData = response["data"];
        for(var i = 0; i < ((concertData.lenth < outputLimit) ? concertData.lenth : outputLimit); i++) {
        var band = concertData[i]["lineup"].join(", ");
        var venue = concertData[i]["venue"]["name"];
        var location =
          concertData[i]["venue"]["city"] + ", " + concertData[i]["venue"]["country"];
        var date = moment(concertData[i]["datetime"]).format("MM/DD/YYYY");
        // console.log(response.data);
        console.log(
          "band: ",
          band,
          "\nvenue: ",
          venue,
          "\nlocation: ",
          location,
          "\ndate: ",
          date
        );
        console.log("\n-------------\n");
        }
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
    //   .finally(function () {
    //     // always executed
    //   });
    break;
}

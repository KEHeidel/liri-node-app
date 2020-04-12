require("dotenv").config();
// variables
var Spotify = require("node-spotify-api");
var moment = require("moment");
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);
var doThis = process.argv[2];
var searchThis = process.argv[3];
var outputLimit = 5;
var logFile = require("fs");
var logFileName = "log.txt"
const OMDB = require("axios").create({
  baseURL: "https://www.omdbapi.com/",
  timeout: 5000,
});
const bandsinTown = require("axios").create({
  baseURL: "https://rest.bandsintown.com/",
  timeout: 5000,
});

function logging(fileOutput) {
  logFile.appendFileSync(
    logFileName,
    fileOutput,
    function (err) {
    if (err) throw err;
    // console.log("Saved!");
  }
  );
};

// statement that will run if 'do-what-it-says' is printed in argument 2 in terminal. This statement will read the random.txt file
// and perform one of the switch cases based on what is in the txt file.
if(doThis === "do-what-it-says") {
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

// switch case
switch (doThis) {
  // case that will run the spotify API
  case "spotify-this-song":
    var songQuery = "";
    // if no song is listed in argument 3 then the query will run for 'The Sign' and return the song info in the console.
    if (typeof searchThis === "string") {
      songQuery = searchThis;
    } else {
      songQuery = "The Sign";
    }
    // if a song is listed in arguement 3 then the query will run to get info based on that song.
    // once the query is completed the song info will be printed to the console.
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
          var output = "artist: " + artist +
          "\nalbum: " + album +
          "\npreviewURL: " + previewURL +
          "\nsong: " + song +
          "\n\n-------------\n"
          console.log(output);
          logging(output + "\n");
        }
      }
    );
    break;
    // if no movie is listed in argument 3 then the query will run for 'Mr. Nobody' and return the movie info in the console.
  case "movie-this":
    var movieQuery = "";
    var extraconsole = false
    if (typeof searchThis === "string") {
      movieQuery = searchThis;
    } else {
      movieQuery = "Mr. Nobody";
      extraconsole = true
    }
    // if a movie is listed in arguement 3 then the query will run to get info based on that movie.
    // once the query is completed the movie info will be printed to the console.
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
        var output = "title: " + title +
          "\nyear: " + year +
          "\nIMDB rating: " + imdbRating +
          "\nrotten tomatoes rating: " + rottenTomatoes +
          "\ncountry: " + country +
          "\nlanguage: " + language +
          "\nplot: " + plot +
          "\nactors: " + actors;
          if(extraconsole === true) {
              output +=
                  "\n\nIf you haven't watched Mr. Nobody, then you should: <http://www.imdb.com/title/tt0485947/>"
              output += "\nIt's on Netflix!";
          }
          output += "\n\n-------------\n"
        console.log(output);
        logging(output + "\n");
      })
      .catch(function (error) {
        console.log(error);
      });
    break;
  case "concert-this":
    // if a band is listed in arguement 3 then the query will run to get info based on that band and the upcoming concert.
    // once the query is completed the bands concert info will be printed to the console.
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
        var output = "band: " + band +
        "\nvenue: " + venue +
        "\nlocation: " + location +
        "\ndate: " + date +
        "\n\n-------------\n"
        console.log(output);
        logging(output + "\n");
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    break;
    default:
      console.log("Usage: node liri.js {instruction} {'query'}");
      console.log("Possible instructions: ");
      console.log("     spotify-this-song - search spotify API for song title");
      console.log("     movie-this - search OMDB API for movie title");
      console.log("     concert-this - search Bands in Town API for concert information for a band/artist");
      console.log("     do-what-it-says - reads random.txt and follows instructions. No query input accepted");
      console.log("Query: - song title, movie title, or band/artist in quotations");
      console.log("ex: node liri.js spotify-this-song 'Hey Jude'");
      break;
}

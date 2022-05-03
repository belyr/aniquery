/**
 * Queries the AniList API
 * @param {aniid} the ID of the anime
 * @customfunction
 * @return an HTTPResponse string and send to next function
 */

function aniquery(aniid) {
  // Define query as multi-line string
  var query =`
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      idMal
      coverImage{
        extraLarge
      }
      title {
        english
        romaji
      }
      season
      seasonYear
      genres
      episodes
      duration
      description
      relations {
    	  edges {
    	    id
          relationType
    	  }
    	}
    }
  }
  `;
  
  // Define variable used in query
  var variables = { 
    id: aniid
  };
 
  // Define config for query
  const url = "https://graphql.anilist.co";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"},
    payload: JSON.stringify({
      query:query,
      variables:variables
    })
  };

  // Make the API request
  var response = UrlFetchApp.fetch(url, options);
  
  Logger.log(response)

// Return API request as HTTP Response and send to next function
return displayAniData(response);
}  
 
/** 
 * Function to convert response to JSON and convert to array
 * @param {response} response passed through from earlier function
 * @return the parsed array from the query
 */
function displayAniData(response) {
  
  // Parse response as JSON
  var json = response.getContentText();
  var output = JSON.parse(json);
  
  // Create array from data
  var array2 = Object.entries(output.data.Media);
 
  // Reformat title into array
  var arraytitle = Object.entries(output.data.Media.title);
  if (arraytitle[0][1] == null) {
    var titletext = arraytitle[1][1]
  } else {
    if (arraytitle[0][1].toUpperCase() == arraytitle[1][1].toUpperCase()) {
      var titletext = arraytitle[0][1]
    } else {
      var titletext = `${arraytitle[0][1]}\n(${arraytitle[1][1]})`
    }
  } 
  var titlearray = array2[2];
  titlearray.splice(1,1, titletext);
  array2.splice(2,1, titlearray);
  
  // Reformat cover image into array
  var arrayimage = Object.entries(output.data.Media.coverImage);
  var imagetext = arrayimage[0][1];
  var imagearray = array2[1];
  imagearray.splice(1,1, imagetext);
  array2.splice(1,1, imagearray);

  // Reformat genres into array
  var arraygenres = output.data.Media.genres;
  var genrestext = `${arraygenres.join(' | ')}`;
  var genresarray = array2[5];
  genresarray.splice(1,1, genrestext);
  array2.splice(5,1, genresarray);

  // Reformat relations into array as boolean
  var arrayrelations = JSON.stringify(output.data.Media.relations.edges)
  var hasPrequel = arrayrelations.includes("PREQUEL")
  var hasSequel = arrayrelations.includes("SEQUEL")
  var hasSpinOff = arrayrelations.includes("SPIN_OFF")
  var hasSideStory = arrayrelations.includes("SIDE_STORY")
  var hasAlternative =  arrayrelations.includes("ALTERNATIVE")
  if (hasPrequel == true || hasSequel == true) {
    var relationstext = "Has sequel or prequel."
  } else {
    if (hasSpinOff == true || hasSideStory == true|| hasAlternative == true) {
      var relationstext = "Has alternate media."
    } else {
      var relationstext = "No other media."
    }
  }
  var relationsarray = array2[9]
  relationsarray.splice(1,1, relationstext)
  array2.splice(9,1, relationsarray)
  
  Logger.log(array2);
  
// Return array with fields formatted to fit
return transpose(array2);
}

/**
 * Function to transpose array
 */
function transpose(a) {
    return Object.keys(a[0]).map(function(c) {
        return a.map(function(r) { return r[c]; });
    });
};

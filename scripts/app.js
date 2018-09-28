// Boat Rocker Media - Pokemon Challenge
// James MacDonald
// started: 1:15pm Sept 28th 2018
// functionality complete: 7:00 pm

const pokemon = {};
pokemon.urlString = "https://pokeapi.co/api/v2/";

pokemon.playerPoke = {};
pokemon.enemyPoke = {};
pokemon.score = 0;

// generate a random pokemon to display
//gives users an option if they dont know what to choose
//limiting results to numbered pokemon, not including mega evolutions,
// if a pokemon has multiple forms, the first result will be chosen
// api does not include data on pokemon 803-807 and thus are not included
pokemon.getRandomPokemon = () => {
    $(".playerPokemon .randomPokemon").on("click", function(){
        $.ajax({
            url: pokemon.urlString + "pokemon/",
            method: "GET",
            dataType: "json"

        }).then((res) => {
            let resultPoke = Math.floor(Math.random() * 801);
            pokemon.findPokemon(res.results[resultPoke].name, ".playerPokemon");

        });
    })

    $(".enemyPokemon .randomPokemon").on("click", function () {
        $.ajax({
            url: pokemon.urlString + "pokemon/",
            method: "GET",
            dataType: "json"

        }).then((res) => {
            let resultPoke = Math.floor(Math.random() * 801);
            pokemon.findPokemon(res.results[resultPoke].name, ".enemyPokemon");

        });
    })
    
}
pokemon.searchPokemon = () => {
    // pass search term into ajax call, keeping what section the information must be displayed in
    $(".playerPokemon .findPokemon").on("click", function () {
        let userString = ($(".playerPokemon .pokemonSearch").val()).toLowerCase();
        if(userString !== ""){
            pokemon.findPokemon(userString, ".playerPokemon");
        }
        else {
            alert("Please enter a pokemon name or number");
        }
    })
    $(".enemyPokemon .findPokemon").on("click", function () {
        let userString = ($(".enemyPokemon .pokemonSearch").val()).toLowerCase();
        if (userString !== "") {
            pokemon.findPokemon(userString, ".enemyPokemon");
        }
        else {
            alert("Please enter a pokemon name or number");
        }
    })
}

pokemon.findPokemon = (searchTerm, section) => {
        $.ajax({
            url: `${pokemon.urlString}pokemon/${searchTerm}/`,
            method: "GET",
            dataType: "json"

            //alert user if the pokemon cannot be found in the database
        }).fail(() => {
            alert("We cannot find that pokemon in the database. Please try again.")
        })
        //otherwise display the pokemon on the page in the respective areas
        .then((res) => {
            //write pokemon to an object so information can be extracted later
            if(section === ".playerPokemon"){
                pokemon.playerPoke = res;
            }
            else{
                pokemon.enemyPoke = res;
            }
            // update information on screen
            $(`${section} .pokeImg`).attr("src", res.sprites.front_default);
            $(`${section} .pokeName`).text((res.name));
            $(`${section} .pokeTypes`).text("");
            let typeString = ""
            res.types.forEach(type => {
                typeString += `${type.type.name} `;
            });
            typeString = typeString.slice(0, -1);
            $(`${section} .pokeTypes`).text(typeString);  

            //update stats for each pokemon
            res.stats.forEach(stat => {
                $(`${section} .statValues .${stat.stat.name}`).text(stat.base_stat);
            });
            pokemon.checkBattle();
            
        })
}
pokemon.checkBattle = () =>{
    if ($(".playerPokemon .pokeImg").attr("src") !== "assets/white.svg" && $(".enemyPokemon .pokeImg").attr("src") !== "assets/white.svg") {

        $(".battleButton").removeAttr('disabled');
    }
    else{
        $(".battleButton").attr("disabled", "disabled");
    }
}
pokemon.startBattle = () => {
    
    $(".battleButton").on("click", function(){
        pokemon.score = 0;
        //create an array of each pokemons types
        let playerTypes = ($(".playerPokemon .pokeTypes").text()).toLowerCase().split(" ");
        pokemon.findWeaknesses(playerTypes, "player");
    });
}
//get an array of all the type weaknesses of the pokemon, then pass it on to compare
pokemon.findWeaknesses = (typeArray, side) => {
    let weaknessArray = [];
    let types = 0;
    typeArray.forEach(type => {
        $.ajax({
            url: `${pokemon.urlString}type/${type}/`,
            method: "GET",
            dataType: "json",
        }).then((res) => {
            types++;
            let weaknessString = "";
            res.damage_relations.double_damage_from.forEach(type => {
                weaknessString += `${type.name} ` ;
            });
            weaknessString = (weaknessString.slice(0, -1)).split(" ");
            weaknessArray = weaknessArray.concat(weaknessString);
            
            if(types === typeArray.length){
                pokemon.calculateScore(weaknessArray, side);
            }
        });
    });
    
}
//compare type weaknesses and calculate score
pokemon.calculateScore = (weaknessArray, side) => {
    let typeLength = 0;
    weaknessArray.forEach(type => {
        typeLength++;
        if(side === "player"){
            pokemon.enemyPoke.types.forEach(enemyType => {
                if(type === enemyType.type.name){
                    pokemon.score -= 1;
                }
            })
            
        }
        else{
            pokemon.playerPoke.types.forEach(playerType => {
                if (type === playerType.type.name) {
                    pokemon.score += 1;
                }
            })
        }
        if (side === "player" && typeLength === weaknessArray.length) {
            let enemyTypes = ($(".enemyPokemon .pokeTypes").text()).toLowerCase().split(" ");
            pokemon.findWeaknesses(enemyTypes, "enemy");
        }
        if (side === "enemy" && typeLength === weaknessArray.length) {
            pokemon.checkScore();
        }
    });

}
//check the score and deterine the results.  look for tie matches and check other values if necessicary
pokemon.checkScore = () => {
    console.log(pokemon.score);  
    $(".battleResults").empty();
    $(".battleResults").css("display", "block")
    if(pokemon.score > 0){
        let resultMessage = $("<h2>").text("The player has the type advantage!")
        $(".battleResults").append(resultMessage).css("background-color", "green");
    }
    else if(pokemon.score < 0){
        let resultMessage = $("<h2>").text("The enemy has the type advantage!")
        $(".battleResults").append(resultMessage).css("background-color", "red");
    }
    //in the event there is no type advantage, calculate the base stat total and determine a winner based upon that. if it is still a tie, victory goes to the player.
    else{
        let playerStatTotal = 0;
        let enemyStatTotal = 0;
        for(let i = 0; i <= 5; i++){
            playerStatTotal += pokemon.playerPoke.stats[i].base_stat;
            enemyStatTotal += pokemon.enemyPoke.stats[i].base_stat;
        }
        if(playerStatTotal > enemyStatTotal){
            let resultMessage1 = $("<h2>").text("The Pokemon are even in type advantage!")
            let resultMessage2 = $("<h2>").text("The player as the advantage in stats!")
            $(".battleResults").append(resultMessage1, resultMessage2).css("background-color", "green");
        }
        else if(enemyStatTotal > playerStatTotal){
            let resultMessage1 = $("<h2>").text("The Pokemon are even in type advantage!")
            let resultMessage2 = $("<h2>").text("The enemy as the advantage in stats!")
            $(".battleResults").append(resultMessage1, resultMessage2).css("background-color", "red");
        }
        else{
            let resultMessage1 = $("<h2>").text("The Pokemon are even in type advantage!")
            let resultMessage2 = $("<h2>").text("The Pokemon are even in stats!")
            let resultMessage3 = $("<h2>").text("The player is given the win!");
            $(".battleResults").append(resultMessage1, resultMessage2, resultMessage3).css("background-color", "green");
        }
    }
}


// initialize function
pokemon.init = () =>{
    pokemon.getRandomPokemon();
    pokemon.searchPokemon();
    pokemon.startBattle();
    pokemon.checkBattle();
}

$(function () {
    pokemon.init();
});
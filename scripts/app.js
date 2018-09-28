// Boat Rocker Media - Pokemon Challenge
// James MacDonald
// started: 1: 15pm Sept 28th 2018

const pokemon = {};
pokemon.urlString = "https://pokeapi.co/api/v2/";

pokemon.playerPoke = {};
pokemon.enemyPoke = {};

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
            dataType: "json",
            data: {}

        }).then((res) => {
            let resultPoke = Math.floor(Math.random() * 801);
            pokemon.findPokemon(res.results[resultPoke].name, ".playerPokemon");

        });
    })

    $(".enemyPokemon .randomPokemon").on("click", function () {
        $.ajax({
            url: pokemon.urlString + "pokemon/",
            method: "GET",
            dataType: "json",
            data: {}

        }).then((res) => {
            let resultPoke = Math.floor(Math.random() * 801);
            pokemon.findPokemon(res.results[resultPoke].name, ".enemyPokemon");

        });
    })
    
}
pokemon.searchPokemon = () => {
    // pass search term into ajax call, keeping what section the information must be displayed in
    $(".playerPokemon .findPokemon").on("click", function () {
        let userString = $(".playerPokemon .pokemonSearch").val();
        pokemon.findPokemon(userString, ".playerPokemon");
    })
    $(".enemyPokemon .findPokemon").on("click", function () {
        let userString = $(".enemyPokemon .pokemonSearch").val();
        pokemon.findPokemon(userString, ".enemyPokemon");
    })
}

pokemon.findPokemon = (searchTerm, section) => {
        $.ajax({
            url: `${pokemon.urlString}pokemon/${searchTerm}/`,
            method: "GET",
            dataType: "json",
            data: {}

            //alert user if the pokemon cannot be found in the database
        }).fail(() => {
            alert("We cannot find that pokemon in the database. Please try again.")
        })
        //otherwise display the pokemon on the page in the respective areas
        .then((res) => {
            console.log(res);
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
            $(`${section} .pokeTypes`).text(typeString);  

            //update stats for each pokemon
            res.stats.forEach(stat => {
                $(`${section} .statValues .${stat.stat.name}`).text(stat.base_stat);
            });
            pokemon.checkBattle();
            console.log(pokemon.playerPoke, pokemon.enemyPoke);
            
        })
}
pokemon.checkBattle = () =>{
    if ($(".playerPokemon .pokeImg").attr("src") !== "" && $(".enemyPokemon .pokeImg").attr("src") !== "") {
        console.log('test');

        $(".battleButton").removeAttr('disabled');
    }
    else{
        $(".battleButton").attr("disabled", "disabled");
    }
}
pokemon.startBattle = () => {
    $(".battleButton").on("click", function(){

    });
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
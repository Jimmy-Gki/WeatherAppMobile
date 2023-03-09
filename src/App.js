//Import de React et de useState
import React, { useState } from "react";

//Configuration de l'API
const api = {
  key: "20aa7e0ecf5ac7e49dc774f5905ee960", //Clé de l'API openWeatherMap
  base: "https://api.openweathermap.org/data/2.5/", //Lien pour appel de l'API
  lang: "fr", //Définition de la langue des données de l'API
  timezone: "DXGNTEJU1X3Y" //Clé d'API timezoneDB
}

function App() {
  const [query, setQuery] = useState(''); //State recherche
  const [weather, setWeather] = useState({}); //State données météo
  const [exactTime, setExactTime] = useState(null); //State heure exacte
  const [cityDate, setCityDate] = useState(null); //Set date et ville
  const [wind, setWind] = useState({speed: null, direction: null}); //State données vent
  
  //Fonction de recherche de la météo
  const search = event => {
    if (event.key === "Enter") {
      fetch(`${api.base}weather?q=${query}&units=metric&APPID=${api.key}&lang=${api.lang}`)
      .then(res => res.json())
      .then(result => {
        if(result.cod === 200) {
          setWeather(result);
          setQuery('');
          console.log(result);

          //Convertion de la vitesse du vent en km/h et récupération de la direction en degré
          setWind ({
            speed: result.wind.speed * 3.6,
            direction: result.wind.deg
          })
  
          //Récupération de la latitude & longitude de la ville pour avoir l'heure exacte
          const lat = result.coord.lat;
          const lon = result.coord.lon;
          fetch(`http://api.timezonedb.com/v2.1/get-time-zone?key=${api.timezone}&format=json&by=position&lat=${lat}&lng=${lon}`)
          .then(res => res.json())
          .then(result => {
            const exactTime = new Date(result.formatted);
            setExactTime(exactTime);
  
            //Formatage de la date pour l'affichage
            const cityDate = exactTime.toLocaleDateString(api.lang, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
            setCityDate(cityDate);
            console.log(exactTime);
          });
        } else {
          //Si la ville est introuvable alors on envoie un message dans la console et on réinitialise les données météo pour ne pas avoir d'erreur
          setWeather({});
          console.log('ville introuvable');
        }
      });
    }
  }

  //Fonction pour convertir la direction du vent en lettre plutôt qu'en degré
  const degToCompass = (num) => {
    const val = Math.floor((num / 22.5) + 0.5);
    const arr = ["Nord", "N.N.E", "N.E", "E.N.E", "Est", "E.S.E", "S.E", "S.S.E", "Sud", "S.S.O", "S.O", "O.S.E", "Ouest", "O.N.O", "N.O", "N.N.O"];
    return arr[(val % 16)];
  }

  //Fonction permettant de renvoyer la date formatée en Français avec la chaine de caractères correspondante
  const dateBuilder = (d) => {

    //On déclare les tableaux des mois et des jours en français
    let months = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Decembre"];
    let days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  
    //On récupère le jour de la semaine, le jour du mois, le mois, et l'année
    let day = days[d.getDay()];
    let date = d.getDate();
    let month = months[d.getMonth()];
    let year = d.getFullYear();
  
    //On récupère les heures et les minutes avec la même méthode
    let hours = d.getHours();
    let minutes = d.getMinutes();

    //Formatage de l'heure  et des minutes pour obtenir la chaine de caractère sous la forme "hh:mm"
    let hour = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  
    //Si l'heure exacte est fournie, on récupère l'heure et les minutes de "exactTime" pour les formater
    if (exactTime) {
      hours = exactTime.getHours();
      minutes = exactTime.getMinutes();
      hour = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;

      //Pareil pour la date, pour elle aussi la formater
      day = cityDate.split(' ')[0];
      date = cityDate.split(' ')[1];
      month = cityDate.split(' ')[2];
      year = cityDate.split(' ')[3];
    }
  
    return `${day} ${date} ${month} ${year} ${exactTime ? hour : ''}`;
  }

  return (
    <div className={weather && exactTime ? ((exactTime.getHours() >= 20 || exactTime.getHours() < 6) ? 'container container_sunset' : 'container') : 'container'}>
      <main>
        <div className="search_box">
          <input 
          className="search_bar" 
          type="text" 
          placeholder="Rechercher..."
          onChange={e => setQuery(e.target.value)}
          value={query}
          onKeyDown={search} />
        </div>
        {(typeof weather.main != "undefined") ? (
        <div>
          <div className="location_box">
            <div className="location">{weather.name}, {weather.sys.country}</div>
            <div className="date">{dateBuilder (new Date())}</div>
          </div>
          <div className="weather_box">
            <div className="temp">{Math.round(weather.main.temp)}°C</div>
            <div className="weather">{weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1)}</div>
            <div className="wind">Vent: {Math.round(wind.speed)} km/h, {degToCompass(Math.round(wind.direction))}</div>
          </div>
        </div>  
        ) : (
          <div className="undefined">Ville introuvable</div>
        )}
      </main>
    </div>
  );
}

export default App;
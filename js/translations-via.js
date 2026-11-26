/*
  Corevia – copy for the "Core + Via" design, in seven languages.
  Merged over translations.js and translations-group.js.
*/
(function () {
  var V = {
    en: {
      "via.def.core": "The centre. Corevia B.V. owns 100% of three Dutch companies and decides how each one grows.",
      "via.def.via": "The way. Three routes run out of that centre: freight on the road, people on shift, reach online.",
      "via.scroll": "Follow the route",
      "via.m.k": "Via road", "via.m.h1": "Freight that", "via.m.h2": "arrives.",
      "via.t.k": "Via people", "via.t.h1": "Shifts that", "via.t.h2": "are covered.",
      "via.p.k": "Via signal", "via.p.h1": "Reach that", "via.p.h2": "converts.",
      "via.all.k": "Back to the core", "via.all.h1": "Three routes,", "via.all.h2": "one address."
    },
    nl: {
      "via.def.core": "Het centrum. Corevia B.V. bezit 100% van drie Nederlandse bedrijven en bepaalt hoe elk bedrijf groeit.",
      "via.def.via": "De weg. Vanuit dat centrum lopen drie routes: vracht over de weg, mensen in ploegen, bereik online.",
      "via.scroll": "Volg de route",
      "via.m.k": "Via de weg", "via.m.h1": "Vracht die", "via.m.h2": "aankomt.",
      "via.t.k": "Via mensen", "via.t.h1": "Diensten die", "via.t.h2": "bemand zijn.",
      "via.p.k": "Via signaal", "via.p.h1": "Bereik dat", "via.p.h2": "converteert.",
      "via.all.k": "Terug naar de kern", "via.all.h1": "Drie routes,", "via.all.h2": "één adres."
    },
    de: {
      "via.def.core": "Das Zentrum. Corevia B.V. hält 100% an drei niederländischen Unternehmen und entscheidet, wie jedes wächst.",
      "via.def.via": "Der Weg. Von diesem Zentrum gehen drei Routen aus: Fracht auf der Straße, Menschen im Schichtdienst, Reichweite online.",
      "via.scroll": "Der Route folgen",
      "via.m.k": "Via Straße", "via.m.h1": "Fracht, die", "via.m.h2": "ankommt.",
      "via.t.k": "Via Menschen", "via.t.h1": "Schichten, die", "via.t.h2": "besetzt sind.",
      "via.p.k": "Via Signal", "via.p.h1": "Reichweite, die", "via.p.h2": "konvertiert.",
      "via.all.k": "Zurück zum Kern", "via.all.h1": "Drei Routen,", "via.all.h2": "eine Adresse."
    },
    fr: {
      "via.def.core": "Le centre. Corevia B.V. détient 100 % de trois sociétés néerlandaises et décide de la croissance de chacune.",
      "via.def.via": "La voie. Trois routes partent de ce centre : le fret sur la route, les équipes en poste, l'audience en ligne.",
      "via.scroll": "Suivre la route",
      "via.m.k": "Via la route", "via.m.h1": "Un fret qui", "via.m.h2": "arrive.",
      "via.t.k": "Via les personnes", "via.t.h1": "Des postes", "via.t.h2": "pourvus.",
      "via.p.k": "Via le signal", "via.p.h1": "Une audience qui", "via.p.h2": "convertit.",
      "via.all.k": "Retour au cœur", "via.all.h1": "Trois routes,", "via.all.h2": "une seule adresse."
    },
    es: {
      "via.def.core": "El centro. Corevia B.V. posee el 100 % de tres empresas neerlandesas y decide cómo crece cada una.",
      "via.def.via": "El camino. De ese centro salen tres rutas: carga por carretera, personas por turnos, alcance en línea.",
      "via.scroll": "Seguir la ruta",
      "via.m.k": "Vía carretera", "via.m.h1": "Carga que", "via.m.h2": "llega.",
      "via.t.k": "Vía personas", "via.t.h1": "Turnos", "via.t.h2": "cubiertos.",
      "via.p.k": "Vía señal", "via.p.h1": "Alcance que", "via.p.h2": "convierte.",
      "via.all.k": "De vuelta al núcleo", "via.all.h1": "Tres rutas,", "via.all.h2": "una dirección."
    },
    it: {
      "via.def.core": "Il centro. Corevia B.V. detiene il 100% di tre società olandesi e decide come cresce ciascuna.",
      "via.def.via": "La via. Da quel centro partono tre rotte: merci su strada, persone sui turni, visibilità online.",
      "via.scroll": "Segui il percorso",
      "via.m.k": "Via strada", "via.m.h1": "Merci che", "via.m.h2": "arrivano.",
      "via.t.k": "Via persone", "via.t.h1": "Turni", "via.t.h2": "coperti.",
      "via.p.k": "Via segnale", "via.p.h1": "Visibilità che", "via.p.h2": "converte.",
      "via.all.k": "Ritorno al centro", "via.all.h1": "Tre rotte,", "via.all.h2": "un solo indirizzo."
    },
    pl: {
      "via.def.core": "Centrum. Corevia B.V. posiada 100% udziałów w trzech holenderskich spółkach i decyduje, jak każda z nich się rozwija.",
      "via.def.via": "Droga. Z tego centrum wychodzą trzy trasy: towary na drodze, ludzie na zmianach, zasięg w sieci.",
      "via.scroll": "Podążaj trasą",
      "via.m.k": "Via droga", "via.m.h1": "Towar, który", "via.m.h2": "dociera.",
      "via.t.k": "Via ludzie", "via.t.h1": "Zmiany, które", "via.t.h2": "są obsadzone.",
      "via.p.k": "Via sygnał", "via.p.h1": "Zasięg, który", "via.p.h2": "konwertuje.",
      "via.all.k": "Powrót do rdzenia", "via.all.h1": "Trzy trasy,", "via.all.h2": "jeden adres."
    }
  };
  var base = window.COREVIA_I18N = window.COREVIA_I18N || {};
  Object.keys(V).forEach(function (code) {
    base[code] = base[code] || {};
    Object.keys(V[code]).forEach(function (k) { base[code][k] = V[code][k]; });
  });
})();

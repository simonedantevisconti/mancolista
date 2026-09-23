export const worldCup2026Series = [
  {
    id: "official-sticker-collection",
    name: "Official Sticker Collection",
    subtitle: "FIFA World Cup 2026 Panini",
    totalCards: 980,
    ownedCards: 0,
  },
  {
    id: "update-edition",
    name: "Update Edition",
    subtitle: "FIFA World Cup 2026 Panini",
    totalCards: 120,
    ownedCards: 0,
  },
];

const worldCupTeams = [
  { code: "MEX", name: "Messico" },
  { code: "ZAF", name: "Sudafrica" },
  { code: "KOR", name: "Corea del Sud" },
  { code: "CZE", name: "Repubblica Ceca" },
  { code: "CAN", name: "Canada" },
  { code: "BIH", name: "Bosnia ed Erzegovina" },
  { code: "QAT", name: "Qatar" },
  { code: "SUI", name: "Svizzera" },
  { code: "BRA", name: "Brasile" },
  { code: "MAR", name: "Marocco" },
  { code: "HAI", name: "Haiti" },
  { code: "SCO", name: "Scozia" },
  { code: "USA", name: "Stati Uniti" },
  { code: "PAR", name: "Paraguay" },
  { code: "AUS", name: "Australia" },
  { code: "TUR", name: "Turchia" },
  { code: "GER", name: "Germania" },
  { code: "CUW", name: "Curaçao" },
  { code: "CIV", name: "Costa d'Avorio" },
  { code: "ECU", name: "Ecuador" },
  { code: "NED", name: "Paesi Bassi" },
  { code: "JPN", name: "Giappone" },
  { code: "SWE", name: "Svezia" },
  { code: "TUN", name: "Tunisia" },
  { code: "BEL", name: "Belgio" },
  { code: "EGY", name: "Egitto" },
  { code: "IRN", name: "Iran" },
  { code: "NZL", name: "Nuova Zelanda" },
  { code: "ESP", name: "Spagna" },
  { code: "CPV", name: "Capo Verde" },
  { code: "KSA", name: "Arabia Saudita" },
  { code: "URU", name: "Uruguay" },
  { code: "FRA", name: "Francia" },
  { code: "SEN", name: "Senegal" },
  { code: "IRQ", name: "Iraq" },
  { code: "NOR", name: "Norvegia" },
  { code: "ARG", name: "Argentina" },
  { code: "ALG", name: "Algeria" },
  { code: "AUT", name: "Austria" },
  { code: "JOR", name: "Giordania" },
  { code: "POR", name: "Portogallo" },
  { code: "COD", name: "RD Congo" },
  { code: "UZB", name: "Uzbekistan" },
  { code: "COL", name: "Colombia" },
  { code: "ENG", name: "Inghilterra" },
  { code: "CRO", name: "Croazia" },
  { code: "GHA", name: "Ghana" },
  { code: "PAN", name: "Panama" },
];

const specialStickers = [
  { number: "FWC 00", name: "Logo Panini" },
  { number: "FWC 1", name: "Emblema ufficiale - parte superiore" },
  { number: "FWC 2", name: "Emblema ufficiale - parte inferiore" },
  { number: "FWC 3", name: "Mascotte ufficiali" },
  { number: "FWC 4", name: "Slogan ufficiale" },
  { number: "FWC 5", name: "Pallone ufficiale" },
  { number: "FWC 6", name: "Canada - Paese e città ospitanti" },
  { number: "FWC 7", name: "Messico - Paese e città ospitanti" },
  { number: "FWC 8", name: "Stati Uniti - Paese e città ospitanti" },
  { number: "FWC 9", name: "Italia 1934" },
  { number: "FWC 10", name: "Uruguay 1950" },
  { number: "FWC 11", name: "Germania Ovest 1954" },
  { number: "FWC 12", name: "Brasile 1962" },
  { number: "FWC 13", name: "Germania Ovest 1974" },
  { number: "FWC 14", name: "Argentina 1986" },
  { number: "FWC 15", name: "Brasile 1994" },
  { number: "FWC 16", name: "Brasile 2002" },
  { number: "FWC 17", name: "Italia 2006" },
  { number: "FWC 18", name: "Germania 2014" },
  { number: "FWC 19", name: "Argentina 2022" },
];

const buildCard = ({ id, number, name, category, team = "" }) => ({
  id,
  number,
  name,
  category,
  team,
  frontImage: "/mondiale-2026-retro.png",
  backImage: "/mondiale-2026-retro.png",
});

const generateOfficialCollection = () => {
  const specials = specialStickers.map((sticker) =>
    buildCard({
      id: `official-${sticker.number.toLowerCase().replace(/\s+/g, "-")}`,
      number: sticker.number,
      name: sticker.name,
      category: "speciale",
    }),
  );

  const teams = worldCupTeams.flatMap((team) => {
    return Array.from({ length: 20 }, (_, index) => {
      const position = index + 1;
      const number = `${team.code} ${position}`;

      let category = "giocatore";
      let name = `${team.name} - Giocatore ${position}`;

      if (position === 1) {
        category = "stemma";
        name = `${team.name} - Stemma ufficiale`;
      }

      if (position === 13) {
        category = "foto-squadra";
        name = `${team.name} - Foto squadra`;
      }

      return buildCard({
        id: `official-${team.code.toLowerCase()}-${position}`,
        number,
        name,
        category,
        team: team.name,
      });
    });
  });

  return [...specials, ...teams];
};

const generateUpdateEdition = () => {
  return Array.from({ length: 120 }, (_, index) => {
    const position = index + 1;
    const number = `UPD ${String(position).padStart(3, "0")}`;

    return buildCard({
      id: `update-${position}`,
      number,
      name: `Aggiornamento ${String(position).padStart(3, "0")}`,
      category: "update",
    });
  });
};

export const generateWorldCup2026Cards = (seriesId) => {
  if (seriesId === "official-sticker-collection") {
    return generateOfficialCollection();
  }

  if (seriesId === "update-edition") {
    return generateUpdateEdition();
  }

  return [];
};

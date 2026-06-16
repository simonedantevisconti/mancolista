import { useState } from "react";
import "../styles/homepage.css";

const collections = [
  {
    id: 1,
    name: "Italian Brainrot",
    description:
      "Tieni traccia delle carte che hai, delle doppie e delle mancanti.",
    totalCards: 120,
    ownedCards: 34,
    image: "🧠",
  },
  {
    id: 2,
    name: "Pokémon",
    description: "Collezione futura per carte Pokémon.",
    totalCards: 0,
    ownedCards: 0,
    image: "⚡",
  },
  {
    id: 3,
    name: "Yu-Gi-Oh!",
    description: "Collezione futura per carte Yu-Gi-Oh!.",
    totalCards: 0,
    ownedCards: 0,
    image: "🐉",
  },
];

const Homepage = () => {
  const [search, setSearch] = useState("");

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section className="homepage">
      <div className="homepage-hero">
        <p className="eyebrow">La tua checklist digitale</p>
        <h1>MancoLista</h1>
        <p>
          Organizza le tue collezioni, segna le carte che hai, controlla le
          doppie e scopri quelle che ti mancano.
        </p>

        <div className="search-box">
          <input
            type="text"
            placeholder="Cerca una collezione..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="collections-grid">
        {filteredCollections.map((collection) => (
          <article className="collection-card" key={collection.id}>
            <div className="collection-icon">{collection.image}</div>

            <div>
              <h2>{collection.name}</h2>
              <p>{collection.description}</p>
            </div>

            <div className="collection-progress">
              <span>
                {collection.ownedCards}/{collection.totalCards} carte
              </span>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width:
                      collection.totalCards > 0
                        ? `${(collection.ownedCards / collection.totalCards) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>

            <button className="card-button">Apri collezione</button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Homepage;

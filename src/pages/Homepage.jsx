import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mainCollections } from "../data/collections";
import "../styles/homepage.css";

const Homepage = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredCollections = mainCollections.filter((collection) =>
    collection.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenCollection = (collection) => {
    if (!collection.active) {
      return;
    }

    navigate(`/collezioni/${collection.id}`);
  };

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
          <article
            className={`collection-card ${
              !collection.active ? "collection-card--disabled" : ""
            }`}
            key={collection.id}
          >
            <div className="collection-icon">{collection.icon}</div>

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
                        ? `${
                            (collection.ownedCards / collection.totalCards) *
                            100
                          }%`
                        : "0%",
                  }}
                />
              </div>
            </div>

            <button
              className="card-button"
              type="button"
              onClick={() => handleOpenCollection(collection)}
              disabled={!collection.active}
            >
              {collection.active ? "Apri collezione" : "Presto disponibile"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Homepage;

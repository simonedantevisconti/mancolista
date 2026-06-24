import "../styles/favourites.css";

const myCollections = [
  {
    id: 1,
    name: "Italian Brainrot",
    owned: 0,
    duplicates: 0,
    missing: 150,
  },
];

const Favourites = () => {
  return (
    <section className="favourites-page">
      <div className="page-heading">
        <p className="eyebrow">Archivio personale</p>
        <h1>Le mie collezioni</h1>
        <p>
          Qui vedrai solo le collezioni che hai iniziato davvero a completare.
        </p>
      </div>

      <div className="my-collections-list">
        {myCollections.map((collection) => (
          <article className="my-collection-card" key={collection.id}>
            <h2>{collection.name}</h2>

            <div className="stats-grid">
              <div>
                <strong>{collection.owned}</strong>
                <span>Possedute</span>
              </div>

              <div>
                <strong>{collection.duplicates}</strong>
                <span>Doppie</span>
              </div>

              <div>
                <strong>{collection.missing}</strong>
                <span>Mancanti</span>
              </div>
            </div>

            <button>Gestisci lista</button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Favourites;

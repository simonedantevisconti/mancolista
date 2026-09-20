import "../styles/footer.css";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <p>
        © {year} MancoLista — Developed by{" "}
        <a
          href="https://simonevisconti.site/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Simone Visconti
        </a>
      </p>
    </footer>
  );
};

export default Footer;

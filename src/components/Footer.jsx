import "../styles/footer.css";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <p>
        © {year} MancoLista — Developed by <span>Syndycore</span>
      </p>
    </footer>
  );
};

export default Footer;

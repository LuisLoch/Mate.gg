import React from 'react'
import "./Footer.css";

//router
import {Link} from 'react-router-dom';

const Footer = () => {
  return (
    <footer id="footer">
      <h3>Mate.gg &copy; 2023</h3>
      <br />
      <p><Link>Nos dê sua opinião</Link></p>
    </footer>
  );
};

export default Footer;
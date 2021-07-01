import { Link } from 'react-router-dom';

const Navbar = () => {
    return ( 
        <nav className="navbar">
            <h1>Kalkula</h1>
            <div className="links">
                <Link to="/">Two-way Accepter</Link>
                <Link to="/tm">Turing Machine</Link>
            </div>
        </nav>
     );
}
 
export default Navbar;
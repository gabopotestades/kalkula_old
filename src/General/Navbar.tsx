import { Link } from 'react-router-dom';

const Navbar = () => {
    return ( 
        <nav className="navbar">
        <Link to="/"><h1>Kalkula</h1></Link>
            <div className="links">
                <Link to="/two-way-acceptor">Two-way Acceptor</Link>
                <Link to="/turing-machine">Turing Machine</Link>
            </div>
        </nav>
     );
}
 
export default Navbar;
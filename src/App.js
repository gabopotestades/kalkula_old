import './App.css';
import Navbar from './General/Navbar';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import TwoWayAcceptor from './TwoWayAcceptor/TwoWayAcceptor';
import TuringMachine from './TuringMachine/TuringMachine';
import Home from './General/Home';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar/>

        <Switch>

          <Route exact path="/">
            <Home/>
          </Route>

          <Route path="/two-way-acceptor">
            <TwoWayAcceptor/>
          </Route>

          <Route path="/turing-machine">
            <TuringMachine/>
          </Route>

        </Switch>

      </div>
    </Router>
  );
}

export default App;

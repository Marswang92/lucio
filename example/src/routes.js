import React from 'react';
import Todos from './components/Todos';
import Counter from './components/Counter';
import Home from './components/Home';
import { Router, Route } from '../../src';

/* You can also use view without routing. */
// const App = (
//   <div>
//     <Todos />
//     <Counter />
//   </div>,
// );

export const ssrRoutes = (
  <div>
    <Route path="/" component={Home} />
    <Route path="/todo" component={Todos} />
    <Route path="/counter" component={Counter} />
  </div>
);

export default history => (
  <Router history={history}>
    <Route path="/" component={Home} />
    <Route path="/todo" component={Todos} />
    <Route path="/counter" component={Counter} />
  </Router>
);


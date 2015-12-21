import React from 'react';
import routes from './routes';
import { createHistory, useBasename } from 'history';
import { render } from 'react-dom';
import { Router } from 'react-router';

const history = useBasename(createHistory)({
    basename: window.location.pathname.indexOf('react') !== -1 ?
                '/react-formable' :
                '/'
});

render(
    <Router history={history}>
        {routes}
    </Router>,
    document.getElementById('app')
);
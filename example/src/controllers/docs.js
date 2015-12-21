import React, { PropTypes } from 'react';

export default React.createClass({
    propTypes: {
        children: PropTypes.node,
        setSublinks: PropTypes.func
    },

    componentWillMount() {
        this.props.setSublinks([
            { name: 'kevin', to: 'kevin' }
        ]);
    },

    render() {
        return <div className="docs">
            Docs
        </div>;
    }
});
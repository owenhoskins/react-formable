require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = function() {};

if ("production" !== 'production') {
  warning = function(condition, format, args) {
    var len = arguments.length;
    args = new Array(len > 2 ? len - 2 : 0);
    for (var key = 2; key < len; key++) {
      args[key - 2] = arguments[key];
    }
    if (format === undefined) {
      throw new Error(
        '`warning(condition, format, ...args)` requires a warning ' +
        'message argument'
      );
    }

    if (format.length < 10 || (/^[s\W]*$/).test(format)) {
      throw new Error(
        'The warning format should be able to uniquely identify this ' +
        'warning. Please, use a more descriptive format than: ' + format
      );
    }

    if (!condition) {
      var argIndex = 0;
      var message = 'Warning: ' +
        format.replace(/%s/g, function() {
          return args[argIndex++];
        });
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch(x) {}
    }
  };
}

module.exports = warning;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _helpersValues = require('./helpers/values');

var _helpersValues2 = _interopRequireDefault(_helpersValues);

var _fieldset = require('./fieldset');

var _fieldset2 = _interopRequireDefault(_fieldset);

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

exports['default'] = _react2['default'].createClass({
    displayName: 'Fieldlist',

    propTypes: {
        errors: _react.PropTypes.arrayOf(_react.PropTypes.string),
        name: _react.PropTypes.string.isRequired,
        children: _react.PropTypes.node
    },

    getInputs: function getInputs() {
        return {
            ref: this,
            refs: (0, _helpersValues2['default'])(this.refs.fieldset.getInputs().refs).filter(function (node) {
                return node.refs && (0, _helpersValues2['default'])(node.refs).length;
            })
        };
    },

    render: function render() {
        var _this = this;

        (0, _warning2['default'])(this.props.name, 'Fieldlist found without a name prop. The children of this component will behave eratically');

        var errors = this.props.errors || [];

        return _react2['default'].createElement(
            _fieldset2['default'],
            _extends({}, this.props, { ref: 'fieldset' }),
            _react2['default'].Children.map(this.props.children, function (child, i) {
                return _react2['default'].createElement(
                    _fieldset2['default'],
                    { name: _this.props.name + i, errors: errors[i] },
                    child
                );
            })
        );
    }
});
module.exports = exports['default'];

},{"./fieldset":3,"./helpers/values":12,"react":undefined,"warning":1}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _helpersCloneChildren = require('./helpers/cloneChildren');

var _helpersCloneChildren2 = _interopRequireDefault(_helpersCloneChildren);

var _helpersValues = require('./helpers/values');

var _helpersValues2 = _interopRequireDefault(_helpersValues);

var _helpersIdentity = require('./helpers/identity');

var _helpersIdentity2 = _interopRequireDefault(_helpersIdentity);

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

exports['default'] = _react2['default'].createClass({
    displayName: 'Fieldset',

    propTypes: {
        errors: _react.PropTypes.arrayOf(_react.PropTypes.string),
        name: _react.PropTypes.string.isRequired,
        children: _react.PropTypes.node
    },

    getInputs: function getInputs() {
        return {
            ref: this,
            refs: (0, _helpersValues2['default'])(this.refs || {}).filter(function (ref) {
                return ref.getInputs || ref.getValue;
            }).map(function (ref) {
                return ref.getInputs ? ref.getInputs() : { ref: ref };
            }).reduce(function (memo, node) {
                memo[node.ref.props.name] = node;
                return memo;
            }, {})
        };
    },

    render: function render() {
        var _this = this;

        (0, _warning2['default'])(this.props.name, 'Fieldset found without a name prop. The children of this component will behave eratically');

        var childNames = [];
        var clonePred = function clonePred(child) {
            return child.props && child.props.name;
        };
        var cloneProps = function cloneProps(child) {
            (0, _warning2['default'])(!child.ref, 'Attempting to attach ref "' + child.ref + '" to "' + child.props.name + '" will be bad for your health');

            (0, _warning2['default'])(childNames.indexOf(child.props.name) === -1, 'Duplicate name "' + child.props.name + '" found. Duplicate fields will be ignored');

            childNames = childNames.concat(child.props.name);

            return {
                ref: child.ref || child.props.name,
                errors: child.props.errors || _this.props.errors[child.props.name] || [],
                onChange: child.props.onChange || _helpersIdentity2['default'],
                onSubmit: child.props.onSubmit || _helpersIdentity2['default']
            };
        };

        return _react2['default'].createElement(
            'div',
            this.props,
            (0, _helpersCloneChildren2['default'])(clonePred, cloneProps, this.props.children)
        );
    }
});
module.exports = exports['default'];

},{"./helpers/cloneChildren":5,"./helpers/identity":7,"./helpers/values":12,"react":undefined,"warning":1}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _helpersKeys = require('./helpers/keys');

var _helpersKeys2 = _interopRequireDefault(_helpersKeys);

var _helpersUniq = require('./helpers/uniq');

var _helpersUniq2 = _interopRequireDefault(_helpersUniq);

var _helpersValues = require('./helpers/values');

var _helpersValues2 = _interopRequireDefault(_helpersValues);

var _helpersIdentity = require('./helpers/identity');

var _helpersIdentity2 = _interopRequireDefault(_helpersIdentity);

var _helpersCloneChildren = require('./helpers/cloneChildren');

var _helpersCloneChildren2 = _interopRequireDefault(_helpersCloneChildren);

var _helpersPick = require('./helpers/pick');

var _helpersPick2 = _interopRequireDefault(_helpersPick);

var _helpersOmit = require('./helpers/omit');

var _helpersOmit2 = _interopRequireDefault(_helpersOmit);

var _helpersCompose = require('./helpers/compose');

var _helpersCompose2 = _interopRequireDefault(_helpersCompose);

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var getBlankForm = function getBlankForm() {
    return {
        valid: true,
        fieldValues: {},
        fieldErrors: {},
        errors: []
    };
};

exports.getBlankForm = getBlankForm;
var deNestErrors = function deNestErrors(_x2) {
    var _arguments = arguments;
    var _again = true;

    _function: while (_again) {
        var errors = _x2;
        _again = false;

        // Our base case, strings or nulls
        if (!errors || typeof errors === 'string') return errors;

        // Arrays are objects, so we have to check arrays first
        // Iterate over each value in our array and denest it. Combine all These
        // results into one array and return it
        if (errors.constructor === Array) return [].concat.apply([], errors.map(function (val) {
            return deNestErrors(val);
        }));

        // Iterate over each value within our object and denest them
        if (typeof errors === 'object') {
            _arguments = [_x2 = (0, _helpersValues2['default'])(errors)];
            _again = true;
            continue _function;
        }

        // Fallback in case something real weird happens
        return errors;
    }
};

exports.deNestErrors = deNestErrors;
var nodeToValues = function nodeToValues(node) {
    // Whoops, bad things happening
    if (!node) return node;

    // We are either starting off or not at a leaf yet. Regardless traverse
    // the path downwards until we hit a leaf
    if (node.constructor === Array) {
        return node.reduce(function (memo, currentNode) {
            memo[currentNode.ref.props.name] = nodeToValues(currentNode);
            return memo;
        }, {});
    }

    if (node.refs && node.refs.constructor === Array) {
        return node.refs.map(function (r) {
            return nodeToValues(r);
        });
    }

    if (node.refs && typeof node.refs === 'object') {
        return (0, _helpersValues2['default'])(node.refs).reduce(function (memo, currentNode) {
            memo[currentNode.ref.props.name] = nodeToValues(currentNode);
            return memo;
        }, {});
    }

    // We are at a leaf, give our value back
    return node.ref.getValue();
};

// node: The current node we are looking at { ref: Object, refs?: Object|Array }
// treeValues: The current value / object in the tree
// treeErrors: The current array of errors / object of errors in the tree
// form: The overall form
// returns { fieldErrors: Object, errors: array }
var toErrors = function toErrors(node, treeValues, treeErrors, form) {
    if (treeErrors === undefined) treeErrors = {};

    // Something bad is happening here
    if (!node) return node;

    // The initial call to this function is an array of nodes
    if (node.constructor === Array) {
        var _ret = (function () {
            var errors = [];

            var fieldErrors = node.reduce(function (memo, currentNode) {
                var name = currentNode.ref.props.name;
                var childResult = toErrors(currentNode, treeValues[name], treeErrors[name], form);

                memo[name] = childResult.fieldErrors;
                errors = errors.concat(childResult.errors);
                return memo;
            }, {});

            return {
                v: { fieldErrors: fieldErrors, errors: errors }
            };
        })();

        if (typeof _ret === 'object') return _ret.v;
    }

    // We want to get errrors from the bottom up. To do this we start by always
    // getting the errors for our children first. Once we have our childrens
    // errors, we validate ourselves against our children. Lastly, we return the
    // result of these checks

    // These will be our return types:
    // fieldErrors: Object | Array (depending on the type of node.refs) If
    // node.refs doesn't exist it means we are a leaf and will have an array of
    // strings
    var fieldErrors = undefined;
    // errors: Array (always)
    var errors = [];

    // Here we have children, we are not a leaf
    if (node.refs) {
        if (node.refs.constructor === Array) {
            fieldErrors = node.refs.map(function (currentNode, i) {
                var childResult = toErrors(currentNode, treeValues[i], treeErrors[i], form);

                errors = errors.concat(childResult.errors);
                return childResult.fieldErrors;
            });
        } else {
            // Iterate over each child. And add our child errors to our errors
            fieldErrors = (0, _helpersValues2['default'])(node.refs).reduce(function (memo, currentNode) {
                var name = currentNode.ref.props.name;
                var childResult = toErrors(currentNode, treeValues[name], treeErrors[name], form);

                memo[name] = childResult.fieldErrors;
                errors = errors.concat(childResult.errors);
                return memo;
            }, {});
        }
    }

    // Get our current node's validators. They can be on props or this
    var validators = [].concat(node.ref.props.validators || [], node.ref.validators || []);
    // Validate the current node
    var validationErrors = validators.map(function (validator) {
        return validator.call(node.ref, treeValues, form.fieldValues, form.fieldErrors, treeErrors);
    }).filter(_helpersIdentity2['default']);

    errors = errors.concat(validationErrors);

    // Our field errors will either be our childrens fieldErrors (if we have
    // children) or our validation errors
    fieldErrors = fieldErrors || validationErrors;

    return { fieldErrors: fieldErrors, errors: errors };
};

exports['default'] = _react2['default'].createClass({
    displayName: 'Form',

    propTypes: {
        circular: _react.PropTypes.bool,

        // Handlers for your form callbacks. These will be called with the
        // current serialization of the form
        onSubmit: _react.PropTypes.func,
        onChange: _react.PropTypes.func,

        // Default React children prop
        children: _react.PropTypes.node
    },

    getDefaultProps: function getDefaultProps() {
        return {
            onChange: function onChange() {},
            onSubmit: function onSubmit() {}
        };
    },

    getInitialState: function getInitialState() {
        return {
            fieldErrors: {}
        };
    },

    serialize: function serialize() {
        var iteration = 0;
        // TODO: Lolololol
        var refLength = 20;

        // Build the object of inputs
        var nodes = (0, _helpersValues2['default'])(this.refs || {}).filter(function (ref) {
            return ref.getInputs || ref.getValue;
        }).map(function (ref) {
            return ref.getInputs ? ref.getInputs() : { ref: ref };
        });

        var form = getBlankForm();
        var oldForm = getBlankForm();

        do {
            // Keep a copy of the previous iteration of the form so we can
            // detect if the form is stable to exit early
            oldForm = _extends({}, form);
            form.fieldValues = nodeToValues(nodes);

            var _toErrors = toErrors(nodes, form.fieldValues, form.fieldErrors, form);

            var fieldErrors = _toErrors.fieldErrors;
            var errors = _toErrors.errors;

            form.fieldErrors = fieldErrors;
            form.errors = (0, _helpersUniq2['default'])(errors);
            iteration++;
        } while (this.props.circular && iteration < refLength && JSON.stringify(form) !== JSON.stringify(oldForm));

        form.valid = !form.errors.length;

        return form;
    },

    onChange: function onChange() {
        this.props.onChange(this.serialize());
    },

    onSubmit: function onSubmit(event) {
        event && event.preventDefault && event.preventDefault();
        this.props.onSubmit(this.serialize());
    },

    onKeyDown: function onKeyDown(event) {
        if (event.key === 'Enter') {
            this.onSubmit(event);
        }
    },

    showFieldErrors: function showFieldErrors() {
        var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        if (typeof props !== 'object') throw 'Bad props passed to showErrors';

        var _serialize = this.serialize();

        var fieldErrors = _serialize.fieldErrors;

        // Validate our props object
        var vals = (0, _helpersValues2['default'])(props);
        var hasIncludes = vals.indexOf(1) !== -1;
        var hasExcludes = vals.indexOf(0) !== -1;

        if (hasIncludes && hasExcludes) throw 'You can not include and exclude in showErrors';

        var propKeys = (0, _helpersKeys2['default'])(props);

        // Set our internal state to house all our errors. This will pass down
        // errors to each component
        var shownErrors = hasIncludes ? (0, _helpersPick2['default'])(propKeys, fieldErrors) : (0, _helpersOmit2['default'])(propKeys, fieldErrors);

        this.setState({ fieldErrors: shownErrors });

        return (0, _helpersUniq2['default'])(deNestErrors(shownErrors));
    },

    clearFieldErrors: function clearFieldErrors() {
        this.setState({
            fieldErrors: []
        });
    },

    render: function render() {
        var _this = this;

        // Define our helpers for cloneing our children
        var childNames = [];
        var clonePred = function clonePred(child) {
            return child.props && child.props.name;
        };
        var cloneProps = function cloneProps(child) {
            (0, _warning2['default'])(!child.ref, 'Attempting to attach ref "' + child.ref + '" to "' + child.props.name + '" will be bad for your health');

            (0, _warning2['default'])(childNames.indexOf(child.props.name) === -1, 'Duplicate name "' + child.props.name + '" found. Duplicate fields will be ignored');

            childNames = childNames.concat(child.props.name);

            return {
                ref: child.ref || child.props.name,
                onChange: (0, _helpersCompose2['default'])(child.props.onChange || _helpersIdentity2['default'], _this.onChange),
                onSubmit: (0, _helpersCompose2['default'])(child.props.onSubmit || _helpersIdentity2['default'], _this.onSubmit),
                errors: child.props.errors || _this.state.fieldErrors[child.props.name] || []
            };
        };

        return _react2['default'].createElement(
            'form',
            _extends({}, this.props, {
                ref: 'form',
                className: 'testingggg',
                onSubmit: this.onSubmit,
                onChange: function () {},
                onKeyDown: this.onKeyDown }),
            (0, _helpersCloneChildren2['default'])(clonePred, cloneProps, this.props.children)
        );
    }
});

},{"./helpers/cloneChildren":5,"./helpers/compose":6,"./helpers/identity":7,"./helpers/keys":8,"./helpers/omit":9,"./helpers/pick":10,"./helpers/uniq":11,"./helpers/values":12,"react":undefined,"warning":1}],5:[function(require,module,exports){
/*eslint func-style:0*/
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = cloneChildren;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

/**
 * Clones a child subtree, when we encounter a component that passes our
 * predicate pass it down additional props.
 *
 * @param  {Function} predicate A predicate function which recives the child
 * @param  {Function} getProps  A function which recives the component and
 * returns an object which gets merged into the props of the component
 * @param  {Function} children The children to iterate over
 * @return {Object} The cloned children
 */

function cloneChildren(predicate, getProps, children) {
    if (typeof children !== 'object' || children === null) {
        return children;
    }

    return _react2['default'].Children.map(children, function (child) {
        if (typeof child !== 'object' || child === null) {
            return child;
        }

        if (predicate(child)) {
            return _react2['default'].cloneElement(child, getProps(child), child.props && child.props.children);
        }

        return _react2['default'].cloneElement(child, {}, cloneChildren(predicate, getProps, child.props && child.props.children));
    });
}

module.exports = exports['default'];

},{"react":undefined}],6:[function(require,module,exports){
/*eslint func-style:0*/

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = compose;

function compose(f2, f1) {
    return function () {
        return f2(f1.apply(undefined, arguments));
    };
}

module.exports = exports["default"];

},{}],7:[function(require,module,exports){
/*eslint func-style:0*/
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = identity;

function identity(x) {
    return x;
}

module.exports = exports["default"];

},{}],8:[function(require,module,exports){
/*eslint func-style:0*/
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = keys;

function keys(obj) {
    return Object.keys(obj);
}

module.exports = exports["default"];

},{}],9:[function(require,module,exports){
/*eslint func-style:0*/
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = omit;

function omit(names, obj) {
    var result = {};

    for (var prop in obj) {
        if (names.indexOf(prop) === -1) {
            result[prop] = obj[prop];
        }
    }

    return result;
}

module.exports = exports["default"];

},{}],10:[function(require,module,exports){
/*eslint func-style:0*/
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = pick;

function pick(names, obj) {
    var result = {};
    var idx = 0;

    while (idx < names.length) {
        if (names[idx] in obj) {
            result[names[idx]] = obj[names[idx]];
        }
        idx += 1;
    }

    return result;
}

module.exports = exports["default"];

},{}],11:[function(require,module,exports){
/*eslint func-style:0*/
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = uniq;

function uniq(arr) {
    return arr.reduce(function (memo, item) {
        return memo.indexOf(item) === -1 ? memo.concat(item) : memo;
    }, []);
}

module.exports = exports["default"];

},{}],12:[function(require,module,exports){
/*eslint func-style:0*/
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = values;

function values(obj) {
    var ret = [];

    for (var key in obj) {
        ret = ret.concat(obj[key]);
    }
    return ret;
}

module.exports = exports["default"];

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var identity = function identity(x) {
    return x;
};

exports['default'] = _react2['default'].createClass({
    displayName: 'input',

    propTypes: {
        errors: _react.PropTypes.arrayOf(_react.PropTypes.string)
    },

    getDefaultProps: function getDefaultProps() {
        return {
            onChange: identity,
            onSubmit: identity
        };
    },

    getValue: function getValue() {
        return this.refs.input.value;
    },

    render: function render() {
        var hasError = this.props.errors && this.props.errors.length;

        var style = {
            border: '1px solid ' + (hasError ? 'red' : 'black')
        };

        return _react2['default'].createElement('input', _extends({}, this.props, {
            ref: 'input',
            style: style }));
    }
});
module.exports = exports['default'];

},{"react":undefined}],"react-formable":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _form = require('./form');

var _form2 = _interopRequireDefault(_form);

var _fieldset = require('./fieldset');

var _fieldset2 = _interopRequireDefault(_fieldset);

var _fieldlist = require('./fieldlist');

var _fieldlist2 = _interopRequireDefault(_fieldlist);

var _inputsInput = require('./inputs/input');

var _inputsInput2 = _interopRequireDefault(_inputsInput);

exports.Form = _form2['default'];
exports.getBlankForm = _form.getBlankForm;
exports.Fieldset = _fieldset2['default'];
exports.Fieldlist = _fieldlist2['default'];
exports.Input = _inputsInput2['default'];
exports['default'] = _form2['default'];

},{"./fieldlist":2,"./fieldset":3,"./form":4,"./inputs/input":13}]},{},[]);

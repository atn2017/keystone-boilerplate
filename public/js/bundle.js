var app = (function () {
'use strict';

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var actualCreateOut;

function setCreateOut(createOutFunc) {
    actualCreateOut = createOutFunc;
}

function createOut$2(globalData) {
    return actualCreateOut(globalData);
}

createOut$2.___setCreateOut = setCreateOut;

var createOut_1 = createOut$2;

/* jshint newcap:false */
var slice = Array.prototype.slice;

function isFunction(arg) {
    return typeof arg === 'function';
}

function checkListener(listener) {
    if (!isFunction(listener)) {
        throw TypeError('Invalid listener');
    }
}

function invokeListener(ee, listener, args) {
    switch (args.length) {
        // fast cases
        case 1:
            listener.call(ee);
            break;
        case 2:
            listener.call(ee, args[1]);
            break;
        case 3:
            listener.call(ee, args[1], args[2]);
            break;
            // slower
        default:
            listener.apply(ee, slice.call(args, 1));
    }
}

function addListener(eventEmitter, type, listener, prepend) {
    checkListener(listener);

    var events = eventEmitter.$e || (eventEmitter.$e = {});

    var listeners = events[type];
    if (listeners) {
        if (isFunction(listeners)) {
            events[type] = prepend ? [listener, listeners] : [listeners, listener];
        } else {
            if (prepend) {
                listeners.unshift(listener);
            } else {
                listeners.push(listener);
            }
        }

    } else {
        events[type] = listener;
    }
    return eventEmitter;
}

function EventEmitter() {
    this.$e = this.$e || {};
}

EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype = {
    $e: null,

    emit: function(type) {
        var args = arguments;

        var events = this.$e;
        if (!events) {
            return;
        }

        var listeners = events && events[type];
        if (!listeners) {
            // If there is no 'error' event listener then throw.
            if (type === 'error') {
                var error = args[1];
                if (!(error instanceof Error)) {
                    var context = error;
                    error = new Error('Error: ' + context);
                    error.context = context;
                }

                throw error; // Unhandled 'error' event
            }

            return false;
        }

        if (isFunction(listeners)) {
            invokeListener(this, listeners, args);
        } else {
            listeners = slice.call(listeners);

            for (var i=0, len=listeners.length; i<len; i++) {
                var listener = listeners[i];
                invokeListener(this, listener, args);
            }
        }

        return true;
    },

    on: function(type, listener) {
        return addListener(this, type, listener, false);
    },

    prependListener: function(type, listener) {
        return addListener(this, type, listener, true);
    },

    once: function(type, listener) {
        checkListener(listener);

        function g() {
            this.removeListener(type, g);

            if (listener) {
                listener.apply(this, arguments);
                listener = null;
            }
        }

        this.on(type, g);

        return this;
    },

    // emits a 'removeListener' event iff the listener was removed
    removeListener: function(type, listener) {
        checkListener(listener);

        var events = this.$e;
        var listeners;

        if (events && (listeners = events[type])) {
            if (isFunction(listeners)) {
                if (listeners === listener) {
                    delete events[type];
                }
            } else {
                for (var i=listeners.length-1; i>=0; i--) {
                    if (listeners[i] === listener) {
                        listeners.splice(i, 1);
                    }
                }
            }
        }

        return this;
    },

    removeAllListeners: function(type) {
        var events = this.$e;
        if (events) {
            delete events[type];
        }
    },

    listenerCount: function(type) {
        var events = this.$e;
        var listeners = events && events[type];
        return listeners ? (isFunction(listeners) ? 1 : listeners.length) : 0;
    }
};

var src = EventEmitter;

function syncBooleanAttrProp(fromEl, toEl, name) {
    if (fromEl[name] !== toEl[name]) {
        fromEl[name] = toEl[name];
        if (fromEl[name]) {
            fromEl.setAttribute(name, '');
        } else {
            fromEl.removeAttribute(name, '');
        }
    }
}

var specialElHandlers = {
    /**
     * Needed for IE. Apparently IE doesn't think that "selected" is an
     * attribute when reading over the attributes using selectEl.attributes
     */
    OPTION: function(fromEl, toEl) {
        syncBooleanAttrProp(fromEl, toEl, 'selected');
    },
    /**
     * The "value" attribute is special for the <input> element since it sets
     * the initial value. Changing the "value" attribute without changing the
     * "value" property will have no effect since it is only used to the set the
     * initial value.  Similar for the "checked" attribute, and "disabled".
     */
    INPUT: function(fromEl, toEl) {
        syncBooleanAttrProp(fromEl, toEl, 'checked');
        syncBooleanAttrProp(fromEl, toEl, 'disabled');

        if (fromEl.value != toEl.value) {
            fromEl.value = toEl.value;
        }

        if (!toEl.___hasAttribute('value')) {
            fromEl.removeAttribute('value');
        }
    },

    TEXTAREA: function(fromEl, toEl) {
        var newValue = toEl.value;
        if (fromEl.value != newValue) {
            fromEl.value = newValue;
        }

        var firstChild = fromEl.firstChild;
        if (firstChild) {
            // Needed for IE. Apparently IE sets the placeholder as the
            // node value and vise versa. This ignores an empty update.
            var oldValue = firstChild.nodeValue;

            if (oldValue == newValue || (!newValue && oldValue == fromEl.placeholder)) {
                return;
            }

            firstChild.nodeValue = newValue;
        }
    },
    SELECT: function(fromEl, toEl) {
        if (!toEl.___hasAttribute('multiple')) {
            var selectedIndex = -1;
            var i = 0;
            var curChild = toEl.___firstChild;
            while(curChild) {
                if (curChild.___nodeName == 'OPTION') {
                    if (curChild.___hasAttribute('selected')) {
                        selectedIndex = i;
                        break;
                    }
                    i++;
                }
                curChild = curChild.___nextSibling;
            }

            fromEl.selectedIndex = i;
        }
    }
};

/* jshint newcap:false */


function VNode() {}

VNode.prototype = {
    ___VNode: function(finalChildCount) {
        this.___finalChildCount = finalChildCount;
        this.___childCount = 0;
        this.___firstChildInternal = null;
        this.___lastChild = null;
        this.___parentNode = null;
        this.___nextSiblingInternal = null;
    },

    get ___firstChild() {
        var firstChild = this.___firstChildInternal;

        if (firstChild && firstChild.___DocumentFragment) {
            var nestedFirstChild = firstChild.___firstChild;
            // The first child is a DocumentFragment node.
            // If the DocumentFragment node has a first child then we will return that.
            // Otherwise, the DocumentFragment node is not *really* the first child and
            // we need to skip to its next sibling
            return nestedFirstChild || firstChild.___nextSibling;
        }

        return firstChild;
    },

    get ___nextSibling() {
        var nextSibling = this.___nextSiblingInternal;

        if (nextSibling) {
            if (nextSibling.___DocumentFragment) {
                var firstChild = nextSibling.___firstChild;
                return firstChild || nextSibling.___nextSibling;
            }
        } else {
            var parentNode = this.___parentNode;
            if (parentNode && parentNode.___DocumentFragment) {
                return parentNode.___nextSibling;
            }
        }

        return nextSibling;
    },

    ___appendChild: function(child) {
        this.___childCount++;

        if (this.___isTextArea) {
            if (child.___Text) {
                var childValue = child.___nodeValue;
                this.___value = (this.___value || '') + childValue;
            } else {
                throw TypeError();
            }
        } else {
            var lastChild = this.___lastChild;

            child.___parentNode = this;

            if (lastChild) {
                lastChild.___nextSiblingInternal = child;
            } else {
                this.___firstChildInternal = child;
            }

            this.___lastChild = child;
        }

        return child;
    },

    ___finishChild: function finishChild() {
        if (this.___childCount == this.___finalChildCount && this.___parentNode) {
            return this.___parentNode.___finishChild();
        } else {
            return this;
        }
    },

    actualize: function(doc) {
        var actualNode = this.___actualize(doc);

        var curChild = this.___firstChild;

        while(curChild) {
            actualNode.appendChild(curChild.actualize(doc));
            curChild = curChild.___nextSibling;
        }

        if (this.___nodeType === 1) {
            var elHandler = specialElHandlers[this.___nodeName];
            if (elHandler !== undefined) {
                elHandler(actualNode, this);
            }
        }

        return actualNode;
    }

    // ,toJSON: function() {
    //     var clone = Object.assign({
    //         nodeType: this.nodeType
    //     }, this);
    //
    //     for (var k in clone) {
    //         if (k.startsWith('_')) {
    //             delete clone[k];
    //         }
    //     }
    //     delete clone._nextSibling;
    //     delete clone._lastChild;
    //     delete clone.parentNode;
    //     return clone;
    // }
};

var VNode_1 = VNode;

var copyProps = function copyProps(from, to) {
    Object.getOwnPropertyNames(from).forEach(function(name) {
        var descriptor = Object.getOwnPropertyDescriptor(from, name);
        Object.defineProperty(to, name, descriptor);
    });
};

function inherit(ctor, superCtor, shouldCopyProps) {
    var oldProto = ctor.prototype;
    var newProto = ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
            value: ctor,
            writable: true,
            configurable: true
        }
    });
    if (oldProto && shouldCopyProps !== false) {
        copyProps(oldProto, newProto);
    }
    ctor.$super = superCtor;
    ctor.prototype = newProto;
    return ctor;
}


var inherit_1 = inherit;
inherit._inherit = inherit;

function VComment$1(value) {
    this.___VNode(-1 /* no children */);
    this.___nodeValue = value;
}

VComment$1.prototype = {
    ___nodeType: 8,

    ___actualize: function(doc) {
        return doc.createComment(this.___nodeValue);
    },

    ___cloneNode: function() {
        return new VComment$1(this.___nodeValue);
    }
};

inherit_1(VComment$1, VNode_1);

var VComment_1 = VComment$1;

var extend = function extend(target, source) { //A simple function to copy properties from one object to another
    if (!target) { //Check if a target was provided, otherwise create a new empty object to return
        target = {};
    }

    if (source) {
        for (var propName in source) {
            if (source.hasOwnProperty(propName)) { //Only look at source properties that are not inherited
                target[propName] = source[propName]; //Copy the property
            }
        }
    }

    return target;
};

function VDocumentFragmentClone(other) {
    extend(this, other);
    this.___parentNode = null;
    this.___nextSiblingInternal = null;
}

function VDocumentFragment$1(documentFragment) {
    this.___VNode(null /* childCount */);
}

VDocumentFragment$1.prototype = {
    ___nodeType: 11,

    ___DocumentFragment: true,

    ___cloneNode: function() {
        return new VDocumentFragmentClone(this);
    },

    ___actualize: function(doc) {
        return doc.createDocumentFragment();
    }
};

inherit_1(VDocumentFragment$1, VNode_1);

VDocumentFragmentClone.prototype = VDocumentFragment$1.prototype;

var VDocumentFragment_1 = VDocumentFragment$1;

var NS_XLINK = 'http://www.w3.org/1999/xlink';
var ATTR_XLINK_HREF = 'xlink:href';
var toString = String;

var FLAG_IS_SVG = 1;
var FLAG_IS_TEXTAREA$1 = 2;
var FLAG_SIMPLE_ATTRS = 4;

var defineProperty = Object.defineProperty;

var ATTR_HREF = 'href';
var EMPTY_OBJECT = Object.freeze({});

function convertAttrValue(type, value) {
    if (value === true) {
        return '';
    } else if (type == 'object') {
        return JSON.stringify(value);
    } else {
        return toString(value);
    }
}

function setAttribute(el, namespaceURI, name, value) {
    if (namespaceURI === null) {
        el.setAttribute(name, value);
    } else {
        el.setAttributeNS(namespaceURI, name, value);
    }
}

function removeAttribute(el, namespaceURI, name) {
    if (namespaceURI === null) {
        el.removeAttribute(name);
    } else {
        el.removeAttributeNS(namespaceURI, name);
    }
}

function VElementClone(other) {
    this.___firstChildInternal = other.___firstChildInternal;
    this.___parentNode = null;
    this.___nextSiblingInternal = null;

    this.___attributes = other.___attributes;
    this.___properties = other.___properties;
    this.___namespaceURI = other.___namespaceURI;
    this.___nodeName = other.___nodeName;
    this.___flags = other.___flags;
    this.___value = other.___value;
    this.___constId = other.___constId;
}

function VElement$1(tagName, attrs, childCount, flags, props) {
    this.___VNode(childCount);

    var constId, namespaceURI;

    if (props) {
        constId = props.c;
    }

    if ((this.___flags = flags || 0)) {
        if (flags & FLAG_IS_SVG) {
            namespaceURI = 'http://www.w3.org/2000/svg';
        }
    }

    this.___attributes = attrs || EMPTY_OBJECT;
    this.___properties = props || EMPTY_OBJECT;
    this.___namespaceURI = namespaceURI;
    this.___nodeName = tagName;
    this.___value = null;
    this.___constId = constId;
}

VElement$1.prototype = {
    ___VElement: true,

    ___nodeType: 1,

    ___cloneNode: function() {
        return new VElementClone(this);
    },

    /**
     * Shorthand method for creating and appending an HTML element
     *
     * @param  {String} tagName    The tag name (e.g. "div")
     * @param  {int|null} attrCount  The number of attributes (or `null` if not known)
     * @param  {int|null} childCount The number of child nodes (or `null` if not known)
     */
    e: function(tagName, attrs, childCount, flags, props) {
        var child = this.___appendChild(new VElement$1(tagName, attrs, childCount, flags, props));

        if (childCount === 0) {
            return this.___finishChild();
        } else {
            return child;
        }
    },

    /**
     * Shorthand method for creating and appending an HTML element with a dynamic namespace
     *
     * @param  {String} tagName    The tag name (e.g. "div")
     * @param  {int|null} attrCount  The number of attributes (or `null` if not known)
     * @param  {int|null} childCount The number of child nodes (or `null` if not known)
     */
    ed: function(tagName, attrs, childCount, flags, props) {
        var child = this.___appendChild(VElement$1.___createElementDynamicTag(tagName, attrs, childCount, flags, props));

        if (childCount === 0) {
            return this.___finishChild();
        } else {
            return child;
        }
    },

    /**
     * Shorthand method for creating and appending a static node. The provided node is automatically cloned
     * using a shallow clone since it will be mutated as a result of setting `nextSibling` and `parentNode`.
     *
     * @param  {String} value The value for the new Comment node
     */
    n: function(node) {
        this.___appendChild(node.___cloneNode());
        return this.___finishChild();
    },

    ___actualize: function(doc) {
        var namespaceURI = this.___namespaceURI;
        var tagName = this.___nodeName;

        var attributes = this.___attributes;
        var flags = this.___flags;

        var el = namespaceURI !== undefined ?
            doc.createElementNS(namespaceURI, tagName) :
            doc.createElement(tagName);

        for (var attrName in attributes) {
            var attrValue = attributes[attrName];

            if (attrValue !== false && attrValue != null) {
                var type = typeof attrValue;

                if (type !== 'string') {
                    // Special attributes aren't copied to the real DOM. They are only
                    // kept in the virtual attributes map
                    attrValue = convertAttrValue(type, attrValue);
                }

                if (attrName == ATTR_XLINK_HREF) {
                    setAttribute(el, NS_XLINK, ATTR_HREF, attrValue);
                } else {
                    el.setAttribute(attrName, attrValue);
                }
            }
        }

        if (flags & FLAG_IS_TEXTAREA$1) {
            el.value = this.___value;
        }

        el._vattrs = attributes;
        el._vprops = this.___properties;
        el._vflags = flags;

        return el;
    },

    ___hasAttribute: function(name) {
        // We don't care about the namespaces since the there
        // is no chance that attributes with the same name will have
        // different namespaces
        var value = this.___attributes[name];
        return value != null && value !== false;
    },
};

inherit_1(VElement$1, VNode_1);

var proto$1 = VElementClone.prototype = VElement$1.prototype;

['checked', 'selected', 'disabled'].forEach(function(name) {
    defineProperty(proto$1, name, {
        get: function () {
            var value = this.___attributes[name];
            return value !== false && value != null;
        }
    });
});

defineProperty(proto$1, 'id', {
    get: function () {
        return this.___attributes.id;
    }
});

defineProperty(proto$1, 'value', {
    get: function () {
        var value = this.___value;
        if (value == null) {
            value = this.___attributes.value;
        }
        return value != null ? toString(value) : '';
    }
});

defineProperty(proto$1, '___isTextArea', {
    get: function () {
        return this.___flags & FLAG_IS_TEXTAREA$1;
    }
});

VElement$1.___createElementDynamicTag = function(tagName, attrs, childCount, flags, props) {
    var namespace = attrs && attrs.xmlns;
    tagName = namespace ? tagName : tagName.toUpperCase();
    var element = new VElement$1(tagName, attrs, childCount, flags, props);
    element.___namespaceURI = namespace;
    return element;
};

VElement$1.___removePreservedAttributes = function(attrs) {
    // By default this static method is a no-op, but if there are any
    // compiled components that have "no-update" attributes then
    // `preserve-attrs.js` will be imported and this method will be replaced
    // with a method that actually does something
    return attrs;
};

VElement$1.___morphAttrs = function(fromEl, toEl) {

    var removePreservedAttributes = VElement$1.___removePreservedAttributes;

    var attrs = toEl.___attributes;
    var props = fromEl._vprops = toEl.___properties;

    var attrName;
    var i;

    // We use expando properties to associate the previous HTML
    // attributes provided as part of the VDOM node with the
    // real VElement DOM node. When diffing attributes,
    // we only use our internal representation of the attributes.
    // When diffing for the first time it's possible that the
    // real VElement node will not have the expando property
    // so we build the attribute map from the expando property

    var oldAttrs = fromEl._vattrs;

    if (oldAttrs) {
        if (oldAttrs == attrs) {
            // For constant attributes the same object will be provided
            // every render and we can use that to our advantage to
            // not waste time diffing a constant, immutable attribute
            // map.
            return;
        } else {
            oldAttrs = removePreservedAttributes(oldAttrs, props, true);
        }
    } else {
        // We need to build the attribute map from the real attributes
        oldAttrs = {};

        var oldAttributesList = fromEl.attributes;
        for (i = oldAttributesList.length - 1; i >= 0; --i) {
            var attr = oldAttributesList[i];

            if (attr.specified !== false) {
                attrName = attr.name;
                if (attrName !== 'data-marko') {
                    var attrNamespaceURI = attr.namespaceURI;
                    if (attrNamespaceURI === NS_XLINK) {
                        oldAttrs[ATTR_XLINK_HREF] = attr.value;
                    } else {
                        oldAttrs[attrName] = attr.value;
                    }
                }
            }
        }

        // We don't want preserved attributes to show up in either the old
        // or new attribute map.
        removePreservedAttributes(oldAttrs, props, false);
    }

    fromEl._vattrs = attrs;

    var attrValue;

    var flags = toEl.___flags;
    var oldFlags;

    if (flags & FLAG_SIMPLE_ATTRS && ((oldFlags = fromEl._vflags) & FLAG_SIMPLE_ATTRS)) {
        if (oldAttrs['class'] !== (attrValue = attrs['class'])) {
            fromEl.className = attrValue;
        }
        if (oldAttrs.id !== (attrValue = attrs.id)) {
            fromEl.id = attrValue;
        }
        if (oldAttrs.style !== (attrValue = attrs.style)) {
            fromEl.style.cssText = attrValue;
        }
        return;
    }

    // In some cases we only want to set an attribute value for the first
    // render or we don't want certain attributes to be touched. To support
    // that use case we delete out all of the preserved attributes
    // so it's as if they never existed.
    attrs = removePreservedAttributes(attrs, props, true);

    var namespaceURI;

    // Loop over all of the attributes in the attribute map and compare
    // them to the value in the old map. However, if the value is
    // null/undefined/false then we want to remove the attribute
    for (attrName in attrs) {
        attrValue = attrs[attrName];
        namespaceURI = null;

        if (attrName === ATTR_XLINK_HREF) {
            namespaceURI = NS_XLINK;
            attrName = ATTR_HREF;
        }

        if (attrValue == null || attrValue === false) {
            removeAttribute(fromEl, namespaceURI, attrName);
        } else if (oldAttrs[attrName] !== attrValue) {
            var type = typeof attrValue;

            if (type !== 'string') {
                attrValue = convertAttrValue(type, attrValue);
            }

            setAttribute(fromEl, namespaceURI, attrName, attrValue);
        }
    }

    // If there are any old attributes that are not in the new set of attributes
    // then we need to remove those attributes from the target node
    //
    // NOTE: We can skip this if the the element is keyed because if the element
    //       is keyed then we know we already processed all of the attributes for
    //       both the target and original element since target VElement nodes will
    //       have all attributes declared. However, we can only skip if the node
    //       was not a virtualized node (i.e., a node that was not rendered by a
    //       Marko template, but rather a node that was created from an HTML
    //       string or a real DOM node).
    if (!attrs.id || props.___virtualized === true) {
        for (attrName in oldAttrs) {
            if (!(attrName in attrs)) {
                if (attrName === ATTR_XLINK_HREF) {
                    fromEl.removeAttributeNS(ATTR_XLINK_HREF, ATTR_HREF);
                } else {
                    fromEl.removeAttribute(attrName);
                }
            }
        }
    }
};

var VElement_1 = VElement$1;

function VText$1(value) {
    this.___VNode(-1 /* no children */);
    this.___nodeValue = value;
}

VText$1.prototype = {
    ___Text: true,

    ___nodeType: 3,

    ___actualize: function(doc) {
        return doc.createTextNode(this.___nodeValue);
    },

    ___cloneNode: function() {
        return new VText$1(this.___nodeValue);
    }
};

inherit_1(VText$1, VNode_1);

var VText_1 = VText$1;

var FLAG_IS_TEXTAREA = 2;
var defaultDocument$1 = typeof document != 'undefined' && document;
var specialHtmlRegexp = /[&<]/;
var xmlnsRegExp = /^xmlns(:|$)/;
var virtualizedProps = { ___virtualized: true };

function virtualizeChildNodes(node, vdomParent) {
    var curChild = node.firstChild;
    while(curChild) {
        vdomParent.___appendChild(virtualize(curChild));
        curChild = curChild.nextSibling;
    }
}

function virtualize(node) {
    switch(node.nodeType) {
        case 1:
            var attributes = node.attributes;
            var attrCount = attributes.length;

            var attrs;

            if (attrCount) {
                attrs = {};
                for (var i=0; i<attrCount; i++) {
                    var attr = attributes[i];
                    var attrName = attr.name;
                    if (!xmlnsRegExp.test(attrName)) {
                        attrs[attrName] = attr.value;
                    }
                }
            }

            var flags = 0;

            var tagName = node.nodeName;
            if (tagName === 'TEXTAREA') {
                flags |= FLAG_IS_TEXTAREA;
            }

            var vdomEl = new VElement_1(tagName, attrs, null, flags, virtualizedProps);
            if (node.namespaceURI !== 'http://www.w3.org/1999/xhtml') {
                vdomEl.___namespaceURI = node.namespaceURI;
            }

            if (vdomEl.___isTextArea) {
                vdomEl.___value = node.value;
            } else {
                virtualizeChildNodes(node, vdomEl);
            }

            return vdomEl;
        case 3:
            return new VText_1(node.nodeValue);
        case 8:
            return new VComment_1(node.nodeValue);
        case 11:
            var vdomDocFragment = new VDocumentFragment_1();
            virtualizeChildNodes(node, vdomDocFragment);
            return vdomDocFragment;
    }
}

function virtualizeHTML$1(html, doc) {
    if (!specialHtmlRegexp.test(html)) {
        return new VText_1(html);
    }

    var container = doc.createElement('body');
    container.innerHTML = html;
    var vdomFragment = new VDocumentFragment_1();

    var curChild = container.firstChild;
    while(curChild) {
        vdomFragment.___appendChild(virtualize(curChild));
        curChild = curChild.nextSibling;
    }

    return vdomFragment;
}

var Node_prototype = VNode_1.prototype;

/**
 * Shorthand method for creating and appending a Text node with a given value
 * @param  {String} value The text value for the new Text node
 */
Node_prototype.t = function(value) {
    var type = typeof value;
    var vdomNode;

    if (type !== 'string') {
        if (value == null) {
            value = '';
        } else if (type === 'object') {
            if (value.toHTML) {
                vdomNode = virtualizeHTML$1(value.toHTML(), document);
            }
        }
    }

    this.___appendChild(vdomNode || new VText_1(value.toString()));
    return this.___finishChild();
};

/**
 * Shorthand method for creating and appending a Comment node with a given value
 * @param  {String} value The value for the new Comment node
 */
Node_prototype.c = function(value) {
    this.___appendChild(new VComment_1(value));
    return this.___finishChild();
};

Node_prototype.___appendDocumentFragment = function() {
    return this.___appendChild(new VDocumentFragment_1());
};

var ___VComment = VComment_1;
var ___VDocumentFragment = VDocumentFragment_1;
var ___VElement = VElement_1;
var ___VText = VText_1;
var ___virtualize = virtualize;
var ___virtualizeHTML = virtualizeHTML$1;
var ___defaultDocument = defaultDocument$1;

var vdom$4 = {
	___VComment: ___VComment,
	___VDocumentFragment: ___VDocumentFragment,
	___VElement: ___VElement,
	___VText: ___VText,
	___virtualize: ___virtualize,
	___virtualizeHTML: ___virtualizeHTML,
	___defaultDocument: ___defaultDocument
};

var markoGlobal = extend(window.$MG, {
  uid: 0
});

window.$MG = markoGlobal;

var runtimeId = markoGlobal.uid++;

var componentLookup = {};

var defaultDocument$2 = document;
var EMPTY_OBJECT$1 = {};

function getComponentForEl(el, doc) {
    if (el) {
        var node = typeof el == 'string' ? (doc || defaultDocument$2).getElementById(el) : el;
        if (node) {
            var component = node._w;

            while(component) {
                var rootFor = component.___rootFor;
                if (rootFor)  {
                    component = rootFor;
                } else {
                    break;
                }
            }

            return component;
        }
    }
}

var lifecycleEventMethods = {};

[
    'create',
    'render',
    'update',
    'mount',
    'destroy'
].forEach(function(eventName) {
    lifecycleEventMethods[eventName] = 'on' + eventName[0].toUpperCase() + eventName.substring(1);
});

/**
 * This method handles invoking a component's event handler method
 * (if present) while also emitting the event through
 * the standard EventEmitter.prototype.emit method.
 *
 * Special events and their corresponding handler methods
 * include the following:
 *
 * beforeDestroy --> onBeforeDestroy
 * destroy       --> onDestroy
 * beforeUpdate  --> onBeforeUpdate
 * update        --> onUpdate
 * render        --> onRender
 */
function emitLifecycleEvent(component, eventType, eventArg1, eventArg2) {
    var listenerMethod = component[lifecycleEventMethods[eventType]];

    if (listenerMethod !== undefined) {
        listenerMethod.call(component, eventArg1, eventArg2);
    }

    component.emit(eventType, eventArg1, eventArg2);
}

function destroyComponentForEl$1(el) {
    var componentToDestroy = el._w;
    if (componentToDestroy) {
        componentToDestroy.___destroyShallow();
        el._w = null;

        while ((componentToDestroy = componentToDestroy.___rootFor)) {
            componentToDestroy.___rootFor = null;
            componentToDestroy.___destroyShallow();
        }
    }
}
function destroyElRecursive$1(el) {
    var curChild = el.firstChild;
    while(curChild) {
        if (curChild.nodeType === 1) {
            destroyComponentForEl$1(curChild);
            destroyElRecursive$1(curChild);
        }
        curChild = curChild.nextSibling;
    }
}

function nextComponentId() {
    // Each component will get an ID that is unique across all loaded
    // marko runtimes. This allows multiple instances of marko to be
    // loaded in the same window and they should all place nice
    // together
    return 'b' + ((markoGlobal.uid)++);
}

function nextComponentIdProvider(out) {
    return nextComponentId;
}

function getElementById(doc, id) {
    return doc.getElementById(id);
}

function attachBubblingEvent(componentDef, handlerMethodName, extraArgs) {
    if (handlerMethodName) {
        var id = componentDef.id;
        if (extraArgs) {
            var isRerenderInBrowser = componentDef.___globalComponentsContext.___isRerenderInBrowser;

            if (isRerenderInBrowser === true) {
                // If we are bootstrapping a page rendered on the server
                // we need to put the actual event args on the UI component
                // since we will not actually be updating the DOM
                var component = componentDef.___component;

                var bubblingDomEvents = component.___bubblingDomEvents ||
                    ( component.___bubblingDomEvents = [] );

                bubblingDomEvents.push(extraArgs);

                return;
            } else {
                return [handlerMethodName, id, extraArgs];
            }
        } else {
            return [handlerMethodName, id];
        }
    }
}

function getMarkoPropsFromEl(el) {
    var virtualProps = el._vprops;
    if (virtualProps === undefined) {
        virtualProps = el.getAttribute('data-marko');
        if (virtualProps) {
            virtualProps = JSON.parse(virtualProps);
        }
        el._vprops = virtualProps = virtualProps || EMPTY_OBJECT$1;
    }

    return virtualProps;
}

var ___runtimeId = runtimeId;
var ___componentLookup = componentLookup;
var ___getComponentForEl = getComponentForEl;
var ___emitLifecycleEvent = emitLifecycleEvent;
var ___destroyComponentForEl = destroyComponentForEl$1;
var ___destroyElRecursive = destroyElRecursive$1;
var ___nextComponentIdProvider = nextComponentIdProvider;
var ___getElementById = getElementById;
var ___attachBubblingEvent = attachBubblingEvent;
var ___getMarkoPropsFromEl = getMarkoPropsFromEl;

var utilBrowser = {
	___runtimeId: ___runtimeId,
	___componentLookup: ___componentLookup,
	___getComponentForEl: ___getComponentForEl,
	___emitLifecycleEvent: ___emitLifecycleEvent,
	___destroyComponentForEl: ___destroyComponentForEl,
	___destroyElRecursive: ___destroyElRecursive,
	___nextComponentIdProvider: ___nextComponentIdProvider,
	___getElementById: ___getElementById,
	___attachBubblingEvent: ___attachBubblingEvent,
	___getMarkoPropsFromEl: ___getMarkoPropsFromEl
};

var destroyComponentForEl = utilBrowser.___destroyComponentForEl;
var destroyElRecursive = utilBrowser.___destroyElRecursive;

function resolveEl(el) {
    if (typeof el == 'string') {
        var elId = el;
        el = document.getElementById(elId);
        if (!el) {
            throw Error('Not found: ' + elId);
        }
    }
    return el;
}

function beforeRemove(referenceEl) {
    destroyElRecursive(referenceEl);
    destroyComponentForEl(referenceEl);
}

var domInsert = function(target, getEl, afterInsert) {
    extend(target, {
        appendTo: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);
            referenceEl.appendChild(el);
            return afterInsert(this, referenceEl);
        },
        prependTo: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);
            referenceEl.insertBefore(el, referenceEl.firstChild || null);
            return afterInsert(this, referenceEl);
        },
        replace: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);
            beforeRemove(referenceEl);
            referenceEl.parentNode.replaceChild(el, referenceEl);
            return afterInsert(this, referenceEl);
        },
        replaceChildrenOf: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);

            var curChild = referenceEl.firstChild;
            while(curChild) {
                var nextSibling = curChild.nextSibling; // Just in case the DOM changes while removing
                if (curChild.nodeType == 1) {
                    beforeRemove(curChild);
                }
                curChild = nextSibling;
            }

            referenceEl.innerHTML = '';
            referenceEl.appendChild(el);
            return afterInsert(this, referenceEl);
        },
        insertBefore: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);
            referenceEl.parentNode.insertBefore(el, referenceEl);
            return afterInsert(this, referenceEl);
        },
        insertAfter: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);
            el = el;
            var nextSibling = referenceEl.nextSibling;
            var parentNode = referenceEl.parentNode;
            if (nextSibling) {
                parentNode.insertBefore(el, nextSibling);
            } else {
                parentNode.appendChild(el);
            }
            return afterInsert(this, referenceEl);
        }
    });
};

function getComponentDefs(result) {
    var componentDefs = result.___components;

    if (!componentDefs) {
        throw Error('No component');
    }
    return componentDefs;
}

function RenderResult(out) {
   this.out = this.___out = out;
   this.___components = undefined;
}

var RenderResult_1 = RenderResult;

var proto$2 = RenderResult.prototype = {
    getComponent: function() {
        return this.getComponents()[0];
    },
    getComponents: function(selector) {
        if (this.___components === undefined) {
            throw Error('Not added to DOM');
        }

        var componentDefs = getComponentDefs(this);

        var components = [];

        componentDefs.forEach(function(componentDef) {
            var component = componentDef.___component;
            if (!selector || selector(component)) {
                components.push(component);
            }
        });

        return components;
    },

    afterInsert: function(doc) {
        var out = this.___out;
        var globalComponentsContext = out.global.___components;
        if (globalComponentsContext) {
            this.___components = globalComponentsContext.___initComponents(doc);
        } else {
            this.___components = null;
        }

        return this;
    },
    getNode: function(doc) {
        return this.___out.___getNode(doc);
    },
    getOutput: function() {
        return this.___out.___getOutput();
    },
    toString: function() {
        return this.___out.toString();
    },
    document: typeof document != 'undefined' && document
};

// Add all of the following DOM methods to Component.prototype:
// - appendTo(referenceEl)
// - replace(referenceEl)
// - replaceChildrenOf(referenceEl)
// - insertBefore(referenceEl)
// - insertAfter(referenceEl)
// - prependTo(referenceEl)
domInsert(
    proto$2,
    function getEl(renderResult, referenceEl) {
        return renderResult.getNode(referenceEl.ownerDocument);
    },
    function afterInsert(renderResult, referenceEl) {
        return renderResult.afterInsert(referenceEl.ownerDocument);
    });

var VElement = vdom$4.___VElement;
var VDocumentFragment = vdom$4.___VDocumentFragment;
var VComment = vdom$4.___VComment;
var VText = vdom$4.___VText;
var virtualizeHTML = vdom$4.___virtualizeHTML;

var defaultDocument = vdom$4.___defaultDocument;

var FLAG_FINISHED = 1;
var FLAG_LAST_FIRED = 2;

var EVENT_UPDATE = 'update';
var EVENT_FINISH = 'finish';

function State(tree) {
    this.___remaining = 1;
    this.___events = new src();
    this.___tree = tree;
    this.___last = null;
    this.___lastCount = 0;
    this.___flags = 0;
}

function AsyncVDOMBuilder(globalData, parentNode, state) {
    if (!parentNode) {
        parentNode = new VDocumentFragment();
    }

    if (state) {
        state.___remaining++;
    } else {
        state = new State(parentNode);
    }

    this.data = {};
    this.___state = state;
    this.___parent = parentNode;
    this.global = globalData || {};
    this.___stack = [parentNode];
    this.___sync = false;
    this.___vnode = undefined;
    this.___componentArgs = null; // Component args
}

var proto = AsyncVDOMBuilder.prototype = {
    ___isOut: true,
    ___document: defaultDocument,

    ___elementNode: function(element, childCount, pushToStack) {
        var parent = this.___parent;
        if (parent !== undefined) {
            parent.___appendChild(element);
            if (pushToStack === true) {
                this.___stack.push(element);
                this.___parent = element;
            }
        }
        return childCount === 0 ? this : element;
    },

    element: function(tagName, attrs, childCount, flags, props) {
        var element = new VElement(tagName, attrs, childCount, flags, props);
        return this.___elementNode(element, childCount);
    },

    ___elementDynamicTag: function(tagName, attrs, childCount, flags, props) {
        var element = VElement.___createElementDynamicTag(tagName, attrs, childCount, flags, props);
        return this.___elementNode(element, childCount);
    },

    n: function(node) {
        // NOTE: We do a shallow clone since we assume the node is being reused
        //       and a node can only have one parent node.
        return this.node(node.___cloneNode());
    },

    node: function(node) {
        var parent = this.___parent;
        if (parent !== undefined) {
            parent.___appendChild(node);
        }
        return this;
    },

    text: function(text) {
        var type = typeof text;

        if (type != 'string') {
            if (text == null) {
                return;
            } else if (type === 'object') {
                if (text.toHTML) {
                    return this.h(text.toHTML());
                }
            }

            text = text.toString();
        }

        var parent = this.___parent;
        if (parent !== undefined) {
            var lastChild = parent.lastChild;
            if (lastChild && lastChild.___Text) {
                lastChild.___nodeValue += text;
            } else {
                parent.___appendChild(new VText(text));
            }
        }
        return this;
    },

    comment: function(comment) {
        return this.node(new VComment(comment));
    },

    html: function(html) {
        if (html != null) {
            var vdomNode = virtualizeHTML(html, this.___document || document);
            this.node(vdomNode);
        }

        return this;
    },

    beginElement: function(tagName, attrs, childCount, flags, props) {
        var element = new VElement(tagName, attrs, childCount, flags, props);
        this.___elementNode(element, childCount, true);
        return this;
    },

    ___beginElementDynamicTag: function(tagName, attrs, childCount, flags, props) {
        var element = VElement.___createElementDynamicTag(tagName, attrs, childCount, flags, props);
        this.___elementNode(element, childCount, true);
        return this;
    },

    endElement: function() {
        var stack = this.___stack;
        stack.pop();
        this.___parent = stack[stack.length-1];
    },

    end: function() {
        var state = this.___state;

        this.___parent = undefined;

        var remaining = --state.___remaining;

        if (!(state.___flags & FLAG_LAST_FIRED) && (remaining - state.___lastCount === 0)) {
            state.___flags |= FLAG_LAST_FIRED;
            state.___lastCount = 0;
            state.___events.emit('last');
        }

        if (remaining === 0) {
            state.___flags |= FLAG_FINISHED;
            state.___events.emit(EVENT_FINISH, this.___getResult());
        }

        return this;
    },

    error: function(e) {
        try {
            this.emit('error', e);
        } finally {
            // If there is no listener for the error event then it will
            // throw a new Error here. In order to ensure that the async fragment
            // is still properly ended we need to put the end() in a `finally`
            // block
            this.end();
        }

        return this;
    },

    beginAsync: function(options) {
        if (this.___sync) {
            throw Error('Not allowed');
        }

        var state = this.___state;

        if (options) {
            if (options.last) {
                state.___lastCount++;
            }
        }

        var documentFragment = this.___parent.___appendDocumentFragment();
        var asyncOut = new AsyncVDOMBuilder(this.global, documentFragment, state);

        state.___events.emit('beginAsync', {
           out: asyncOut,
           parentOut: this
       });

       return asyncOut;
    },

    createOut: function(callback) {
        return new AsyncVDOMBuilder(this.global);
    },

    flush: function() {
        var events = this.___state.___events;

        if (events.listenerCount(EVENT_UPDATE)) {
            events.emit(EVENT_UPDATE, new RenderResult_1(this));
        }
    },

    ___getOutput: function() {
        return this.___state.___tree;
    },

    ___getResult: function() {
        return this.___result || (this.___result = new RenderResult_1(this));
    },

    on: function(event, callback) {
        var state = this.___state;

        if (event === EVENT_FINISH && (state.___flags & FLAG_FINISHED)) {
            callback(this.___getResult());
        } else {
            state.___events.on(event, callback);
        }

        return this;
    },

    once: function(event, callback) {
        var state = this.___state;

        if (event === EVENT_FINISH && (state.___flags & FLAG_FINISHED)) {
            callback(this.___getResult());
            return this;
        }

        state.___events.once(event, callback);
        return this;
    },

    emit: function(type, arg) {
        var events = this.___state.___events;
        switch(arguments.length) {
            case 1:
                events.emit(type);
                break;
            case 2:
                events.emit(type, arg);
                break;
            default:
                events.emit.apply(events, arguments);
                break;
        }
        return this;
    },

    removeListener: function() {
        var events = this.___state.___events;
        events.removeListener.apply(events, arguments);
        return this;
    },

    sync: function() {
        this.___sync = true;
    },

    isSync: function() {
        return this.___sync;
    },

    onLast: function(callback) {
        var state = this.___state;

        var lastArray = state.___last;

        if (!lastArray) {
            lastArray = state.___last = [];
            var i = 0;
            var next = function() {
                if (i === lastArray.length) {
                    return;
                }
                var _next = lastArray[i++];
                _next(next);
            };

            this.once('last', function() {
                next();
            });
        }

        lastArray.push(callback);
        return this;
    },

    ___getNode: function(doc) {
        var node = this.___vnode;
        if (!node) {
            var vdomTree = this.___getOutput();

            node = this.___vnode = vdomTree.actualize(doc || this.___document || document);
        }
        return node;
    },

    toString: function() {
        var docFragment = this.___getNode();
        var html = '';

        if (docFragment.hasChildNodes()) {
            var children = docFragment.childNodes;
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                // get outerHTML if exists, otherwise default to nodeValue
                html += child.outerHTML || child.nodeValue;
            }
        }

        return html;
    },

    then: function(fn, fnErr) {
        var out = this;
        var promise = new Promise(function(resolve, reject) {
            out.on('error', reject)
                .on(EVENT_FINISH, function(result) {
                    resolve(result);
                });
        });

        return Promise.resolve(promise).then(fn, fnErr);
    },

    catch: function(fnErr) {
        return this.then(undefined, fnErr);
    },

    isVDOM: true,

    c: function(componentArgs) {
        this.___componentArgs = componentArgs;
    }
};

proto.e = proto.element;
proto.ed = proto.___elementDynamicTag;
proto.be = proto.beginElement;
proto.bed = proto.___beginElementDynamicTag;
proto.ee = proto.endElement;
proto.t = proto.text;
proto.h = proto.w = proto.write = proto.html;

var AsyncVDOMBuilder_1 = AsyncVDOMBuilder;

function safeRender(renderFunc, finalData, finalOut, shouldEnd) {
    try {
        renderFunc(finalData, finalOut);

        if (shouldEnd) {
            finalOut.end();
        }
    } catch(err) {
        var actualEnd = finalOut.end;
        finalOut.end = function() {};

        setTimeout(function() {
            finalOut.end = actualEnd;
            finalOut.error(err);
        }, 0);
    }
    return finalOut;
}

var renderable = function(target, renderer) {
    var renderFunc = renderer && (renderer.renderer || renderer.render || renderer);
    var createOut = target.createOut || renderer.createOut || createOut_1;

    return extend(target, {
        createOut: createOut,

        renderToString: function(data, callback) {
            var localData = data || {};
            var render = renderFunc || this._;
            var globalData = localData.$global;
            var out = createOut(globalData);

            out.global.template = this;

            if (globalData) {
                localData.$global = undefined;
            }

            if (callback) {
                out.on('finish', function() {
                       callback(null, out.toString(), out);
                   })
                   .once('error', callback);

                return safeRender(render, localData, out, true);
            } else {
                out.sync();
                render(localData, out);
                return out.toString();
            }
        },

        renderSync: function(data) {
            var localData = data || {};
            var render = renderFunc || this._;
            var globalData = localData.$global;
            var out = createOut(globalData);
            out.sync();

            out.global.template = this;

            if (globalData) {
                localData.$global = undefined;
            }

            render(localData, out);
            return out.___getResult();
        },

        /**
         * Renders a template to either a stream (if the last
         * argument is a Stream instance) or
         * provides the output to a callback function (if the last
         * argument is a Function).
         *
         * Supported signatures:
         *
         * render(data)
         * render(data, out)
         * render(data, stream)
         * render(data, callback)
         *
         * @param  {Object} data The view model data for the template
         * @param  {AsyncStream/AsyncVDOMBuilder} out A Stream, an AsyncStream/AsyncVDOMBuilder instance, or a callback function
         * @return {AsyncStream/AsyncVDOMBuilder} Returns the AsyncStream/AsyncVDOMBuilder instance that the template is rendered to
         */
        render: function(data, out) {
            var callback;
            var finalOut;
            var finalData;
            var globalData;
            var render = renderFunc || this._;
            var shouldBuffer = this.___shouldBuffer;
            var shouldEnd = true;

            if (data) {
                finalData = data;
                if ((globalData = data.$global)) {
                    finalData.$global = undefined;
                }
            } else {
                finalData = {};
            }

            if (out && out.___isOut) {
                finalOut = out;
                shouldEnd = false;
                extend(out.global, globalData);
            } else if (typeof out == 'function') {
                finalOut = createOut(globalData);
                callback = out;
            } else {
                finalOut = createOut(
                    globalData, // global
                    out, // writer(AsyncStream) or parentNode(AsyncVDOMBuilder)
                    null, // state
                    shouldBuffer // ignored by AsyncVDOMBuilder
                );
            }

            if (callback) {
                finalOut
                    .on('finish', function() {
                        callback(null, finalOut.___getResult());
                    })
                    .once('error', callback);
            }

            globalData = finalOut.global;

            globalData.template = globalData.template || this;

            return safeRender(render, finalData, finalOut, shouldEnd);
        }
    });
};

// helpers provide a core set of various utility methods
// that are available in every template



/**
 * Method is for internal usage only. This method
 * is invoked by code in a compiled Marko template and
 * it is used to create a new Template instance.
 * @private
 */
var t = function createTemplate(path) {
     return new Template(path);
};

function Template(path, func) {
    this.path = path;
    this._ = func;
    this.meta = undefined;
}

function createOut(globalData, parent, state) {
    return new AsyncVDOMBuilder_1(globalData, parent, state);
}

var Template_prototype = Template.prototype = {
    createOut: createOut
};

renderable(Template_prototype);

var Template_1 = Template;
var ___createOut = createOut;

createOut_1.___setCreateOut(createOut);

var vdom$2 = {
	t: t,
	Template: Template_1,
	___createOut: ___createOut
};

var vdom = vdom$2;

var isArray = Array.isArray;

function resolve(object, path, len) {
    var current = object;
    for (var i=0; i<len; i++) {
        current = current[path[i]];
    }

    return current;
}

function resolveType(info) {
    if (info.type === 'Date') {
        return new Date(info.value);
    } else {
        throw new Error('Bad type');
    }
}

var finalize$2 = function finalize(outer) {
    if (!outer) {
        return outer;
    }

    var assignments = outer.$$;
    if (assignments) {
        var object = outer.o;
        var len;

        if (assignments && (len=assignments.length)) {
            for (var i=0; i<len; i++) {
                var assignment = assignments[i];

                var rhs = assignment.r;
                var rhsValue;

                if (isArray(rhs)) {
                    rhsValue = resolve(object, rhs, rhs.length);
                } else {
                    rhsValue = resolveType(rhs);
                }

                var lhs = assignment.l;
                var lhsLast = lhs.length-1;

                if (lhsLast === -1) {
                    object = outer.o = rhsValue;
                    break;
                } else {
                    var lhsParent = resolve(object, lhs, lhsLast);
                    lhsParent[lhs[lhsLast]] = rhsValue;
                }
            }
        }

        assignments.length = 0; // Assignments have been applied, do not reapply

        return object == null ? null : object;
    } else {
        return outer;
    }

};

var finalize = finalize$2;

var bubble = [
    /* Mouse Events */
    'click',
    'dblclick',
    'mousedown',
    'mouseup',
    // 'mouseover',
    // 'mousemove',
    // 'mouseout',
    'dragstart',
    'drag',
    // 'dragenter',
    // 'dragleave',
    // 'dragover',
    'drop',
    'dragend',

    /* Keyboard Events */
    'keydown',
    'keypress',
    'keyup',

    /* Form Events */
    'select',
    'change',
    'submit',
    'reset',
    'input',

    'attach', // Pseudo event supported by Marko
    'detach'  // Pseudo event supported by Marko

    // 'focus', <-- Does not bubble
    // 'blur', <-- Does not bubble
    // 'focusin', <-- Not supported in all browsers
    // 'focusout' <-- Not supported in all browsers
];

var runtimeId$1 = utilBrowser.___runtimeId;
var componentLookup$2 = utilBrowser.___componentLookup;
var getMarkoPropsFromEl$1 = utilBrowser.___getMarkoPropsFromEl;

// We make our best effort to allow multiple marko runtimes to be loaded in the
// same window. Each marko runtime will get its own unique runtime ID.
var listenersAttachedKey = '$MED' + runtimeId$1;

function getEventFromEl(el, eventName) {
    var virtualProps = getMarkoPropsFromEl$1(el);
    var eventInfo = virtualProps[eventName];
    if (typeof eventInfo === 'string') {
        eventInfo = eventInfo.split(' ');
        if (eventInfo.length == 3) {
            eventInfo[2] = parseInt(eventInfo[2], 10);
        }
    }

    return eventInfo;
}

function delegateEvent(node, target, event) {
    var targetMethod = target[0];
    var targetComponentId = target[1];
    var extraArgs = target[2];

    var targetComponent = componentLookup$2[targetComponentId];

    if (!targetComponent) {
        return;
    }

    var targetFunc = targetComponent[targetMethod];
    if (!targetFunc) {
        throw Error('Method not found: ' + targetMethod);
    }

    if (extraArgs != null) {
        if (typeof extraArgs === 'number') {
            extraArgs = targetComponent.___bubblingDomEvents[extraArgs];
        }
    }

    // Invoke the component method
    if (extraArgs) {
        targetFunc.apply(targetComponent, extraArgs.concat(event, node));
    } else {
        targetFunc.call(targetComponent, event, node);
    }
}

function attachBubbleEventListeners(doc) {
    var body = doc.body;
    // Here's where we handle event delegation using our own mechanism
    // for delegating events. For each event that we have white-listed
    // as supporting bubble, we will attach a listener to the root
    // document.body element. When we get notified of a triggered event,
    // we again walk up the tree starting at the target associated
    // with the event to find any mappings for event. Each mapping
    // is from a DOM event type to a method of a component.
    bubble.forEach(function addBubbleHandler(eventType) {
        body.addEventListener(eventType, function(event) {
            var propagationStopped = false;

            // Monkey-patch to fix #97
            var oldStopPropagation = event.stopPropagation;

            event.stopPropagation = function() {
                oldStopPropagation.call(event);
                propagationStopped = true;
            };

            var curNode = event.target;
            if (!curNode) {
                return;
            }

            // event.target of an SVGElementInstance does not have a
            // `getAttribute` function in IE 11.
            // See https://github.com/marko-js/marko/issues/796
            curNode = curNode.correspondingUseElement || curNode;

            // Search up the tree looking DOM events mapped to target
            // component methods
            var propName = 'on' + eventType;
            var target;

            // Attributes will have the following form:
            // on<event_type>("<target_method>|<component_id>")

            do {
                if ((target = getEventFromEl(curNode, propName))) {
                    delegateEvent(curNode, target, event);

                    if (propagationStopped) {
                        break;
                    }
                }
            } while((curNode = curNode.parentNode) && curNode.getAttribute);
        });
    });
}

function noop() {}

var ___handleNodeAttach = noop;
var ___handleNodeDetach = noop;
var ___delegateEvent = delegateEvent;
var ___getEventFromEl = getEventFromEl;

var ___init = function(doc) {
    if (!doc[listenersAttachedKey]) {
        doc[listenersAttachedKey] = true;
        attachBubbleEventListeners(doc);
    }
};

var eventDelegation = {
	___handleNodeAttach: ___handleNodeAttach,
	___handleNodeDetach: ___handleNodeDetach,
	___delegateEvent: ___delegateEvent,
	___getEventFromEl: ___getEventFromEl,
	___init: ___init
};

var repeatedRegExp = /\[\]$/;

var attachBubblingEvent$1 = utilBrowser.___attachBubblingEvent;


/**
 * A ComponentDef is used to hold the metadata collected at runtime for
 * a single component and this information is used to instantiate the component
 * later (after the rendered HTML has been added to the DOM)
 */
function ComponentDef(component, componentId, globalComponentsContext, componentStack, componentStackLen) {
    this.___globalComponentsContext = globalComponentsContext; // The AsyncWriter that this component is associated with
    this.___componentStack = componentStack;
    this.___componentStackLen = componentStackLen;
    this.___component = component;
    this.id = componentId;

    this.___roots =  null;            // IDs of root elements if there are multiple root elements
    this.___children = null;          // An array of nested ComponentDef instances
    this.___domEvents = undefined;         // An array of DOM events that need to be added (in sets of three)

    this.___isExisting = false;

    this.___willRerenderInBrowser = false;

    this.___nextIdIndex = 0; // The unique integer to use for the next scoped ID
}

ComponentDef.prototype = {
    ___end: function() {
        this.___componentStack.length = this.___componentStackLen;
    },

    /**
     * Register a nested component for this component. We maintain a tree of components
     * so that we can instantiate nested components before their parents.
     */
    ___addChild: function (componentDef) {
        var children = this.___children;

        if (children) {
            children.push(componentDef);
        } else {
            this.___children = [componentDef];
        }
    },
    /**
     * This helper method generates a unique and fully qualified DOM element ID
     * that is unique within the scope of the current component. This method prefixes
     * the the nestedId with the ID of the current component. If nestedId ends
     * with `[]` then it is treated as a repeated ID and we will generate
     * an ID with the current index for the current nestedId.
     * (e.g. "myParentId-foo[0]", "myParentId-foo[1]", etc.)
     */
    elId: function (nestedId) {
        var id = this.id;
        if (nestedId == null) {
            return id;
        } else {
            if (typeof nestedId == 'string' && repeatedRegExp.test(nestedId)) {
                return this.___globalComponentsContext.___nextRepeatedId(id, nestedId);
            } else {
                return id + '-' + nestedId;
            }
        }
    },
    /**
     * Registers a DOM event for a nested HTML element associated with the
     * component. This is only done for non-bubbling events that require
     * direct event listeners to be added.
     * @param  {String} type The DOM event type ("mouseover", "mousemove", etc.)
     * @param  {String} targetMethod The name of the method to invoke on the scoped component
     * @param  {String} elId The DOM element ID of the DOM element that the event listener needs to be added too
     */
     e: function(type, targetMethod, elId, extraArgs) {
        if (targetMethod) {
            // The event handler method is allowed to be conditional. At render time if the target
            // method is null then we do not attach any direct event listeners.
            (this.___domEvents || (this.___domEvents = [])).push([
                type,
                targetMethod,
                elId,
                extraArgs]);
        }
    },
    /**
     * Returns the next auto generated unique ID for a nested DOM element or nested DOM component
     */
    ___nextComponentId: function() {
        var id = this.id;

        return id === null ?
            this.___globalComponentsContext.___nextComponentId(this.___out) :
            id + '-c' + (this.___nextIdIndex++);
    },

    d: function(handlerMethodName, extraArgs) {
        return attachBubblingEvent$1(this, handlerMethodName, extraArgs);
    }
};

ComponentDef.___deserialize = function(o, types, globals, registry) {
    var id        = o[0];
    var typeName  = types[o[1]];
    var input     = o[2];
    var extra     = o[3];

    var state = extra.s;
    var componentProps = extra.w;

    var component = typeName /* legacy */ && registry.___createComponent(typeName, id);

    if (extra.b) {
        component.___bubblingDomEvents = extra.b;
    }

    // Preview newly created component from being queued for update since we area
    // just building it from the server info
    component.___updateQueued = true;

    if (state) {
        var undefinedPropNames = extra.u;
        if (undefinedPropNames) {
            undefinedPropNames.forEach(function(undefinedPropName) {
                state[undefinedPropName] = undefined;
            });
        }
        // We go through the setter here so that we convert the state object
        // to an instance of `State`
        component.state = state;
    }

    component.___input = input;

    if (componentProps) {
        extend(component, componentProps);
    }

    var scope = extra.p;
    var customEvents = extra.e;
    if (customEvents) {
        component.___setCustomEvents(customEvents, scope);
    }

    component.___global = globals;

    return {
        ___component: component,
        ___roots: extra.r,
        ___domEvents: extra.d,
        ___willRerenderInBrowser: extra._ === 1
    };
};

var ComponentDef_1 = ComponentDef;

var loadComponent = function load(typeName) {
    throw new Error('Not found: ' + typeName);
};

function ensure(state, propertyName) {
    var proto = state.constructor.prototype;
    if (!(propertyName in proto)) {
        Object.defineProperty(proto, propertyName, {
            get: function() {
                return this.___raw[propertyName];
            },
            set: function(value) {
                this.___set(propertyName, value, false /* ensure:false */);
            }
        });
    }
}

function State$1(component) {
    this.___component = component;
    this.___raw = {};

    this.___dirty = false;
    this.___old = null;
    this.___changes = null;
    this.___forced = null; // An object that we use to keep tracking of state properties that were forced to be dirty

    Object.seal(this);
}

State$1.prototype = {
    ___reset: function() {
        var self = this;

        self.___dirty = false;
        self.___old = null;
        self.___changes = null;
        self.___forced = null;
    },

    ___replace: function(newState) {
        var state = this;
        var key;

        var rawState = this.___raw;

        for (key in rawState) {
            if (!(key in newState)) {
                state.___set(key, undefined, false /* ensure:false */, false /* forceDirty:false */);
            }
        }

        for (key in newState) {
            state.___set(key, newState[key], true /* ensure:true */, false /* forceDirty:false */);
        }
    },
    ___set: function(name, value, shouldEnsure, forceDirty) {
        var rawState = this.___raw;

        if (shouldEnsure) {
            ensure(this, name);
        }

        if (forceDirty) {
            var forcedDirtyState = this.___forced || (this.___forced = {});
            forcedDirtyState[name] = true;
        } else if (rawState[name] === value) {
            return;
        }

        if (!this.___dirty) {
            // This is the first time we are modifying the component state
            // so introduce some properties to do some tracking of
            // changes to the state
            this.___dirty = true; // Mark the component state as dirty (i.e. modified)
            this.___old = rawState;
            this.___raw = rawState = extend({}, rawState);
            this.___changes = {};
            this.___component.___queueUpdate();
        }

        this.___changes[name] = value;

        if (value === undefined) {
            // Don't store state properties with an undefined or null value
            delete rawState[name];
        } else {
            // Otherwise, store the new value in the component state
            rawState[name] = value;
        }
    },
    toJSON: function() {
        return this.___raw;
    }
};

var State_1 = State$1;

var beginComponentBrowser = function(component, isSplitComponent) {
    var componentStack = this.___componentStack;
    var origLength = componentStack.length;
    var parentComponentDef = componentStack[origLength - 1];

    var componentId = component.id;

    var componentDef = new ComponentDef_1(component, componentId, this.___globalContext, componentStack, origLength);
    parentComponentDef.___addChild(componentDef);
    this.___globalContext.___componentsById[componentId] = componentDef;

    componentStack.push(componentDef);

    return componentDef;
};

var ComponentsContext_1 = createCommonjsModule(function (module, exports) {
'use strict';






var EMPTY_OBJECT = {};

function GlobalComponentsContext(out) {
    this.___roots = [];
    this.___preserved = EMPTY_OBJECT;
    this.___preservedBodies = EMPTY_OBJECT;
    this.___componentsById = {};
    this.___out = out;
    this.___rerenderComponent = undefined;
    this.___nextIdLookup = null;
    this.___nextComponentId = utilBrowser.___nextComponentIdProvider(out);
}

GlobalComponentsContext.prototype = {
    ___initComponents: function(doc) {
        var topLevelComponentDefs = null;

        this.___roots.forEach(function(root) {
            var children = root.___children;
            if (children) {
                // NOTE: ComponentsContext.___initClientRendered is provided by
                //       index-browser.js to avoid a circular dependency
                ComponentsContext.___initClientRendered(children, doc);
                if (topLevelComponentDefs === null) {
                    topLevelComponentDefs = children;
                } else {
                    topLevelComponentDefs = topLevelComponentDefs.concat(children);
                }
            }
        });

        this.___roots = null;

        // Reset things stored in global since global is retained for
        // future renders
        this.___out.global.___components = undefined;

        return topLevelComponentDefs;
    },
    ___preserveDOMNode: function(elId, bodyOnly) {
        var preserved = bodyOnly === true ? this.___preservedBodies : this.___preserved;
        if (preserved === EMPTY_OBJECT) {
            if (bodyOnly === true) {
                preserved = this.___preservedBodies = {};
            } else {
                preserved = this.___preserved = {};
            }
        }
        preserved[elId] = true;
    },
    ___nextRepeatedId: function(parentId, id) {
        var nextIdLookup = this.___nextIdLookup || (this.___nextIdLookup = {});

        var indexLookupKey = parentId + '-' + id;
        var currentIndex = nextIdLookup[indexLookupKey];
        if (currentIndex == null) {
            currentIndex = nextIdLookup[indexLookupKey] = 0;
        } else {
            currentIndex = ++nextIdLookup[indexLookupKey];
        }

        return indexLookupKey.slice(0, -2) + '[' + currentIndex + ']';
    }
};

function ComponentsContext(out, parentComponentsContext, shouldAddGlobalRoot) {
    var root;

    var globalComponentsContext;

    if (parentComponentsContext === undefined) {
        globalComponentsContext = out.global.___components;
        if (globalComponentsContext === undefined) {
            out.global.___components = globalComponentsContext = new GlobalComponentsContext(out);
        }

        root = new ComponentDef_1(null, null, globalComponentsContext);

        if (shouldAddGlobalRoot !== false) {
            globalComponentsContext.___roots.push(root);
        }
    } else {
        globalComponentsContext = parentComponentsContext.___globalContext;
        var parentComponentStack = parentComponentsContext.___componentStack;
        root = parentComponentStack[parentComponentStack.length-1];
    }

    this.___globalContext = globalComponentsContext;
    this.___out = out;
    this.___componentStack = [root];
}

ComponentsContext.prototype = {
    ___createNestedComponentsContext: function(nestedOut) {
        return new ComponentsContext(nestedOut, this);
    },
    ___beginComponent: beginComponentBrowser,

    ___nextComponentId: function() {
        var componentStack = this.___componentStack;
        var parentComponentDef = componentStack[componentStack.length - 1];
        return parentComponentDef.___nextComponentId();
    }
};

function getComponentsContext(out) {
    return out.data.___components || (out.data.___components = new ComponentsContext(out));
}

module.exports = exports = ComponentsContext;

exports.___getComponentsContext = getComponentsContext;
});

var listenerTracker = createCommonjsModule(function (module, exports) {
var INDEX_EVENT = 0;
var INDEX_USER_LISTENER = 1;
var INDEX_WRAPPED_LISTENER = 2;
var DESTROY = "destroy";

function isNonEventEmitter(target) {
  return !target.once;
}

function EventEmitterWrapper(target) {
    this.$__target = target;
    this.$__listeners = [];
    this.$__subscribeTo = null;
}

EventEmitterWrapper.prototype = {
    $__remove: function(test, testWrapped) {
        var target = this.$__target;
        var listeners = this.$__listeners;

        this.$__listeners = listeners.filter(function(curListener) {
            var curEvent = curListener[INDEX_EVENT];
            var curListenerFunc = curListener[INDEX_USER_LISTENER];
            var curWrappedListenerFunc = curListener[INDEX_WRAPPED_LISTENER];

            if (testWrapped) {
                // If the user used `once` to attach an event listener then we had to
                // wrap their listener function with a new function that does some extra
                // cleanup to avoid a memory leak. If the `testWrapped` flag is set to true
                // then we are attempting to remove based on a function that we had to
                // wrap (not the user listener function)
                if (curWrappedListenerFunc && test(curEvent, curWrappedListenerFunc)) {
                    target.removeListener(curEvent, curWrappedListenerFunc);

                    return false;
                }
            } else if (test(curEvent, curListenerFunc)) {
                // If the listener function was wrapped due to it being a `once` listener
                // then we should remove from the target EventEmitter using wrapped
                // listener function. Otherwise, we remove the listener using the user-provided
                // listener function.
                target.removeListener(curEvent, curWrappedListenerFunc || curListenerFunc);

                return false;
            }

            return true;
        });

        // Fixes https://github.com/raptorjs/listener-tracker/issues/2
        // If all of the listeners stored with a wrapped EventEmitter
        // have been removed then we should unregister the wrapped
        // EventEmitter in the parent SubscriptionTracker
        var subscribeTo = this.$__subscribeTo;

        if (!this.$__listeners.length && subscribeTo) {
            var self = this;
            var subscribeToList = subscribeTo.$__subscribeToList;
            subscribeTo.$__subscribeToList = subscribeToList.filter(function(cur) {
                return cur !== self;
            });
        }
    },

    on: function(event, listener) {
        this.$__target.on(event, listener);
        this.$__listeners.push([event, listener]);
        return this;
    },

    once: function(event, listener) {
        var self = this;

        // Handling a `once` event listener is a little tricky since we need to also
        // do our own cleanup if the `once` event is emitted. Therefore, we need
        // to wrap the user's listener function with our own listener function.
        var wrappedListener = function() {
            self.$__remove(function(event, listenerFunc) {
                return wrappedListener === listenerFunc;
            }, true /* We are removing the wrapped listener */);

            listener.apply(this, arguments);
        };

        this.$__target.once(event, wrappedListener);
        this.$__listeners.push([event, listener, wrappedListener]);
        return this;
    },

    removeListener: function(event, listener) {
        if (typeof event === 'function') {
            listener = event;
            event = null;
        }

        if (listener && event) {
            this.$__remove(function(curEvent, curListener) {
                return event === curEvent && listener === curListener;
            });
        } else if (listener) {
            this.$__remove(function(curEvent, curListener) {
                return listener === curListener;
            });
        } else if (event) {
            this.removeAllListeners(event);
        }

        return this;
    },

    removeAllListeners: function(event) {

        var listeners = this.$__listeners;
        var target = this.$__target;

        if (event) {
            this.$__remove(function(curEvent, curListener) {
                return event === curEvent;
            });
        } else {
            for (var i = listeners.length - 1; i >= 0; i--) {
                var cur = listeners[i];
                target.removeListener(cur[INDEX_EVENT], cur[INDEX_USER_LISTENER]);
            }
            this.$__listeners.length = 0;
        }

        return this;
    }
};

function EventEmitterAdapter(target) {
    this.$__target = target;
}

EventEmitterAdapter.prototype = {
    on: function(event, listener) {
        this.$__target.addEventListener(event, listener);
        return this;
    },

    once: function(event, listener) {
        var self = this;

        // need to save this so we can remove it below
        var onceListener = function() {
          self.$__target.removeEventListener(event, onceListener);
          listener();
        };
        this.$__target.addEventListener(event, onceListener);
        return this;
    },

    removeListener: function(event, listener) {
        this.$__target.removeEventListener(event, listener);
        return this;
    }
};

function SubscriptionTracker() {
    this.$__subscribeToList = [];
}

SubscriptionTracker.prototype = {

    subscribeTo: function(target, options) {
        var addDestroyListener = !options || options.addDestroyListener !== false;
        var wrapper;
        var nonEE;
        var subscribeToList = this.$__subscribeToList;

        for (var i=0, len=subscribeToList.length; i<len; i++) {
            var cur = subscribeToList[i];
            if (cur.$__target === target) {
                wrapper = cur;
                break;
            }
        }

        if (!wrapper) {
            if (isNonEventEmitter(target)) {
              nonEE = new EventEmitterAdapter(target);
            }

            wrapper = new EventEmitterWrapper(nonEE || target);
            if (addDestroyListener && !nonEE) {
                wrapper.once(DESTROY, function() {
                    wrapper.removeAllListeners();

                    for (var i = subscribeToList.length - 1; i >= 0; i--) {
                        if (subscribeToList[i].$__target === target) {
                            subscribeToList.splice(i, 1);
                            break;
                        }
                    }
                });
            }

            // Store a reference to the parent SubscriptionTracker so that we can do cleanup
            // if the EventEmitterWrapper instance becomes empty (i.e., no active listeners)
            wrapper.$__subscribeTo = this;
            subscribeToList.push(wrapper);
        }

        return wrapper;
    },

    removeAllListeners: function(target, event) {
        var subscribeToList = this.$__subscribeToList;
        var i;

        if (target) {
            for (i = subscribeToList.length - 1; i >= 0; i--) {
                var cur = subscribeToList[i];
                if (cur.$__target === target) {
                    cur.removeAllListeners(event);

                    if (!cur.$__listeners.length) {
                        // Do some cleanup if we removed all
                        // listeners for the target event emitter
                        subscribeToList.splice(i, 1);
                    }

                    break;
                }
            }
        } else {
            for (i = subscribeToList.length - 1; i >= 0; i--) {
                subscribeToList[i].removeAllListeners();
            }
            subscribeToList.length = 0;
        }
    }
};

exports = module.exports = SubscriptionTracker;

exports.wrap = function(targetEventEmitter) {
    var nonEE;
    var wrapper;

    if (isNonEventEmitter(targetEventEmitter)) {
      nonEE = new EventEmitterAdapter(targetEventEmitter);
    }

    wrapper = new EventEmitterWrapper(nonEE || targetEventEmitter);
    if (!nonEE) {
      // we don't set this for non EE types
      targetEventEmitter.once(DESTROY, function() {
          wrapper.$__listeners.length = 0;
      });
    }

    return wrapper;
};

exports.createTracker = function() {
    return new SubscriptionTracker();
};
});

/* globals window */

var win$1 = window;
var setImmediate = win$1.setImmediate;

if (!setImmediate) {
    if (win$1.postMessage) {
        var queue = [];
        var messageName = 'si';
        win$1.addEventListener('message', function (event) {
            var source = event.source;
            if (source == win$1 || !source && event.data === messageName) {
                event.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        setImmediate = function(fn) {
            queue.push(fn);
            win$1.postMessage(messageName, '*');
        };
    } else {
        setImmediate = setTimeout;
    }
}

var nextTickBrowser = setImmediate;

var updatesScheduled = false;
var batchStack = []; // A stack of batched updates
var unbatchedQueue = []; // Used for scheduled batched updates



/**
 * This function is called when we schedule the update of "unbatched"
 * updates to components.
 */
function updateUnbatchedComponents() {
    if (unbatchedQueue.length) {
        try {
            updateComponents(unbatchedQueue);
        } finally {
            // Reset the flag now that this scheduled batch update
            // is complete so that we can later schedule another
            // batched update if needed
            updatesScheduled = false;
        }
    }
}

function scheduleUpdates() {
    if (updatesScheduled) {
        // We have already scheduled a batched update for the
        // process.nextTick so nothing to do
        return;
    }

    updatesScheduled = true;

    nextTickBrowser(updateUnbatchedComponents);
}

function updateComponents(queue) {
    // Loop over the components in the queue and update them.
    // NOTE: It is okay if the queue grows during the iteration
    //       since we will still get to them at the end
    for (var i=0; i<queue.length; i++) {
        var component = queue[i];
        component.___update(); // Do the actual component update
    }

    // Clear out the queue by setting the length to zero
    queue.length = 0;
}

function batchUpdate(func) {
    // If the batched update stack is empty then this
    // is the outer batched update. After the outer
    // batched update completes we invoke the "afterUpdate"
    // event listeners.
    var batch = {
        ___queue: null
    };

    batchStack.push(batch);

    try {
        func();
    } finally {
        try {
            // Update all of the components that where queued up
            // in this batch (if any)
            if (batch.___queue) {
                updateComponents(batch.___queue);
            }
        } finally {
            // Now that we have completed the update of all the components
            // in this batch we need to remove it off the top of the stack
            batchStack.length--;
        }
    }
}

function queueComponentUpdate(component) {
    var batchStackLen = batchStack.length;

    if (batchStackLen) {
        // When a batch update is started we push a new batch on to a stack.
        // If the stack has a non-zero length then we know that a batch has
        // been started so we can just queue the component on the top batch. When
        // the batch is ended this component will be updated.
        var batch = batchStack[batchStackLen-1];

        // We default the batch queue to null to avoid creating an Array instance
        // unnecessarily. If it is null then we create a new Array, otherwise
        // we push it onto the existing Array queue
        if (batch.___queue) {
            batch.___queue.push(component);
        } else {
            batch.___queue = [component];
        }
    } else {
        // We are not within a batched update. We need to schedule a batch update
        // for the process.nextTick (if that hasn't been done already) and we will
        // add the component to the unbatched queued
        scheduleUpdates();
        unbatchedQueue.push(component);
    }
}

var ___queueComponentUpdate = queueComponentUpdate;
var ___batchUpdate = batchUpdate;

var updateManager = {
	___queueComponentUpdate: ___queueComponentUpdate,
	___batchUpdate: ___batchUpdate
};

var defaultDoc = typeof document == 'undefined' ? undefined : document;


var morphAttrs = VElement_1.___morphAttrs;

var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;

function compareNodeNames(fromEl, toEl) {
    return fromEl.nodeName === toEl.___nodeName;
}


function getElementById$3(doc, id) {
    return doc.getElementById(id);
}

function morphdom(
        fromNode,
        toNode,
        context,
        onNodeAdded,
        onBeforeElUpdated,
        onBeforeNodeDiscarded,
        onNodeDiscarded,
        onBeforeElChildrenUpdated
    ) {

    var doc = fromNode.ownerDocument || defaultDoc;

    // This object is used as a lookup to quickly find all keyed elements in the original DOM tree.
    var removalList = [];
    var foundKeys = {};

    function walkDiscardedChildNodes(node) {
        onNodeDiscarded(node);
        var curChild = node.firstChild;

        while (curChild) {
            walkDiscardedChildNodes(curChild);
            curChild = curChild.nextSibling;
        }
    }


    function addVirtualNode(vEl, parentEl) {
        var realEl = vEl.___actualize(doc);

        if (parentEl) {
            parentEl.appendChild(realEl);
        }

        onNodeAdded(realEl, context);

        var vCurChild = vEl.___firstChild;
        while (vCurChild) {
            var realCurChild = null;

            var key = vCurChild.id;
            if (key) {
                var unmatchedFromEl = getElementById$3(doc, key);
                if (unmatchedFromEl && compareNodeNames(vCurChild, unmatchedFromEl)) {
                    morphEl(unmatchedFromEl, vCurChild, false);
                    realEl.appendChild(realCurChild = unmatchedFromEl);
                }
            }

            if (!realCurChild) {
                addVirtualNode(vCurChild, realEl);
            }

            vCurChild = vCurChild.___nextSibling;
        }

        if (vEl.___nodeType === 1) {
            var elHandler = specialElHandlers[vEl.nodeName];
            if (elHandler !== undefined) {
                elHandler(realEl, vEl);
            }
        }

        return realEl;
    }

    function morphEl(fromEl, toEl, childrenOnly) {
        var toElKey = toEl.id;
        var nodeName = toEl.___nodeName;

        if (childrenOnly === false) {
            if (toElKey) {
                // If an element with an ID is being morphed then it is will be in the final
                // DOM so clear it out of the saved elements collection
                foundKeys[toElKey] = true;
            }

            var constId = toEl.___constId;
            if (constId !== undefined) {
                var otherProps = fromEl._vprops;
                if (otherProps !== undefined && constId === otherProps.c) {
                    return;
                }
            }

            if (onBeforeElUpdated(fromEl, toElKey, context) === true) {
                return;
            }

            morphAttrs(fromEl, toEl);
        }


        if (onBeforeElChildrenUpdated(fromEl, toElKey, context) === true) {
            return;
        }

        if (nodeName !== 'TEXTAREA') {
            var curToNodeChild = toEl.___firstChild;
            var curFromNodeChild = fromEl.firstChild;
            var curToNodeKey;
            var curFromNodeKey;

            var fromNextSibling;
            var toNextSibling;
            var matchingFromEl;

            outer: while (curToNodeChild) {
                toNextSibling = curToNodeChild.___nextSibling;
                curToNodeKey = curToNodeChild.id;

                while (curFromNodeChild) {
                    fromNextSibling = curFromNodeChild.nextSibling;

                    curFromNodeKey = curFromNodeChild.id;

                    var curFromNodeType = curFromNodeChild.nodeType;

                    var isCompatible = undefined;

                    if (curFromNodeType === curToNodeChild.___nodeType) {
                        if (curFromNodeType === ELEMENT_NODE) {
                            // Both nodes being compared are Element nodes

                            if (curToNodeKey) {
                                // The target node has a key so we want to match it up with the correct element
                                // in the original DOM tree
                                if (curToNodeKey !== curFromNodeKey) {
                                    // The current element in the original DOM tree does not have a matching key so
                                    // let's check our lookup to see if there is a matching element in the original
                                    // DOM tree
                                    if ((matchingFromEl = getElementById$3(doc, curToNodeKey))) {
                                        if (curFromNodeChild.nextSibling === matchingFromEl) {
                                            // Special case for single element removals. To avoid removing the original
                                            // DOM node out of the tree (since that can break CSS transitions, etc.),
                                            // we will instead discard the current node and wait until the next
                                            // iteration to properly match up the keyed target element with its matching
                                            // element in the original tree
                                            isCompatible = false;
                                        } else {
                                            // We found a matching keyed element somewhere in the original DOM tree.
                                            // Let's moving the original DOM node into the current position and morph
                                            // it.

                                            // NOTE: We use insertBefore instead of replaceChild because we want to go through
                                            // the `removeNode()` function for the node that is being discarded so that
                                            // all lifecycle hooks are correctly invoked


                                            fromEl.insertBefore(matchingFromEl, curFromNodeChild);

                                            fromNextSibling = curFromNodeChild.nextSibling;
                                            removalList.push(curFromNodeChild);

                                            curFromNodeChild = matchingFromEl;
                                        }
                                    } else {
                                        // The nodes are not compatible since the "to" node has a key and there
                                        // is no matching keyed node in the source tree
                                        isCompatible = false;
                                    }
                                }
                            } else if (curFromNodeKey) {
                                // The original has a key
                                isCompatible = false;
                            }

                            isCompatible = isCompatible !== false && compareNodeNames(curFromNodeChild, curToNodeChild) === true;

                            if (isCompatible === true) {
                                // We found compatible DOM elements so transform
                                // the current "from" node to match the current
                                // target DOM node.
                                morphEl(curFromNodeChild, curToNodeChild, false);
                            }

                        } else if (curFromNodeType === TEXT_NODE || curFromNodeType === COMMENT_NODE) {
                            // Both nodes being compared are Text or Comment nodes
                            isCompatible = true;
                            // Simply update nodeValue on the original node to
                            // change the text value
                            curFromNodeChild.nodeValue = curToNodeChild.___nodeValue;
                        }
                    }

                    if (isCompatible === true) {
                        // Advance both the "to" child and the "from" child since we found a match
                        curToNodeChild = toNextSibling;
                        curFromNodeChild = fromNextSibling;
                        continue outer;
                    }

                    // No compatible match so remove the old node from the DOM and continue trying to find a
                    // match in the original DOM. However, we only do this if the from node is not keyed
                    // since it is possible that a keyed node might match up with a node somewhere else in the
                    // target tree and we don't want to discard it just yet since it still might find a
                    // home in the final DOM tree. After everything is done we will remove any keyed nodes
                    // that didn't find a home
                    removalList.push(curFromNodeChild);

                    curFromNodeChild = fromNextSibling;
                }

                // If we got this far then we did not find a candidate match for
                // our "to node" and we exhausted all of the children "from"
                // nodes. Therefore, we will just append the current "to" node
                // to the end
                if (curToNodeKey && (matchingFromEl = getElementById$3(doc, curToNodeKey)) && compareNodeNames(matchingFromEl, curToNodeChild)) {
                    fromEl.appendChild(matchingFromEl);
                    morphEl(matchingFromEl, curToNodeChild, false);
                } else {
                    addVirtualNode(curToNodeChild, fromEl);
                }

                curToNodeChild = toNextSibling;
                curFromNodeChild = fromNextSibling;
            }

            // We have processed all of the "to nodes". If curFromNodeChild is
            // non-null then we still have some from nodes left over that need
            // to be removed
            while (curFromNodeChild) {
                removalList.push(curFromNodeChild);
                curFromNodeChild = curFromNodeChild.nextSibling;
            }
        }

        var specialElHandler = specialElHandlers[nodeName];
        if (specialElHandler) {
            specialElHandler(fromEl, toEl);
        }
    } // END: morphEl(...)

    var morphedNode = fromNode;
    var fromNodeType = morphedNode.nodeType;
    var toNodeType = toNode.___nodeType;
    var morphChildrenOnly = false;
    var shouldMorphEl = true;
    var newNode;

    // Handle the case where we are given two DOM nodes that are not
    // compatible (e.g. <div> --> <span> or <div> --> TEXT)
    if (fromNodeType == ELEMENT_NODE) {
        if (toNodeType == ELEMENT_NODE) {
            if (!compareNodeNames(fromNode, toNode)) {
                newNode = toNode.___actualize(doc);
                morphChildrenOnly = true;
                removalList.push(fromNode);
            }
        } else {
            // Going from an element node to a text or comment node
            removalList.push(fromNode);
            newNode = toNode.___actualize(doc);
            shouldMorphEl = false;
        }
    } else if (fromNodeType == TEXT_NODE || fromNodeType == COMMENT_NODE) { // Text or comment node
        if (toNodeType == fromNodeType) {
            morphedNode.nodeValue = toNode.___nodeValue;
            return morphedNode;
        } else {
            // Text node to something else
            removalList.push(fromNode);
            newNode = addVirtualNode(toNode);
            shouldMorphEl = false;
        }
    }

    if (shouldMorphEl === true) {
        morphEl(newNode || morphedNode, toNode, morphChildrenOnly);
    }

    if (newNode) {
        if (fromNode.parentNode) {
            fromNode.parentNode.replaceChild(newNode, fromNode);
        }
    }

    // We now need to loop over any keyed nodes that might need to be
    // removed. We only do the removal if we know that the keyed node
    // never found a match. When a keyed node is matched up we remove
    // it out of fromNodesLookup and we use fromNodesLookup to determine
    // if a keyed node has been matched up or not
    for (var i=0, len=removalList.length; i<len; i++) {
        var node = removalList[i];
        var key = node.id;
        if (!key || foundKeys[key] === undefined) {
            var parentNode = node.parentNode;
            if (parentNode !== null || node === fromNode) {
                if (onBeforeNodeDiscarded(node) == false) {
                    continue;
                }

                if (parentNode !== null) {
                    parentNode.removeChild(node);
                }

                walkDiscardedChildNodes(node);
            }
        }
    }

    return newNode || morphedNode;
}

var morphdom_1 = morphdom;

/* jshint newcap:false */



var getComponentsContext = ComponentsContext_1.___getComponentsContext;

var componentLookup$3 = utilBrowser.___componentLookup;
var emitLifecycleEvent$1 = utilBrowser.___emitLifecycleEvent;
var destroyComponentForEl$2 = utilBrowser.___destroyComponentForEl;
var destroyElRecursive$2 = utilBrowser.___destroyElRecursive;
var getElementById$2 = utilBrowser.___getElementById;








var slice$1 = Array.prototype.slice;

var MORPHDOM_SKIP = true;

var COMPONENT_SUBSCRIBE_TO_OPTIONS;
var NON_COMPONENT_SUBSCRIBE_TO_OPTIONS = {
    addDestroyListener: false
};

function outNoop() { /* jshint -W040 */ return this; }

var emit = src.prototype.emit;

function removeListener(removeEventListenerHandle) {
    removeEventListenerHandle();
}

function checkCompatibleComponent(globalComponentsContext, el) {
    var component = el._w;
    while(component) {
        var id = component.id;
        var newComponentDef = globalComponentsContext.___componentsById[id];
        if (newComponentDef && component.___type == newComponentDef.___component.___type) {
            break;
        }

        var rootFor = component.___rootFor;
        if (rootFor)  {
            component = rootFor;
        } else {
            component.___destroyShallow();
            break;
        }
    }
}

function handleCustomEventWithMethodListener(component, targetMethodName, args, extraArgs) {
    // Remove the "eventType" argument
    args.push(component);

    if (extraArgs) {
        args = extraArgs.concat(args);
    }


    var targetComponent = componentLookup$3[component.___scope];
    var targetMethod = targetComponent[targetMethodName];
    if (!targetMethod) {
        throw Error('Method not found: ' + targetMethodName);
    }

    targetMethod.apply(targetComponent, args);
}

function getElIdHelper(component, componentElId, index) {
    var id = component.id;

    var elId = componentElId != null ? id + '-' + componentElId : id;

    if (index != null) {
        elId += '[' + index + ']';
    }

    return elId;
}

/**
 * This method is used to process "update_<stateName>" handler functions.
 * If all of the modified state properties have a user provided update handler
 * then a rerender will be bypassed and, instead, the DOM will be updated
 * looping over and invoking the custom update handlers.
 * @return {boolean} Returns true if if the DOM was updated. False, otherwise.
 */
function processUpdateHandlers(component, stateChanges, oldState) {
    var handlerMethod;
    var handlers;

    for (var propName in stateChanges) {
        if (stateChanges.hasOwnProperty(propName)) {
            var handlerMethodName = 'update_' + propName;

            handlerMethod = component[handlerMethodName];
            if (handlerMethod) {
                (handlers || (handlers=[])).push([propName, handlerMethod]);
            } else {
                // This state change does not have a state handler so return false
                // to force a rerender
                return;
            }
        }
    }

    // If we got here then all of the changed state properties have
    // an update handler or there are no state properties that actually
    // changed.
    if (handlers) {
        // Otherwise, there are handlers for all of the changed properties
        // so apply the updates using those handlers

        handlers.forEach(function(handler, i) {
            var propertyName = handler[0];
            handlerMethod = handler[1];

            var newValue = stateChanges[propertyName];
            var oldValue = oldState[propertyName];
            handlerMethod.call(component, newValue, oldValue);
        });

        emitLifecycleEvent$1(component, 'update');

        component.___reset();
    }

    return true;
}

function checkInputChanged(existingComponent, oldInput, newInput) {
    if (oldInput != newInput) {
        if (oldInput == null || newInput == null) {
            return true;
        }

        var oldKeys = Object.keys(oldInput);
        var newKeys = Object.keys(newInput);
        var len = oldKeys.length;
        if (len !== newKeys.length) {
            return true;
        }

        for (var i=0; i<len; i++) {
            var key = oldKeys[i];
            if (oldInput[key] !== newInput[key]) {
                return true;
            }
        }
    }

    return false;
}

function onNodeDiscarded(node) {
    if (node.nodeType === 1) {
        destroyComponentForEl$2(node);
    }
}

function onBeforeNodeDiscarded(node) {
    return eventDelegation.___handleNodeDetach(node);
}

function onBeforeElUpdated(fromEl, key, globalComponentsContext) {
    if (key) {
        var preserved = globalComponentsContext.___preserved[key];

        if (preserved === true) {
            // Don't morph elements that are associated with components that are being
            // reused or elements that are being preserved. For components being reused,
            // the morphing will take place when the reused component updates.
            return MORPHDOM_SKIP;
        } else {
            // We may need to destroy a Component associated with the current element
            // if a new UI component was rendered to the same element and the types
            // do not match
            checkCompatibleComponent(globalComponentsContext, fromEl);
        }
    }
}

function onBeforeElChildrenUpdated(el, key, globalComponentsContext) {
    if (key) {
        var preserved = globalComponentsContext.___preservedBodies[key];
        if (preserved === true) {
            // Don't morph the children since they are preserved
            return MORPHDOM_SKIP;
        }
    }
}

function onNodeAdded(node, globalComponentsContext) {
    eventDelegation.___handleNodeAttach(node, globalComponentsContext.___out);
}

var componentProto;

/**
 * Base component type.
 *
 * NOTE: Any methods that are prefixed with an underscore should be considered private!
 */
function Component(id) {
    src.call(this);
    this.id = id;
    this.el = null;
    this.___state = null;
    this.___roots = null;
    this.___subscriptions = null;
    this.___domEventListenerHandles = null;
    this.___bubblingDomEvents = null; // Used to keep track of bubbling DOM events for components rendered on the server
    this.___customEvents = null;
    this.___scope = null;
    this.___renderInput = null;
    this.___input = undefined;
    this.___mounted = false;
    this.___global = undefined;

    this.___destroyed = false;
    this.___updateQueued = false;
    this.___dirty = false;
    this.___settingInput = false;

    this.___document = undefined;
}

Component.prototype = componentProto = {
    ___isComponent: true,

    subscribeTo: function(target) {
        if (!target) {
            throw TypeError();
        }

        var subscriptions = this.___subscriptions || (this.___subscriptions = new listenerTracker());

        var subscribeToOptions = target.___isComponent ?
            COMPONENT_SUBSCRIBE_TO_OPTIONS :
            NON_COMPONENT_SUBSCRIBE_TO_OPTIONS;

        return subscriptions.subscribeTo(target, subscribeToOptions);
    },

    emit: function(eventType) {
        var customEvents = this.___customEvents;
        var target;

        if (customEvents && (target = customEvents[eventType])) {
            var targetMethodName = target[0];
            var extraArgs = target[1];
            var args = slice$1.call(arguments, 1);

            handleCustomEventWithMethodListener(this, targetMethodName, args, extraArgs);
        }

        if (this.listenerCount(eventType)) {
            return emit.apply(this, arguments);
        }
    },
    getElId: function (componentElId, index) {
        return getElIdHelper(this, componentElId, index);
    },
    getEl: function (componentElId, index) {
        var doc = this.___document;

        if (componentElId != null) {
            return getElementById$2(doc, getElIdHelper(this, componentElId, index));
        } else {
            return this.el || getElementById$2(doc, getElIdHelper(this));
        }
    },
    getEls: function(id) {
        var els = [];
        var i = 0;
        var el;
        while((el = this.getEl(id, i))) {
            els.push(el);
            i++;
        }
        return els;
    },
    getComponent: function(id, index) {
        return componentLookup$3[getElIdHelper(this, id, index)];
    },
    getComponents: function(id) {
        var components = [];
        var i = 0;
        var component;
        while((component = componentLookup$3[getElIdHelper(this, id, i)])) {
            components.push(component);
            i++;
        }
        return components;
    },
    destroy: function() {
        if (this.___destroyed) {
            return;
        }

        var els = this.els;

        this.___destroyShallow();

        var rootComponents = this.___rootComponents;
        if (rootComponents) {
            rootComponents.forEach(function(rootComponent) {
                rootComponent.___destroy();
            });
        }

        els.forEach(function(el) {
            destroyElRecursive$2(el);

            var parentNode = el.parentNode;
            if (parentNode) {
                parentNode.removeChild(el);
            }
        });
    },

    ___destroyShallow: function() {
        if (this.___destroyed) {
            return;
        }

        emitLifecycleEvent$1(this, 'destroy');
        this.___destroyed = true;

        this.el = null;

        // Unsubscribe from all DOM events
        this.___removeDOMEventListeners();

        var subscriptions = this.___subscriptions;
        if (subscriptions) {
            subscriptions.removeAllListeners();
            this.___subscriptions = null;
        }

        delete componentLookup$3[this.id];
    },

    isDestroyed: function() {
        return this.___destroyed;
    },
    get state() {
        return this.___state;
    },
    set state(newState) {
        var state = this.___state;
        if (!state && !newState) {
            return;
        }

        if (!state) {
            state = this.___state = new this.___State(this);
        }

        state.___replace(newState || {});

        if (state.___dirty) {
            this.___queueUpdate();
        }

        if (!newState) {
            this.___state = null;
        }
    },
    setState: function(name, value) {
        var state = this.___state;

        if (typeof name == 'object') {
            // Merge in the new state with the old state
            var newState = name;
            for (var k in newState) {
                if (newState.hasOwnProperty(k)) {
                    state.___set(k, newState[k], true /* ensure:true */);
                }
            }
        } else {
            state.___set(name, value, true /* ensure:true */);
        }
    },

    setStateDirty: function(name, value) {
        var state = this.___state;

        if (arguments.length == 1) {
            value = state[name];
        }

        state.___set(name, value, true /* ensure:true */, true /* forceDirty:true */);
    },

    replaceState: function(newState) {
        this.___state.___replace(newState);
    },

    get input() {
        return this.___input;
    },
    set input(newInput) {
        if (this.___settingInput) {
            this.___input = newInput;
        } else {
            this.___setInput(newInput);
        }
    },

    ___setInput: function(newInput, onInput, out) {
        onInput = onInput || this.onInput;
        var updatedInput;

        var oldInput = this.___input;
        this.___input = undefined;

        if (onInput) {
            // We need to set a flag to preview `this.input = foo` inside
            // onInput causing infinite recursion
            this.___settingInput = true;
            updatedInput = onInput.call(this, newInput || {}, out);
            this.___settingInput = false;
        }

        newInput = this.___renderInput = updatedInput || newInput;

        if ((this.___dirty = checkInputChanged(this, oldInput, newInput))) {
            this.___queueUpdate();
        }

        if (this.___input === undefined) {
            this.___input = newInput;
            if (newInput && newInput.$global) {
                this.___global = newInput.$global;
            }
        }

        return newInput;
    },

    forceUpdate: function() {
        this.___dirty = true;
        this.___queueUpdate();
    },

    ___queueUpdate: function() {
        if (!this.___updateQueued) {
            updateManager.___queueComponentUpdate(this);
        }
    },

    update: function() {
        if (this.___destroyed === true || this.___isDirty === false) {
            return;
        }

        var input = this.___input;
        var state = this.___state;

        if (this.___dirty === false && state !== null && state.___dirty === true) {
            if (processUpdateHandlers(this, state.___changes, state.___old, state)) {
                state.___dirty = false;
            }
        }

        if (this.___isDirty === true) {
            // The UI component is still dirty after process state handlers
            // then we should rerender

            if (this.shouldUpdate(input, state) !== false) {
                this.___rerender(false);
            }
        }

        this.___reset();
    },


    get ___isDirty() {
        return this.___dirty === true || (this.___state !== null && this.___state.___dirty === true);
    },

    ___reset: function() {
        this.___dirty = false;
        this.___updateQueued = false;
        this.___renderInput = null;
        var state = this.___state;
        if (state) {
            state.___reset();
        }
    },

    shouldUpdate: function(newState, newProps) {
        return true;
    },

    ___emitLifecycleEvent: function(eventType, eventArg1, eventArg2) {
        emitLifecycleEvent$1(this, eventType, eventArg1, eventArg2);
    },

    ___rerender: function(isRerenderInBrowser) {
        var self = this;
        var renderer = self.___renderer;

        if (!renderer) {
            throw TypeError();
        }
        var fromEls = self.___getRootEls({});
        var doc = self.___document;
        var input = this.___renderInput || this.___input;
        var globalData = this.___global;

        updateManager.___batchUpdate(function() {
            var createOut = renderer.createOut || createOut_1;
            var out = createOut(globalData);
            out.sync();
            out.___document = self.___document;

            if (isRerenderInBrowser === true) {
                out.e =
                    out.be =
                    out.ee =
                    out.t =
                    out.h =
                    out.w =
                    out.write =
                    out.html =
                    outNoop;
            }

            var componentsContext = getComponentsContext(out);
            var globalComponentsContext = componentsContext.___globalContext;
            globalComponentsContext.___rerenderComponent = self;
            globalComponentsContext.___isRerenderInBrowser = isRerenderInBrowser;

            renderer(input, out);

            var result = new RenderResult_1(out);

            if (isRerenderInBrowser !== true) {
                var targetNode = out.___getOutput();

                var fromEl;

                var targetEl = targetNode.___firstChild;
                while (targetEl) {
                    var nodeName = targetEl.___nodeName;

                    if (nodeName === 'HTML') {
                        fromEl = document.documentElement;
                    } else if (nodeName === 'BODY') {
                        fromEl = document.body;
                    } else if (nodeName === 'HEAD') {
                        fromEl = document.head;
                    } else {
                        fromEl = fromEls[targetEl.id];
                    }

                    if (fromEl) {
                        morphdom_1(
                            fromEl,
                            targetEl,
                            globalComponentsContext,
                            onNodeAdded,
                            onBeforeElUpdated,
                            onBeforeNodeDiscarded,
                            onNodeDiscarded,
                            onBeforeElChildrenUpdated);
                    }

                    targetEl = targetEl.___nextSibling;
                }
            }

            result.afterInsert(doc);

            out.emit('___componentsInitialized');
        });

        this.___reset();
    },

    ___getRootEls: function(rootEls) {
        var i, len;

        var componentEls = this.els;

        for (i=0, len=componentEls.length; i<len; i++) {
            var componentEl = componentEls[i];
            rootEls[componentEl.id] = componentEl;
        }

        var rootComponents = this.___rootComponents;
        if (rootComponents) {
            for (i=0, len=rootComponents.length; i<len; i++) {
                var rootComponent = rootComponents[i];
                rootComponent.___getRootEls(rootEls);
            }
        }

        return rootEls;
    },

    ___removeDOMEventListeners: function() {
        var eventListenerHandles = this.___domEventListenerHandles;
        if (eventListenerHandles) {
            eventListenerHandles.forEach(removeListener);
            this.___domEventListenerHandles = null;
        }
    },

    get ___rawState() {
        var state = this.___state;
        return state && state.___raw;
    },

    ___setCustomEvents: function(customEvents, scope) {
        var finalCustomEvents = this.___customEvents = {};
        this.___scope = scope;

        customEvents.forEach(function(customEvent) {
            var eventType = customEvent[0];
            var targetMethodName = customEvent[1];
            var extraArgs = customEvent[2];

            finalCustomEvents[eventType] = [targetMethodName, extraArgs];
        });
    }
};

componentProto.elId = componentProto.getElId;
componentProto.___update = componentProto.update;
componentProto.___destroy = componentProto.destroy;

// Add all of the following DOM methods to Component.prototype:
// - appendTo(referenceEl)
// - replace(referenceEl)
// - replaceChildrenOf(referenceEl)
// - insertBefore(referenceEl)
// - insertAfter(referenceEl)
// - prependTo(referenceEl)
domInsert(
    componentProto,
    function getEl(component) {
        var els = this.els;
        var elCount = els.length;
        if (elCount > 1) {
            var fragment = component.___document.createDocumentFragment();
            els.forEach(function(el) {
                fragment.appendChild(el);
            });
            return fragment;
        } else {
            return els[0];
        }
    },
    function afterInsert(component) {
        return component;
    });

inherit_1(Component, src);

var Component_1 = Component;

/* jshint newcap:false */





var defineComponent = function defineComponent(def, renderer) {
    if (def.___isComponent) {
        return def;
    }

    var ComponentClass = function() {};
    var proto;

    var type = typeof def;

    if (type == 'function') {
        proto = def.prototype;
    } else if (type == 'object') {
        proto = def;
    } else {
        throw TypeError();
    }

    ComponentClass.prototype = proto;

    // We don't use the constructor provided by the user
    // since we don't invoke their constructor until
    // we have had a chance to do our own initialization.
    // Instead, we store their constructor in the "initComponent"
    // property and that method gets called later inside
    // init-components-browser.js
    function Component(id) {
        Component_1.call(this, id);
    }

    if (!proto.___isComponent) {
        // Inherit from Component if they didn't already
        inherit_1(ComponentClass, Component_1);
    }

    // The same prototype will be used by our constructor after
    // we he have set up the prototype chain using the inherit function
    proto = Component.prototype = ComponentClass.prototype;

    // proto.constructor = def.constructor = Component;

    // Set a flag on the constructor function to make it clear this is
    // a component so that we can short-circuit this work later
    Component.___isComponent = true;

    function State(component) { State_1.call(this, component); }
    inherit_1(State, State_1);
    proto.___State = State;
    proto.___renderer = renderer;

    return Component;
};

var registered = {};
var loaded = {};
var componentTypes = {};

function register(typeName, def) {
    // We do this to kick off registering of nested components
    // but we don't use the return value just yet since there
    // is a good chance that it resulted in a circular dependency
    def();

    registered[typeName] = def;
    delete loaded[typeName];
    delete componentTypes[typeName];
    return typeName;
}

function load$1(typeName) {
    var target = loaded[typeName];
    if (!target) {
        target = registered[typeName];

        if (target) {
            target = target();
        } else {
            target = loadComponent(typeName); // Assume the typeName has been fully resolved already
        }

        if (!target) {
            throw Error('Not found: ' + typeName);
        }

        loaded[typeName] = target;
    }

    return target;
}

function getComponentClass(typeName) {
    var ComponentClass = componentTypes[typeName];

    if (ComponentClass) {
        return ComponentClass;
    }

    ComponentClass = load$1(typeName);

    ComponentClass = ComponentClass.Component || ComponentClass;

    if (!ComponentClass.___isComponent) {
        ComponentClass = defineComponent(ComponentClass, ComponentClass.renderer);
    }

    // Make the component "type" accessible on each component instance
    ComponentClass.prototype.___type = typeName;

    componentTypes[typeName] = ComponentClass;

    return ComponentClass;
}

function createComponent(typeName, id) {
    var ComponentClass = getComponentClass(typeName);
    return new ComponentClass(id);
}

var ___register = register;
var ___createComponent = createComponent;

var registryBrowser = {
	___register: ___register,
	___createComponent: ___createComponent
};

var win = window;
var defaultDocument$3 = document;

var componentLookup$1 = utilBrowser.___componentLookup;
var getElementById$1 = utilBrowser.___getElementById;


var serverRenderedGlobals = {};

function invokeComponentEventHandler(component, targetMethodName, args) {
    var method = component[targetMethodName];
    if (!method) {
        throw Error('Method not found: ' + targetMethodName);
    }

    method.apply(component, args);
}

function addEventListenerHelper(el, eventType, listener) {
    el.addEventListener(eventType, listener, false);
    return function remove() {
        el.removeEventListener(eventType, listener);
    };
}

function addDOMEventListeners(component, el, eventType, targetMethodName, extraArgs, handles) {
    var removeListener = addEventListenerHelper(el, eventType, function(event) {
        var args = [event, el];
        if (extraArgs) {
            args = extraArgs.concat(args);
        }

        invokeComponentEventHandler(component, targetMethodName, args);
    });
    handles.push(removeListener);
}

function initComponent(componentDef, doc) {
    var component = componentDef.___component;

    if (!component || !component.___isComponent) {
        return; // legacy
    }

    component.___reset();
    component.___document = doc;

    var isExisting = componentDef.___isExisting;
    var id = component.id;

    var rootIds = componentDef.___roots;

    if (rootIds) {
        var rootComponents;

        var els = [];

        rootIds.forEach(function(rootId) {
            var nestedId = id + '-' + rootId;
            var rootComponent = componentLookup$1[nestedId];
            if (rootComponent) {
                rootComponent.___rootFor = component;
                if (rootComponents) {
                    rootComponents.push(rootComponent);
                } else {
                    rootComponents = component.___rootComponents = [rootComponent];
                }
            } else {
                var rootEl = getElementById$1(doc, nestedId);
                if (rootEl) {
                    rootEl._w = component;
                    els.push(rootEl);
                }
            }
        });

        component.el = els[0];
        component.els = els;
        componentLookup$1[id] = component;
    } else if (!isExisting) {
        var el = getElementById$1(doc, id);
        el._w = component;
        component.el = el;
        component.els = [el];
        componentLookup$1[id] = component;
    }

    if (componentDef.___willRerenderInBrowser) {
        component.___rerender(true);
        return;
    }

    if (isExisting) {
        component.___removeDOMEventListeners();
    }

    var domEvents = componentDef.___domEvents;
    if (domEvents) {
        var eventListenerHandles = [];

        domEvents.forEach(function(domEventArgs) {
            // The event mapping is for a direct DOM event (not a custom event and not for bubblign dom events)

            var eventType = domEventArgs[0];
            var targetMethodName = domEventArgs[1];
            var eventEl = getElementById$1(doc, domEventArgs[2]);
            var extraArgs = domEventArgs[3];

            addDOMEventListeners(component, eventEl, eventType, targetMethodName, extraArgs, eventListenerHandles);
        });

        if (eventListenerHandles.length) {
            component.___domEventListenerHandles = eventListenerHandles;
        }
    }

    if (component.___mounted) {
        component.___emitLifecycleEvent('update');
    } else {
        component.___mounted = true;
        component.___emitLifecycleEvent('mount');
    }
}

/**
 * This method is used to initialized components associated with UI components
 * rendered in the browser. While rendering UI components a "components context"
 * is added to the rendering context to keep up with which components are rendered.
 * When ready, the components can then be initialized by walking the component tree
 * in the components context (nested components are initialized before ancestor components).
 * @param  {Array<marko-components/lib/ComponentDef>} componentDefs An array of ComponentDef instances
 */
function initClientRendered(componentDefs, doc) {
    // Ensure that event handlers to handle delegating events are
    // always attached before initializing any components
    eventDelegation.___init(doc);

    doc = doc || defaultDocument$3;
    for (var i=0,len=componentDefs.length; i<len; i++) {
        var componentDef = componentDefs[i];

        if (componentDef.___children) {
            initClientRendered(componentDef.___children, doc);
        }

        initComponent(
            componentDef,
            doc);
    }
}

/**
 * This method initializes all components that were rendered on the server by iterating over all
 * of the component IDs.
 */
function initServerRendered(renderedComponents, doc) {
    if (!renderedComponents) {
        renderedComponents = win.$components;

        if (renderedComponents && renderedComponents.forEach) {
            renderedComponents.forEach(function(renderedComponent) {
                initServerRendered(renderedComponent, doc);
            });
        }

        win.$components = {
            concat: initServerRendered
        };

        return;
    }
    // Ensure that event handlers to handle delegating events are
    // always attached before initializing any components
    eventDelegation.___init(doc || defaultDocument$3);

    renderedComponents = finalize(renderedComponents);

    var componentDefs = renderedComponents.w;
    var typesArray = renderedComponents.t;
    var globals = window.$MG;
    if (globals) {
        serverRenderedGlobals = finalize(globals);
        delete window.$MG;
    }

    componentDefs.forEach(function(componentDef) {
        componentDef = ComponentDef_1.___deserialize(componentDef, typesArray, serverRenderedGlobals, registryBrowser);
        initComponent(componentDef, doc || defaultDocument$3);
    });
}

var ___initClientRendered = initClientRendered;
var ___initServerRendered = initServerRendered;

var initComponentsBrowser = {
	___initClientRendered: ___initClientRendered,
	___initServerRendered: ___initServerRendered
};

ComponentsContext_1.___initClientRendered = initComponentsBrowser.___initClientRendered;

var getComponentForEl$1 = utilBrowser.___getComponentForEl;
var init = initComponentsBrowser.___initServerRendered;

var indexBrowser$4 = {
	getComponentForEl: getComponentForEl$1,
	init: init
};

var componentLookup$4 = utilBrowser.___componentLookup;
var emitLifecycleEvent$2 = utilBrowser.___emitLifecycleEvent;


var getComponentsContext$1 = ComponentsContext_1.___getComponentsContext;
var repeatedRegExp$1 = /\[\]$/;


var isServer = utilBrowser.___isServer === true;

var COMPONENT_BEGIN_ASYNC_ADDED_KEY = '$wa';

function resolveComponentKey(globalComponentsContext, key, scope) {
    if (key[0] == '#') {
        return key.substring(1);
    } else {
        var resolvedId;

        if (repeatedRegExp$1.test(key)) {
            resolvedId = globalComponentsContext.___nextRepeatedId(scope, key);
        } else {
            resolvedId = scope + '-' + key;
        }

        return resolvedId;
    }
}

function preserveComponentEls(existingComponent, out, globalComponentsContext) {
    var rootEls = existingComponent.___getRootEls({});

    for (var elId in rootEls) {
        var el = rootEls[elId];

        // We put a placeholder element in the output stream to ensure that the existing
        // DOM node is matched up correctly when using morphdom.
        out.element(el.tagName, { id: elId });

        globalComponentsContext.___preserveDOMNode(elId); // Mark the element as being preserved (for morphdom)
    }

    existingComponent.___reset(); // The component is no longer dirty so reset internal flags
    return true;
}

function handleBeginAsync(event) {
    var parentOut = event.parentOut;
    var asyncOut = event.out;
    var componentsContext = parentOut.data.___components;

    if (componentsContext !== undefined) {
        // All of the components in this async block should be
        // initialized after the components in the parent. Therefore,
        // we will create a new ComponentsContext for the nested
        // async block and will create a new component stack where the current
        // component in the parent block is the only component in the nested
        // stack (to begin with). This will result in top-level components
        // of the async block being added as children of the component in the
        // parent block.
        var nestedComponentsContext = componentsContext.___createNestedComponentsContext(asyncOut);
        asyncOut.data.___components = nestedComponentsContext;
    }
    // Carry along the component arguments
    asyncOut.___componentArgs = parentOut.___componentArgs;
}

function createRendererFunc(templateRenderFunc, componentProps, renderingLogic) {
    renderingLogic = renderingLogic || {};
    var onInput = renderingLogic.onInput;
    var typeName = componentProps.type;
    var roots = componentProps.roots;
    var assignedId = componentProps.id;
    var isSplit = componentProps.split === true;
    var shouldApplySplitMixins = isSplit;

    return function renderer(input, out) {
        var outGlobal = out.global;

        if (out.isSync() === false) {
            if (!outGlobal[COMPONENT_BEGIN_ASYNC_ADDED_KEY]) {
                outGlobal[COMPONENT_BEGIN_ASYNC_ADDED_KEY] = true;
                out.on('beginAsync', handleBeginAsync);
            }
        }

        var componentsContext = getComponentsContext$1(out);
        var globalComponentsContext = componentsContext.___globalContext;

        var component = globalComponentsContext.___rerenderComponent;
        var isRerender = component !== undefined;
        var id = assignedId;
        var isExisting;
        var customEvents;
        var scope;

        if (component) {
            id = component.id;
            isExisting = true;
            globalComponentsContext.___rerenderComponent = null;
        } else {
            var componentArgs = out.___componentArgs;

            if (componentArgs) {
                out.___componentArgs = null;

                scope = componentArgs[0];

                if (scope) {
                    scope = scope.id;
                }

                var key = componentArgs[1];
                if (key != null) {
                    key = key.toString();
                }
                id = id || resolveComponentKey(globalComponentsContext, key, scope);
                customEvents = componentArgs[2];
            }
        }

        id = id || componentsContext.___nextComponentId();

        if (isServer) {
            component = registryBrowser.___createComponent(
                renderingLogic,
                id,
                input,
                out,
                typeName,
                customEvents,
                scope);
            input = component.___updatedInput;
            component.___updatedInput = undefined; // We don't want ___updatedInput to be serialized to the browser
        } else {
            if (!component) {
                if (isRerender) {
                    // Look in in the DOM to see if a component with the same ID and type already exists.
                    component = componentLookup$4[id];
                    if (component && component.___type !== typeName) {
                        component = undefined;
                    }
                }

                if (component) {
                    isExisting = true;
                } else {
                    isExisting = false;
                    // We need to create a new instance of the component
                    component = registryBrowser.___createComponent(typeName, id);

                    if (shouldApplySplitMixins === true) {
                        shouldApplySplitMixins = false;

                        var renderingLogicProps = typeof renderingLogic == 'function' ?
                            renderingLogic.prototype :
                            renderingLogic;

                        copyProps(renderingLogicProps, component.constructor.prototype);
                    }
                }

                // Set this flag to prevent the component from being queued for update
                // based on the new input. The component is about to be rerendered
                // so we don't want to queue it up as a result of calling `setInput()`
                component.___updateQueued = true;

                if (customEvents !== undefined) {
                    component.___setCustomEvents(customEvents, scope);
                }


                if (isExisting === false) {
                    emitLifecycleEvent$2(component, 'create', input, out);
                }

                input = component.___setInput(input, onInput, out);

                if (isExisting === true) {
                    if (component.___isDirty === false || component.shouldUpdate(input, component.___state) === false) {
                        preserveComponentEls(component, out, globalComponentsContext);
                        return;
                    }
                }
            }

            component.___global = outGlobal;

            emitLifecycleEvent$2(component, 'render', out);
        }

        var componentDef = componentsContext.___beginComponent(component, isSplit);
        componentDef.___roots = roots;
        componentDef.___isExisting = isExisting;

        // Render the template associated with the component using the final template
        // data that we constructed
        templateRenderFunc(input, out, componentDef, component, component.___rawState);

        componentDef.___end();
    };
}

var renderer = createRendererFunc;

// exports used by the legacy renderer
createRendererFunc.___resolveComponentKey = resolveComponentKey;
createRendererFunc.___preserveComponentEls = preserveComponentEls;
createRendererFunc.___handleBeginAsync = handleBeginAsync;

var c = defineComponent; // Referenced by compiled templates
var r = renderer; // Referenced by compiled templates
var rc = registryBrowser.___register;  // Referenced by compiled templates

var helpersBrowser = {
	c: c,
	r: r,
	rc: rc
};

var isArray$1 = Array.isArray;

function isFunction$1(arg) {
    return typeof arg == 'function';
}

function classList$1(arg, classNames) {
    var len;

    if (arg) {
        if (typeof arg == 'string') {
            if (arg) {
                classNames.push(arg);
            }
        } else if (typeof (len = arg.length) == 'number') {
            for (var i=0; i<len; i++) {
                classList$1(arg[i], classNames);
            }
        } else if (typeof arg == 'object') {
            for (var name in arg) {
                if (arg.hasOwnProperty(name)) {
                    var value = arg[name];
                    if (value) {
                        classNames.push(name);
                    }
                }
            }
        }
    }
}

function createDeferredRenderer(handler) {
    function deferredRenderer(input, out) {
        deferredRenderer.renderer(input, out);
    }

    // This is the initial function that will do the rendering. We replace
    // the renderer with the actual renderer func on the first render
    deferredRenderer.renderer = function(input, out) {
        var rendererFunc = handler.renderer || handler._ || handler.render;
        if (!isFunction$1(rendererFunc)) {
            throw Error('Invalid renderer');
        }
        // Use the actual renderer from now on
        deferredRenderer.renderer = rendererFunc;
        rendererFunc(input, out);
    };

    return deferredRenderer;
}

function resolveRenderer(handler) {
    var renderer = handler.renderer || handler._;

    if (renderer) {
        return renderer;
    }

    if (isFunction$1(handler)) {
        return handler;
    }

    // If the user code has a circular function then the renderer function
    // may not be available on the module. Since we can't get a reference
    // to the actual renderer(input, out) function right now we lazily
    // try to get access to it later.
    return createDeferredRenderer(handler);
}

var helpers$1 = {
    /**
     * Internal helper method to prevent null/undefined from being written out
     * when writing text that resolves to null/undefined
     * @private
     */
    s: function strHelper(str) {
        return (str == null) ? '' : str.toString();
    },

    /**
     * Internal helper method to handle loops without a status variable
     * @private
     */
    f: function forEachHelper(array, callback) {
        if (isArray$1(array)) {
            for (var i=0; i<array.length; i++) {
                callback(array[i]);
            }
        } else if (isFunction$1(array)) {
            // Also allow the first argument to be a custom iterator function
            array(callback);
        }
    },

    /**
     * Helper to load a custom tag
     */
    t: function loadTagHelper(renderer, targetProperty, isRepeated) {
        if (renderer) {
            renderer = resolveRenderer(renderer);
        }

        return renderer;
    },

    /**
     * classList(a, b, c, ...)
     * Joines a list of class names with spaces. Empty class names are omitted.
     *
     * classList('a', undefined, 'b') --> 'a b'
     *
     */
    cl: function classListHelper() {
        var classNames = [];
        classList$1(arguments, classNames);
        return classNames.join(' ');
    }
};

var helpers_1$2 = helpers$1;

var VElement$2 = vdom$4.___VElement;
var VText$3 = vdom$4.___VText;




var classList = helpers_1$2.cl;

var helpers = extend({
    e: function(tagName, attrs, childCount, flags, props) {
        return new VElement$2(tagName, attrs, childCount, flags, props);
    },

    t: function(value) {
        return new VText$3(value);
    },

    const: function(id) {
        var i=0;
        return function() {
            return id + (i++);
        };
    },

    /**
     * Internal helper method to handle the "class" attribute. The value can either
     * be a string, an array or an object. For example:
     *
     * ca('foo bar') ==> ' class="foo bar"'
     * ca({foo: true, bar: false, baz: true}) ==> ' class="foo baz"'
     * ca(['foo', 'bar']) ==> ' class="foo bar"'
     */
    ca: function(classNames) {
        if (!classNames) {
            return null;
        }

        if (typeof classNames === 'string') {
            return classNames;
        } else {
            return classList(classNames);
        }
    }
}, helpers_1$2);

var helpers_1 = helpers;

function doInclude(input, out, throwError) {
    var target = input._target;
    var arg = input._arg || input;

    if (target) {
        if (typeof target === 'function') {
            return target(out, arg), true;
        } else if (typeof target === 'string') {
            return (target && out.text(target)), true;
        } else if (typeof target === 'object') {
            if (target.renderBody) {
                return target.renderBody(out, arg), true;
            } else if (target.renderer) {
                return target.renderer(arg, out), true;
            } else if (target.render) {
                return target.render(arg, out), true;
            } else if (target.safeHTML) {
                return out.write(target.safeHTML), true;
            } else {
                if (throwError) {
                    out.error('Invalid include target');
                }
            }
        }
    }
}

function includeTag(input, out) {
    doInclude(input, out, true);
}

includeTag.___doInclude = doInclude;

var includeTag_1 = includeTag;

// This tag is a noop in the browser
var componentGlobalsTagBrowser = function noop() {};

var normalInclude = includeTag_1.___doInclude;

var getElementById$4 = utilBrowser.___getElementById;

var getComponentsContext$2 = ComponentsContext_1.___getComponentsContext;

var includeTagBrowser = function include(input, out) {
    if (!normalInclude(input, out)) {
        var elId = input._elId;

        // There's no body content so let's see if we should reuse
        // the existing body content in the DOM
        var existingEl = getElementById$4(out.___document, elId);
        if (existingEl) {
            var componentsContext = getComponentsContext$2(out);
            componentsContext.___globalContext.___preserveDOMNode(elId, true /* body only */);
        }
    }
};

// This tag is a noop in the browser
var initComponentsTagBrowser = function noop() {};

var noopRender = function (input, out) {};

var altLayout = createCommonjsModule(function (module) {
'use strict';
var marko_template = module.exports = vdom.t(), marko_component = {
        onClick: function () {
            alert('test');
        }
    }, marko_registerComponent = helpersBrowser.rc, marko_componentType = marko_registerComponent('/keystone-boilerplate$0.0.5/client/templates/components/alt-layout/index.marko', function () {
        return module.exports;
    }), marko_renderer = helpersBrowser.r, marko_defineComponent = helpersBrowser.c, marko_loadTag = helpers_1.t, include_tag = marko_loadTag(includeTag_1), component_globals_tag = marko_loadTag(componentGlobalsTagBrowser), include_tag2 = marko_loadTag(includeTagBrowser), init_components_tag = marko_loadTag(initComponentsTagBrowser), await_reorderer_tag = marko_loadTag(noopRender), marko_createElement = helpers_1.e, marko_const = helpers_1.const, marko_const_nextId = marko_const('d0cd99'), marko_node0 = marko_createElement('META', { charset: 'utf-8' }, 0, 0, { c: marko_const_nextId() }), marko_node1 = marko_createElement('META', {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0'
    }, 0, 0, { c: marko_const_nextId() }), marko_node2 = marko_createElement('META', {
        'http-equiv': 'X-UA-Compatible',
        content: 'IE=edge'
    }, 0, 0, { c: marko_const_nextId() }), marko_node3 = marko_createElement('LINK', {
        rel: 'shortcut icon',
        href: '/favicon.ico',
        type: 'image/x-icon'
    }, 0, 0, { c: marko_const_nextId() }), marko_node4 = marko_createElement('LINK', {
        href: '/styles/bundle.css',
        rel: 'stylesheet'
    }, 0, 0, { c: marko_const_nextId() }), marko_attrs0 = {
        'class': 'navbar',
        role: 'navigation',
        'aria-label': 'dropdown navigation'
    }, marko_node5 = marko_createElement('FOOTER', { 'class': 'footer' }, 1, 0, { c: marko_const_nextId() }).e('DIV', { 'class': 'container' }, 1).e('DIV', { 'class': 'content has-text-centered' }, 1).e('P', null, 3).t('Powered by ').e('A', {
        href: 'http://keystonejs.com',
        target: '_blank'
    }, 1).t('KeystoneJS').t('.'), marko_node6 = marko_createElement('SCRIPT', { src: '/js/bundle.js' }, 0, 0, { c: marko_const_nextId() }), marko_attrs1 = { 'class': 'navbar-item' }, marko_node7 = marko_createElement('DIV', { 'class': 'navbar-item has-dropdown' }, 2, 0, { c: marko_const_nextId() }).e('A', { 'class': 'navbar-link' }, 1).t('Docs').e('DIV', { 'class': 'navbar-dropdown' }, 5).e('A', { 'class': 'navbar-item' }, 1).t('Overview').e('A', { 'class': 'navbar-item' }, 1).t('Elements').e('A', { 'class': 'navbar-item' }, 1).t('Components').e('HR', { 'class': 'navbar-divider' }, 0).e('DIV', { 'class': 'navbar-item' }, 1).t('Version 0.5.3'), marko_node8 = marko_createElement('IMG', {
        src: 'http://bulma.io/images/bulma-logo.png',
        alt: 'Bulma: a modern CSS framework based on Flexbox',
        width: '112',
        height: '28'
    }, 0, 0, { c: marko_const_nextId() });
function render(input, out, __component, component, state) {
    var data = input;
    const {title, navLinks} = input;
    out.be('HTML', { id: __component.id }, null, 4);
    out.be('HEAD');
    out.n(marko_node0);
    out.n(marko_node1);
    out.n(marko_node2);
    out.e('TITLE', null, 1).t(title || 'Keystone Boilerplate');
    out.n(marko_node3);
    out.n(marko_node4);
    out.comment('[if lt IE 9]>\n\t\t\t<script src="//cdn.jsdelivr.net/html5shiv/3.7.3/html5shiv.js"></script>\n\t\t\t<script src="//cdn.jsdelivr.net/respond/1.4.2/respond.min.js"></script>\n\t\t<![endif]');
    include_tag({ _target: input.css }, out);
    include_tag({ _target: input.head }, out);
    out.ee();
    out.be('BODY');
    component_globals_tag({}, out);
    out.e('NAV', marko_attrs0, 2).e('A', marko_attrs1, 1, 0, { onclick: __component.d('onClick') }).n(marko_node8).n(marko_node7);
    var __componentId0 = 'body';
    out.be('DIV', { id: __componentId0 }, null, 4);
    include_tag2({
        _target: input.content,
        _elId: __componentId0
    }, out);
    out.ee();
    out.n(marko_node5);
    out.n(marko_node6);
    include_tag({ _target: input.js }, out);
    init_components_tag({}, out);
    await_reorderer_tag({}, out);
    out.ee();
    out.ee();
}
marko_template._ = marko_renderer(render, { type: marko_componentType }, marko_component);
marko_template.Component = marko_defineComponent(marko_component, marko_template._);
});

var templates = createCommonjsModule(function (module) {
'use strict';
var marko_template = module.exports = vdom.t(), marko_loadTag = helpers_1.t, alt_layout_tag = marko_loadTag(altLayout), marko_createElement = helpers_1.e, marko_const = helpers_1.const, marko_const_nextId = marko_const('76bdfc'), marko_node0 = marko_createElement('SECTION', { 'class': 'hero is-primary' }, 1, 0, { c: marko_const_nextId() }).e('DIV', { 'class': 'hero-body container' }, 6).e('H1', { 'class': 'title' }, 1).t('Welcome').e('P', { 'class': 'subtitle' }, 3).t('This is your new ').e('A', {
        href: 'http://keystonejs.com',
        target: '_blank'
    }, 1).t('KeystoneJS').t(' website.').e('P', null, 5).t('It includes the latest versions of ').e('A', {
        href: 'http://bulma.io/',
        target: '_blank'
    }, 1).t('Bulma').t(' and ').e('A', {
        href: 'http://www.jquery.com/',
        target: '_blank'
    }, 1).t('jQuery').t('.').e('P', null, 3).t('Visit the ').e('A', {
        href: 'http://keystonejs.com/guide',
        target: '_blank'
    }, 1).t('Getting Started').t(' guide to learn how to customise it.').e('HR', null, 0).e('P', null, 5).t('Remember to ').e('A', {
        href: 'https://github.com/keystonejs/keystone',
        target: '_blank'
    }, 1).t('Star KeystoneJS on GitHub').t(' and ').e('A', {
        href: 'https://twitter.com/keystonejs',
        target: '_blank'
    }, 1).t('follow @keystonejs').t(' on twitter for updates.');
function render(input, out) {
    var data = input;
    alt_layout_tag({
        content: {
            renderBody: function renderBody(out) {
                out.n(marko_node0);
            }
        }
    }, out);
}
marko_template._ = render;
});

var componentsBrowser = indexBrowser$4;

//Pages


//Components
componentsBrowser.init();

var js = {

};

return js;

}());

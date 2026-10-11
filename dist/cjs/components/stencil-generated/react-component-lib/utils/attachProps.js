"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncEvent = exports.isCoveredByReact = exports.transformReactEventName = exports.getClassName = exports.attachProps = void 0;
const case_1 = require("./case");
const attachProps = (node, newProps, oldProps = {}) => {
    if (node instanceof Element) {
        const className = (0, exports.getClassName)(node.classList, newProps, oldProps);
        node.className = className;
        Array.from(new Set([...Object.keys(oldProps), ...Object.keys(newProps)])).forEach((name) => {
            if (name === "children" ||
                name === "style" ||
                name === "ref" ||
                name === "class" ||
                name === "className" ||
                name === "forwardedRef") {
                return;
            }
            if (name.indexOf("on") === 0 && name[2] === name[2].toUpperCase()) {
                const eventName = name.substring(2);
                const eventNameLc = eventName[0].toLowerCase() + eventName.substring(1);
                if (!(0, exports.isCoveredByReact)(eventNameLc)) {
                    (0, exports.syncEvent)(node, eventNameLc, newProps[name]);
                }
            }
            else {
                node[name] = newProps[name];
                const propType = typeof newProps[name];
                if (propType === "string") {
                    node.setAttribute((0, case_1.camelToDashCase)(name), newProps[name]);
                }
                else if (!(name in newProps)) {
                    node.removeAttribute((0, case_1.camelToDashCase)(name));
                }
            }
        });
    }
};
exports.attachProps = attachProps;
const getClassName = (classList, newProps, oldProps) => {
    const newClassProp = newProps.className || newProps.class;
    const oldClassProp = oldProps.className || oldProps.class;
    const currentClasses = arrayToMap(classList);
    const incomingPropClasses = arrayToMap(newClassProp ? newClassProp.split(" ") : []);
    const oldPropClasses = arrayToMap(oldClassProp ? oldClassProp.split(" ") : []);
    const finalClassNames = [];
    currentClasses.forEach((currentClass) => {
        if (incomingPropClasses.has(currentClass)) {
            finalClassNames.push(currentClass);
            incomingPropClasses.delete(currentClass);
        }
        else if (!oldPropClasses.has(currentClass)) {
            finalClassNames.push(currentClass);
        }
    });
    incomingPropClasses.forEach((s) => finalClassNames.push(s));
    return finalClassNames.join(" ");
};
exports.getClassName = getClassName;
const transformReactEventName = (eventNameSuffix) => {
    switch (eventNameSuffix) {
        case "doubleclick":
            return "dblclick";
    }
    return eventNameSuffix;
};
exports.transformReactEventName = transformReactEventName;
const isCoveredByReact = (eventNameSuffix) => {
    if (typeof document === "undefined") {
        return true;
    }
    else {
        const eventName = "on" + (0, exports.transformReactEventName)(eventNameSuffix);
        let isSupported = eventName in document;
        if (!isSupported) {
            const element = document.createElement("div");
            element.setAttribute(eventName, "return;");
            isSupported = typeof element[eventName] === "function";
        }
        return isSupported;
    }
};
exports.isCoveredByReact = isCoveredByReact;
const syncEvent = (node, eventName, newEventHandler) => {
    const eventStore = node.__events || (node.__events = {});
    const oldEventHandler = eventStore[eventName];
    if (oldEventHandler) {
        node.removeEventListener(eventName, oldEventHandler);
    }
    if (!newEventHandler) {
        delete eventStore[eventName];
        return;
    }
    node.addEventListener(eventName, (eventStore[eventName] = function handler(e) {
        if (newEventHandler) {
            newEventHandler.call(this, e);
        }
    }));
};
exports.syncEvent = syncEvent;
const arrayToMap = (arr) => {
    const map = new Map();
    arr.forEach((s) => map.set(s, s));
    return map;
};
//# sourceMappingURL=attachProps.js.map
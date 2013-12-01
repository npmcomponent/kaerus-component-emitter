 // Emitter /////////////////////////////////////////////////////////////////////////////
function Emitter(obj) {
    /* Emitter mixin */
    if(obj) {
        for(var key in Emitter.prototype) {
            obj[key] = Emitter.prototype[key];
        }
        obj._events = {};
        return obj;
    }

    if(!(this instanceof Emitter)) {
        return new Emitter;
    }

    this._events = {};  
}

Emitter.prototype.listeners = function(event) {
    var handlers = this._events[event];

    if(!handlers) return [];
    
    return handlers.filter(function(f){return f !==before && f !==after});
}

Emitter.prototype.hasListeners = function(event) {
    return !!this._events[event];
}

function before(){};
function after(){};

Emitter.prototype.on = function(event,handler,first) {
    var events = this._events[event];

    if(!events) events = this._events[event] = [before,after];

    if(first === true) events.splice(events.indexOf(before),0,handler);
    else if(first === undefined) events.splice(events.indexOf(after),0,handler);
    else events[events.length] = handler;
   
    return this;
}

Emitter.prototype.before = function(event,handler) {
    return this.on(event,handler,true);
}

Emitter.prototype.after = function(event,handler) {
    return this.on(event,handler,false);
}

Emitter.prototype.off = function(event,handler) {
    
    if(!arguments.length) {
        this._events = {};
    }    

    if(this._events[event]) {
        if(!handler) {
            delete this._events[event];
        } else {
            this._events[event] = this._events[event].filter(function(f) {
                return (f._of || f) !== handler;
            });
        }
    }

    return this;
}

Emitter.prototype.emit = function(event) {
    var context, handler, args;

    if(typeof event === 'object') {
        context = event;
        event = arguments[1];
    }

    args = Array.prototype.slice.call(arguments, (context ? 2 : 1));
    
    handler = this.listeners(event);

    context = context ? context : this;

    for(var i = 0, l = handler.length; i < l; i++){
        if(handler[i].apply(context,args) === false) break;
    }        

    return this;
}

Emitter.prototype.once = function(event,handler) {
    var self = this;

    function once() {
        self.off(event, handler);
        handler.apply(this, arguments);
    }
    
    this.on(event, once);

    once._of = handler;

    return this;
}

module.exports = Emitter;

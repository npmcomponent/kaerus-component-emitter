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
    if(!Array.isArray(handlers)) return [handlers];
    
    return handlers;
}

Emitter.prototype.hasListeners = function(event) {
    return !!this._events[event];
}

function before(){};
function after(){};

Emitter.prototype.on = function(event,handler,first) {
    var events = this._events[event];

    if(!events) {
        this._events[event] = handler;
    } else if(!Array.isArray(events)) {
        if(events !== handler) {
            if(first === undefined) this._events[event] = [events,handler];
            else if(first) this._events[event] = [handler,before,events];
            else this._events[event] = [events,after,handler];
        }  
    } else {
        if(events.indexOf(handler) < 0) {
            if(first === undefined) events.splice(events.indexOf(after),0,handler);
            else if(first) {
                if((events.indexOf(before))<0) events.splice(0,0,before);
                events.splice(events.indexOf(before),0,handler);
            }    
            else {
                if(events.indexOf(after)<0) events[events.length] = after;
                events.splice(events.indexOf(after)+1,0,handler);
            }    
        } 
    }    

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
        return this;
    }    

    var events = this._events[event];

    if(!events) return this;

    if(!handler) {
        delete this._events[event];
    }
    else if(!Array.isArray(events)){
        if((events._of || events) === handler)
            delete this._events[event];    
    } else {
        this._events[event] = this._events[event].filter(function(f) {
            return (f._of || f) !== handler;
        });
        /* undefines event when no handler is attached */
        /* or unwraps handler array on single handler. */
        var length = this._events[event].length; 
        
        if(!length) 
            delete this._events[event];
        else if(length === 1) 
            this._events[event] = this._events[event][0];
    } 

    return this;
}

Emitter.prototype.emit = function(event) {
    var events = this._events[event];

    if(!events) return this;   

    var args = Array.prototype.slice.call(arguments,1);

    if(!Array.isArray(events)) {
        events.apply(this,args);
    } else {
        for(var i = 0, l = events.length; i < l; i++){
            if(events[i].apply(this,args) === false) break;
        }        
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

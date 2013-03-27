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

Emitter.prototype.on = function(event,handler) {
    var handlers = this._events[event];
    
    if(!handlers) {
        this._events[event] = handler;
    } else if(!Array.isArray(handlers)) {
        if(handlers !== handler) this._events[event] = [handlers].concat(handler);  
    } else {
        if(handlers.indexOf(handler) < 0) handlers[handlers.length] = handler; 
    }    

    return this;
}

Emitter.prototype.before = function(event,handler) {
     return this.on(event,{_before:handler});
}

Emitter.prototype.after = function(event,handler) {
     return this.on(event,{_after:handler});
}

Emitter.prototype.off = function(event,handler) {
    if(handler && handler._off) handler = handler._off;
    
    if(event){ 
        if(!this._events[event]) return;

        if(!handler) {
            this._events[event] = undefined;
        }
        else if(!Array.isArray(this._events[event])){
            if(this._events[event] === handler)
                this._events[event] = undefined;    
        } else {

            this._events[event] = this._events[event].filter(function(f) {
                return f !== handler && f._before !== handler && f._after !== handler
            });
            /* undefines event when no handler is attached */
            /* or unwraps handler array on single handler. */
            if(!this._events[event].length) this._events[event] = undefined;
            else if(this._events[event].length === 1) 
                this._events[event] = this._events[event][0];
        } 
    }
    else {
        if(!handler) this._events = {};
        else {
            var events = Object.keys(this._events);
            for(var i = 0, l = events.length; i < l; i++)
                this.off(events[i],handler);
        }
    } 

    return this;
}

function notify(emitter,handler,args){
    
    if(Array.isArray(handler)) {
        for(var i = 0, l = handler.length; i < l; i++) {
            if(typeof handler[i] === 'function' && 
                handler[i].apply(emitter,args) === false ) {
                    return false;
            }
        }
    } else {
        if(typeof handler === 'function' &&
            handler.apply(emitter,args) === false) {
                return false;
        }
    }    

    return true;
}

Emitter.prototype.emit = function(event) {
    var handlers = this._events[event];

    if(!handlers) return;   

    var args = Array.prototype.slice.call(arguments,1),
        handler, before, after;

    if(!Array.isArray(handlers)) {
        notify(this,handlers,args);
    } else {
        /* todo: optimize away filter.map before/after */
        before = handlers.filter(function(f){return f._before})
            .map(function(m){ return m._before; });
        console.log("before", before);

        if(!notify(this,before,args))
            return this;

        if(!notify(this,handlers,args))
            return this;

        after = handlers.filter(function(f){return f._after})
            .map(function(m){ return m._after; });

        notify(this,after,args);        
    }

    return this;
}

Emitter.prototype.once = function(event,handler) {
    var self = this;

    function once() {
        self.off(event, once);
        handler.apply(null, arguments);
    }

    this.on(event, once);
    handler._off = once;

    return this;
}

module.exports = Emitter;

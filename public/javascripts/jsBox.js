/**
 * @class jsBox
 * @constructor
 */
var jsBox = function(config, layer) {
   jsBox.superclass.constructor.call(this, config, layer);
   
   this.buildTextArea(this.config.codeText || "function(e) {\n\n  return 0;\n}");
   this.nParams = this.getNbrInputs();
   this.createTerminals();
   
   // Reposition the terminals when the jsBox is being resized
   this.ddResize.eventResize.subscribe(function(e, args) {
      this.positionTerminals();
      
      YAHOO.util.Dom.setStyle(this.textarea, "height", (args[0][1]-30)+"px");
   }, this, true);
};

YAHOO.extend(jsBox, WireIt.Container, {
   buildTextArea: function(codeText) {

     var text_area_width = parseInt(YAHOO.util.Dom.getStyle(this.el, 'width')) - 10
     console.log(text_area_width)
      this.textarea = WireIt.cn('textarea', null, {width: text_area_width + "px", height: "70px", border: "0", padding: "5px"}, codeText);
      this.el.appendChild(this.textarea);

      YAHOO.util.Event.addListener(this.textarea, 'change', function() {
         var nParams = this.getNbrInputs();
         if( nParams != this.nParams) {
            this.nParams = nParams;
            this.createTerminals();
         }
      }, this, true);
      
   },
   
   /**
    * Parse the textarea code to get the number of input parameters
    */
   getNbrInputs: function() {
      var sParamList = this.textarea.value.match(/^[ ]*function[ ]*\((.*)\)[ ]*{/)[1];
      var params = sParamList.split(',');
      var nParams = (sParamList == "") ? 0 : parseInt(params.length);
      return nParams;
   },
   
   /**
    * Create (and re-create) the terminals with this.nParams input terminals
    */
   createTerminals: function() {
      
   	// Remove all the existing terminals
   	this.removeAllTerminals();
   	
      for(var i = 0 ; i < this.nParams ; i++) {
      	var term = this.addTerminal({xtype: WireIt.util.TerminalInput});
         term.jsBox = this;
         WireIt.sn(term.el, null, {position: "absolute", top: "-15px"});
      }

   	var term = this.addTerminal({xtype: WireIt.util.TerminalOutput});      
      term.jsBox = this;
      WireIt.sn(term.el, null, {position: "absolute", bottom: "-15px"});

      this.positionTerminals();

      // Declare the new terminals to the drag'n drop handler (so the wires are moved around with the container)
      this.dd.setTerminals(this.terminals);
   },
   
   /**
    * Reposition the terminals
    */
   positionTerminals: function() {
      // Calculate the width
      var widthStr = YAHOO.util.Dom.getStyle(this.el, 'width');
      var width = parseInt( widthStr.substr(0,widthStr.length-2), 10);

      var inputsIntervall = Math.floor(width/(this.nParams+1));

      for(var i = 0 ; i < this.terminals.length-1 ; i++) {
         YAHOO.util.Dom.setStyle(this.terminals[i].el, "left", (inputsIntervall*(i+1))-15+"px" );
         
         for(var j = 0 ; j < this.terminals[i].wires.length ; j++) {
            this.terminals[i].wires[j].redraw();
         }
      }

      YAHOO.util.Dom.setStyle(this.terminals[this.terminals.length-1].el, "left", Math.floor(width/2)-15+"px");

      for(var j = 0 ; j < this.terminals[this.terminals.length-1].wires.length ; j++) {
         this.terminals[this.terminals.length-1].wires[j].redraw();
      }
   },
   
   /**
    * Execute the module
    */
   execute: function() {

      // Eval each of the parameter functions : 
      var params = [];
      for(var i = 0 ; i < this.terminals.length-1 ; i++) {
         var term = this.terminals[i];
         var otherTerm = term.wires[0].getOtherTerminal(term);
         if(!otherTerm.jsBox.evalResult)
            otherTerm.jsBox.execute();
         params[i] = otherTerm.jsBox.evalResult;
      }
      var code = "var tempJsBoxFunction = ("+this.textarea.value+")";
      eval(code);
      this.evalResult = tempJsBoxFunction.apply(window, params);
   },
   
   /**
    * Returns true if all the input wires have been evaluated, false otherwise
    */
   mayEval: function() {
      // For each input param :
      for(var i = 0 ; i < this.terminals.length-1 ; i++) {
         var term = this.terminals[i];
         if(term.wires.length != 1) return false;
         var otherTerm = term.wires[0].getOtherTerminal(term);
         if(!otherTerm.jsBox) return false;
         if( !otherTerm.jsBox.mayEval() ) return false;
      }
      return true;
   }
   
});


/**
 * Static function to run the "program"
 */
jsBox.run = function() {
   
   // Clear the previous results
   for(var i = 0; i < jsBox.jsBoxLayer.containers.length; i++) {
      jsBox.jsBoxLayer.containers[i].evalResult = null;
   }
   
   // Make a list of all the containers that may be run (no input params)
   var modules = [];
   for(var i = 0; i < jsBox.jsBoxLayer.containers.length; i++) {
      if( jsBox.jsBoxLayer.containers[i].mayEval() ) {
         modules.push( jsBox.jsBoxLayer.containers[i] );
      }
   }
   
   // Eval the "sources" modules 
   for(var i = 0 ; i < modules.length ; i++) {
      modules[i].execute();
   }
   
};

/**
 * Adds a jsBox to the layer
 */
jsBox.addModule = function () {
   jsBox.jsBoxLayer.addContainer({xtype: jsBox, position: [50,250],});
};
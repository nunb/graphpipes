Gallery = Class.create({
  
  tabs : [],
  
  initialize : function(){
    var me = this
    
    this.tabs = this.find_gallery_tabs()
    this.activate_tab(this.tabs[0])
    
    this.tabs.each(function(tab) {
      tab.href = '#' + tab.innerHTML.gsub(/[^a-z1-9]+/i, '-')
      tab.observe('click', function() {
        me.move_to_step(me.tabs.indexOf(tab) + 1)
      })
    })
  },
  
  move_to_step : function(id) {
    this.activate_tab(this.tabs[id - 1])    

    var width = 975
    var position = id * width - width
    new Effect.Move ('all',{ x: -position, y: 0, mode: 'absolute'}); 
    return false;
  },
  
  activate_tab : function(tab) {
    this.tabs.each(function(b) { b.removeClassName('current') })
    tab.addClassName('current')
  },
  
  find_gallery_tabs : function() {
    return $$('ul.gallery_tabs li a')
  }
  
})







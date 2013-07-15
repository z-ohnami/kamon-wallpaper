
/*
  color setting values
*/
var Color = Backbone.Model.extend({
  defaults: {
    currentRed:15,
    currentGreen:15,
    currentBlue:15
  },
  // initialize: function(red,green,blue) {
  //   this.currentRed = red;
  //   this.currentGreen = green;
  //   this.currentBlue = blue;
  // },
  change:function(newColor) {
    this.currentRed   = newColor.red;
    this.currentGreen = newColor.green;
    this.currentBlue  = newColor.blue;
  },
  parseText:function(colorText) {
      var rgb = {};
      rgb.red   = parseInt(colorText.substr(1,2),16);
      rgb.green = parseInt(colorText.substr(3,2),16);
      rgb.blue  = parseInt(colorText.substr(5,2),16);

      return rgb;
  }
});

 var KamonSelect = Backbone.Model.extend({
  defaults:{
    id:0,
    fileName:'kikyo.png',
    colorText:'#0F0F0F',
    imageLoaded:false
  }
 });

 var KamonSelectView = Backbone.View.extend({
  tagName:'tr',
  initialize: function() {
//    this.on('render',this.draw());
  },
  getSize: function() {
    var size = {};
    var selected = parseInt($('#kamon-select-size').val());
    switch(selected) {
      case 1:
        size.w = 40;
        size.h = 40;
        break;
      case 2:
        size.w = 80;
        size.h = 80;
        break;
      case 3:
        size.w = 160;
        size.h = 160;
        break;
    }
    return size;
  },
  getContext: function() {
    var canvas = document.getElementById('kamon-canvas'+this.model.id);
    return canvas.getContext('2d');
  },
  draw:function() {
    var ctx = this.getContext();
    if(ctx) {
      // size define.
      var size = this.getSize();
      $('#kamon-canvas'+this.model.id).attr({
        'width':size.w,
        'height':size.h
      });
      var canvas_w = size.w;
      var canvas_h = size.h;

      var image = new Image();
      var hoge = this;
      image.onload = function() {
        ctx.drawImage(image,0,0,size.w,size.h);
        hoge.setImageLoaded();
      };
      image.src = 'img/kamon/'+this.model.get('fileName');
    }
  },
  setImageLoaded: function() {
    this.model.set({'imageLoaded':true});
    this.model.trigger('imageLoaded');
  },
  template: _.template($('#kamon-select-template').html()),
  render: function() {
    var template = this.template(this.model.toJSON());
    this.$el.html(template);
    return this;
  }
 });

var KamonCollection = Backbone.Collection.extend({
  model: KamonSelect
});

var KamonCollectionView = Backbone.View.extend({
  el: '#kamon-select-table',
  initialize: function() {
    this.collection.on('imageLoaded',this.drawCanvas,this);
  },
  drawCanvas: function() {
    if(this.isDrawable())
      drawKamonSample(this.collection);
  },
  isDrawable:function() {
    var loaded = this.collection.filter(function(kamon){
      return kamon.get('imageLoaded');
    });
    return (loaded.length < this.collection.length) ? false : true;
  },
  render: function() {
    this.collection.each(function(kamon) {
      var kamonSelectView = new KamonSelectView({model:kamon});
      this.$el.append(kamonSelectView.render().el);
      kamonSelectView.draw();
    },this);
    return this;
  }
});

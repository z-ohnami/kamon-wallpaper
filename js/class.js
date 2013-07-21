/*
  BaseView
*/
var BaseView = Backbone.View.extend({
  assignedViews:{},
  render:function() {
    var that = this;
    this.$el.html(this.presenter());
    Object.keys(this.assignedViews).forEach(function(selector) {
      that.assignedViews[selector].setElement(that.$el.find(selector)).render();
    });
    return this;
  },
  presenter:function() {
    //default do nothing
    return;
  },
  assign:function(selector,view) {
    this.assignedViews[selector] = view;
  }
});

var CanvasView = Backbone.View.extend({
  render:function() {
    return;
  },
  getCanvasContext:function(selector) {
      var element = (selector.indexOf('#') === 0) ? selector.substring(1,selector.length-1) : selector;
      var canvas = document.getElementById(element);
      return canvas.getContext('2d');
  }
});

/*
  MainView root for all
*/
var MainView = BaseView.extend({
  initialize:function(){
    this.sampleView = new SampleView();
//    this.assign('#wallpaper-sample',this.sampleView);
//    this.sampleView.on('myevent',this.hoge);

    this.kamonCollection = new KamonCollection([
      {id:1,fileName:'kikyo.png',colorText:'#0F0F0F'},
      {id:2,fileName:'ageha-mon.png',colorText:'#0F0F0F'},
      {id:3,fileName:'futa-ba-rindo.png',colorText:'#0F0F0F'},
      {id:4,fileName:'mutu-nen-sen-mon.png',colorText:'#0F0F0F'}
    ]);
    this.kamonCollectionView = new KamonCollectionView({collection:this.kamonCollection});
//    this.assign('#kamon-select-table',this.kamonCollectionView);
    this.kamonCollectionView.on('collectionLoaded',this.drawKamonSample,this);
  },
  render:function() {
    this.kamonCollectionView.render();
    return this;
  },
  getKamonSize: function() {
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
  drawKamonSample:function() {
    var size = this.getKamonSize();
    var collection = this.kamonCollection;
    this.sampleView.trigger('draw',{kamonSize:size,kamonCollection:collection});
  }
});

var SampleView = CanvasView.extend({
  el: '#wallpaper-sample',
  initialize:function() {
    this.on('draw',this.draw);
  },
  draw:function(params) {
    var kamonSize = params.kamonSize;
    var kamonCollection = params.kamonCollection;
    var ctx = this.getCanvasContext(this.el.id);
    if(ctx) {
      // size define.
//      var size = getKamonSize();
      var canvas_w = $('#wallpaper-sample').attr('width');
      var canvas_h = $('#wallpaper-sample').attr('height');

      // fill with kamon.
      this.fill(
        ctx,
        // $('#kamon-type1').attr('src'),
        kamonCollection,
        canvas_w,
        canvas_h,
        kamonSize);
    }
  },
  fill:function(ctx,kamonCollection,canvas_w,canvas_h,size) {
    // calulate drawing times.
    var times_v = Math.ceil(canvas_w / size.w);
    var times_h = Math.ceil(canvas_h / size.h);

    // put images.
    var posX = 0;
    var posY = 0;
    var kamonTotal = kamonCollection.length;
    var kamonImageArray = [];
    for (var i = 0; i < kamonTotal; i++) {
      var id = kamonCollection.models[i].id;
      var kamonCtx = this.getCanvasContext('kamon-canvas'+id);
      kamonImageArray.push(kamonCtx);
    }

    var kamonCnt = 0;
    for (i = 0; i < times_v; i++) {
      for (var j = 0; j < times_h; j++) {
        var image = kamonImageArray[(kamonCnt % kamonTotal)].getImageData(0,0,size.w,size.h);
        putImage(ctx,image,posX,posY,size);
        posX += size.w;
        kamonCnt++;
        if(kamonCnt >= kamonTotal )
          kamonCnt = 0;
      }
      posX = 0;
      posY += size.h;
    }
  }

});

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
    if(this.isSetAllCollection())
      this.trigger('collectionLoaded');
//      drawKamonSample(this.collection);
  },
  isSetAllCollection:function() {
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

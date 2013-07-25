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
    return this;
  },
  getCanvasContext:function(selector) {
    var element = (selector.indexOf('#') === 0) ? selector.substring(1,selector.length) : selector;
    var canvas = document.getElementById(element);
    return canvas.getContext('2d');
  },
  putImage: function(ctx,image,x,y,argFunc) {
    ctx.putImageData(image,x,y);
    if(argFunc !== undefined)
      argFunc();
  }
});

/*
  MainView root for all
*/
var MainView = BaseView.extend({
  initialize:function(){
    this.sampleView = new SampleView();
    this.kamonCollection = new KamonCollection([
      {id:1,fileName:'kikyo.png',colorText:'#0F0F0F'},
      {id:2,fileName:'ageha-mon.png',colorText:'#0F0F0F'},
      {id:3,fileName:'futa-ba-rindo.png',colorText:'#000000'},
//      {id:3,fileName:'kikyo.png',colorText:'#0F0F0F'},
      {id:4,fileName:'mutu-nen-sen-mon.png',colorText:'#0F0F0F'}
    ]);
    this.kamonCollectionView = new KamonCollectionView({collection:this.kamonCollection});
    this.kamonCollectionView.on('collectionLoaded',this.setupFirstBoot,this);
    this.kamonCollectionView.on('changeColor',this.drawKamonSample,this);
    this.kamonCollectionView.on('refleshFinished',this.drawKamonSample,this);

    this.bgColorPickerView = new ColorPickerView();
    this.bgColorPickerView.setElementColor('#background-color-picker');
    this.bgColorPickerView.on('changeColor',this.reflesh,this);
    this.bgColorPickerView.setColorValue('#333333');

  },
  render:function() {
    this.kamonCollectionView.render();
    return this;
  },
  setupFirstBoot:function() {
    this.setKamonSelectColorPicker();
    this.drawKamonSample();
  },
  setKamonSelectColorPicker:function() {
    for (var i = 0; i < this.kamonCollection.length; i++) {
      this.kamonCollection.at(i).trigger('setColorPicker');
    }
  },
  reflesh:function() {
    for (var i = 0; i < this.kamonCollection.length; i++) {
      this.kamonCollection.at(i).set({'imageLoaded':false});
      this.kamonCollection.at(i).trigger('refleshKamonSelect');
    }
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

var ColorPickerView = Backbone.View.extend({
  className: 'color-pick',
  setElementColor:function(bindElement) {
    this.bindElement = bindElement;
    $(bindElement).colorpicker({
      format:'hex'
    });
    var that = this;
    $(bindElement).colorpicker().on('changeColor',function(ev){
      var color = ev.color.toHex();
      $(this).val(color).css('background-color',color);
      that.trigger('changeColor');
    });
  },
  setColorValue:function(colorText) {
    $(this.bindElement).val(colorText);
  },
  replaceColor: function(imageData,canvas_w,canvas_h) {
    return this.model.replace(
      imageData,canvas_w,canvas_h,$(this.bindElement).val(),$('#background-color-picker').val());
  }
});

/*
  color setting values
*/
var Color = Backbone.Model.extend({
  initialize: function() {
//    this.currentColor = {red:15,green:15,blue:15};
    this.currentColor = {red:0,green:0,blue:0};
    this.currentBGColor = {red:255,green:255,blue:255};
  },
  change:function(newColor,newBGColor) {
    this.currentColor.red   = newColor.red;
    this.currentColor.green = newColor.green;
    this.currentColor.blue  = newColor.blue;
    this.currentBGColor.red   = newBGColor.red;
    this.currentBGColor.green = newBGColor.green;
    this.currentBGColor.blue  = newBGColor.blue;
  },
  parseText:function(colorText) {
    var rgb = {};
    rgb.red   = parseInt(colorText.substr(1,2),16);
    rgb.green = parseInt(colorText.substr(3,2),16);
    rgb.blue  = parseInt(colorText.substr(5,2),16);

    return rgb;
  },
  replace: function(imageData,canvas_w,canvas_h,newColorText,newBGColorText) {
    var newColor = this.parseText(newColorText);
    var newBGColor = this.parseText(newBGColorText);
    var data = imageData.data;
    for(var x = 0;x < canvas_w;++x) {
      for(var y = 0;y < canvas_h;++y) {
        var index = (x + (y * canvas_h)) * 4;
        var rgb = this.putColor(data,index,this.currentColor,newColor,this.currentBGColor,newBGColor);
        data[index+0] = rgb[0];
        data[index+1] = rgb[1];
        data[index+2] = rgb[2];
        data[index+3] = rgb[3];
      }
    }
    imageData.data = data;
    this.change(newColor,newBGColor);
    return imageData;
  },
  putColor: function(data,index,currentColor,newColor,currentBGColor,newBGColor) {
    var rgb = new Array(4);
    if(this.isMatchColor(data,index,currentColor)) {
      rgb[0] = newColor.red;
      rgb[1] = newColor.green;
      rgb[2] = newColor.blue;
      rgb[3] = 255;
    } else if(this.isMatchColor(data,index,currentBGColor)) {
      rgb[0] = newBGColor.red;
      rgb[1] = newBGColor.green;
      rgb[2] = newBGColor.blue;
      rgb[3] = 255;
    } else {
      rgb[0] = data[index+0];
      rgb[1] = data[index+1];
      rgb[2] = data[index+2];
      rgb[3] = data[index+3];
    }
    return rgb;
  },
  isMatchColor: function(data,index,color) {
    if(data[index+0] !== color.red)
      return false;

    if(data[index+1] !== color.green)
      return false;

    if(data[index+2] !== color.blue)
      return false;

    if(data[index+3] !== 255)
      return false;

    return true;
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
      var canvas_w = $('#wallpaper-sample').attr('width');
      var canvas_h = $('#wallpaper-sample').attr('height');

      // fill with kamon.
      this.fill(
        ctx,
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
        this.putImage(ctx,image,posX,posY);
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

var KamonSelect = Backbone.Model.extend({
  defaults:{
    id:0,
    fileName:'kikyo.png',
    colorText:'#0F0F0F',
    imageLoaded:false
  },
  initialize:function() {
    this.color = new Color();
  }
});

var KamonSelectView = CanvasView.extend({
  tagName:'tr',
  initialize: function() {
    this.canvasID = '#kamon-canvas'+this.model.id;
    this.model.on('setColorPicker',this.setColorPicker,this);
    this.model.on('refleshKamonSelect',this.changeColor,this);
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
  setColorPicker:function() {
    this.colorPicker = new ColorPickerView({model: this.model.color});
    this.colorPicker.setElementColor('#kamon-color'+this.model.id);
    this.colorPicker.on('changeColor',this.changeColor,this);
  },
  draw:function() {
    var ctx = this.getCanvasContext(this.canvasID);
    if(ctx) {
      // size define.
      var size = this.getSize();
      $(this.canvasID).attr({
        'width':size.w,
        'height':size.h
      });
      var canvas_w = size.w;
      var canvas_h = size.h;

      var image = new Image();
      var that = this;
      image.onload = function() {
        ctx.drawImage(image,0,0,size.w,size.h);
        that.setImageLoaded();
      };
      image.src = 'img/kamon/'+this.model.get('fileName');
    }
  },
  changeColor:function() {
  //    console.log('kamon selected');
    var ctx = this.getCanvasContext(this.canvasID);
    if(ctx) {
      var canvas_w = $(this.canvasID).attr('width');
      var canvas_h = $(this.canvasID).attr('height');

      // change color settings.
      var repl = this.colorPicker.replaceColor(
        ctx.getImageData(0,0,canvas_w,canvas_h),
        canvas_w,
        canvas_h);

      var that = this;
      this.putImage(ctx,repl,0,0,function() {
        that.setImageLoaded();
      });
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
    this.collection.on('changeColor',this.drawCanvas,this);
  },
  drawCanvas: function() {
    if(this.isSetAllCollection())
      this.trigger('collectionLoaded');
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
//      kamonSelectView.trigger('render');
    },this);
    return this;
  }
});

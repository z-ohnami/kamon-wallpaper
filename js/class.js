
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
var MainView = Backbone.View.extend({
  initialize:function(){
    this.sampleView = new SampleView();
    this.kamonCollection = new KamonCollection([
      {id:1,fileName:'img/kamon/kikyo.png',colorText:'#0F0F0F'},
      {id:2,fileName:'img/kamon/ageha-mon.png',colorText:'#0F0F0F'},
      {id:3,fileName:'img/kamon/futa-ba-rindo.png',colorText:'#000000'},
//      {id:3,fileName:'kikyo.png',colorText:'#0F0F0F'},
      {id:4,fileName:'img/kamon/mutu-nen-sen-mon.png',colorText:'#0F0F0F'}
    ]);

    this.kamonSizeSelectView = new KamonSizeSelectView({model:new KamonSizeSelect()});
    this.kamonSizeSelectView.on('changeSize',this.refleshSize,this);

    this.kamonCollectionView = new KamonCollectionView({collection:this.kamonCollection});
    var size = this.kamonSizeSelectView.getSize();
    this.kamonCollectionView.setKamonSize(size);

    this.kamonCollectionView.on('collectionLoaded',this.setupFirstBoot,this);
    this.kamonCollectionView.on('changeColor',this.drawKamonSample,this);
    this.kamonCollectionView.on('refleshFinished',this.drawKamonSample,this);
    this.kamonCollectionView.on('showModal',this.showModal,this);

    this.bgColorPickerView = new ColorPickerView();
    this.bgColorPickerView.setColorPickerElement('#background-color-picker');
    this.bgColorPickerView.on('changeColor',this.refleshColor,this);
    this.bgColorPickerView.setColorValue('#98fb98');

    this.kamonPreviewView = new KamonPreviewView();
    this.kamonPublishView = new KamonPublishView();

    this.modalSelectView = new ModalSelectView();
    this.modalSelectView.on('modalSelectKamonType',this.modalSelectKamonType,this);

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
      this.kamonCollection.at(i).trigger('setColorPickerChangeHandler');
    }
  },
  refleshColor:function() {
    for (var i = 0; i < this.kamonCollection.length; i++) {
      this.kamonCollection.at(i).set({'imageLoaded':false});
      this.kamonCollection.at(i).trigger('refleshColorKamonSelect');
    }
  },
  refleshSize:function() {
    var size = this.kamonSizeSelectView.getSize();
    this.kamonCollectionView.setKamonSize(size);

    for (var i = 0; i < this.kamonCollection.length; i++) {
      this.kamonCollection.at(i).set({'imageLoaded':false});
      this.kamonCollection.at(i).trigger('refleshSizeKamonSelect',{w:size.w,h:size.h});
    }
  },
  drawKamonSample:function() {
    var size = this.kamonSizeSelectView.getSize();
    var collection = this.kamonCollection;
    this.sampleView.trigger('draw',{kamonSize:size,kamonCollection:collection});
  },
  showModal:function(params) {
    this.modalSelectView.show(params.id);
  },
  modalSelectKamonType:function(params) {
    var size = this.kamonSizeSelectView.getSize();
    var kamon = this.kamonCollection.get(params.id);
    kamon.set({'fileName':params.fileName});
    kamon.trigger('refleshKamonImage',{w:size.w,h:size.h});
  }
});

var ColorPickerView = Backbone.View.extend({
//  className: 'color-pick',
  setColorPickerElement:function(bindElement) {
    this.bindElement = bindElement;
    $(bindElement).colorpicker({
      format:'hex'
    });
  },
  setChangeColorHandler:function() {
    var that = this;
    $(this.bindElement).colorpicker().on('changeColor',function(ev){
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
    this.initColor();
  },
  initColor:function() {
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

var KamonSizeSelect = Backbone.Model.extend({
  initialize:function() {
    this.SMALL  = 1;
    this.MEDIUM = 2;
    this.LARGE  = 3;
  },
  getSize: function(selected) {
    var size = {};
    switch(selected) {
      case this.SMALL:
        size.w = 40;
        size.h = 40;
        break;
      case this.MEDIUM:
        size.w = 80;
        size.h = 80;
        break;
      case this.LARGE:
        size.w = 160;
        size.h = 160;
        break;
    }
    return size;    
  }
});

var KamonSizeSelectView = Backbone.View.extend({
  el:'#kamon-select-size',
  events: {
    'change' : 'change'
  },
  change:function() {
    this.trigger('changeSize');
  },
  getSize: function() {
    var selected = parseInt($('#kamon-select-size').val());
    return this.model.getSize(selected);
  }
});

var ModalSelectView = Backbone.View.extend({
  el:'#modal-kamon-select',
  initialize:function() {
    this.calledModelID = 0;
    var that = this;
    $('.modal-kamon-type').on('click',function(){
      that.$el.modal('hide');
      that.trigger('modalSelectKamonType',{id:that.calledModelID,fileName:$(this).attr('src')});
    });
  },
  setKamonType:function() {
    this.$el.modal('hide');
  },
  show:function(modelID) {
    this.$el.modal('show');
    this.calledModelID = modelID;
  }
});

var KamonSelect = Backbone.Model.extend({
  defaults:{
    id:0,
    fileName:'img/kamon/kikyo.png',
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
    this.model.on('setColorPickerChangeHandler',this.setColorPickerChangeHandler,this);
    this.model.on('refleshColorKamonSelect',this.changeColor,this);
    this.model.on('refleshSizeKamonSelect',this.draw,this);
    this.model.on('refleshKamonImage',this.refleshKamonImage,this);

    this.colorPicker = new ColorPickerView({model: this.model.color});
    this.colorPicker.setColorPickerElement('#kamon-color'+this.model.id);
    this.colorPicker.on('changeColor',this.changeColor,this);

  },
  events: {
    'click .kamon-pick': 'showModal'
  },
  template: _.template($('#kamon-select-template').html()),
  render: function() {
    var template = this.template(this.model.toJSON());
    this.$el.html(template);
    return this;
  },
  showModal:function() {
    this.model.trigger('showModal',{id:this.model.id});
  },
  setColorPickerChangeHandler:function() {
    this.colorPicker.setChangeColorHandler();
  },
  refleshKamonImage:function(kamonSize) {
    $('#kamon-type'+this.model.get('id')).attr('src',this.model.get('fileName'));
    this.draw(kamonSize);
  },
  draw:function(kamonSize) {
    var ctx = this.getCanvasContext(this.canvasID);
    if(ctx) {
      $(this.canvasID).attr({
        'width':kamonSize.w,
        'height':kamonSize.h
      });
      var image = new Image();
      var that = this;
      image.onload = function() {
        ctx.drawImage(image,0,0,kamonSize.w,kamonSize.h);
        that.model.color.initColor();
        that.changeColor();
      };
      image.src = this.model.get('fileName');
    }
  },
  changeColor:function() {
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
    this.collection.on('showModal',this.showModal,this);
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
  setKamonSize: function(size) {
    this.kamonSize = size;
  },
  showModal:function(params) {
    this.trigger('showModal',{id:params.id});
  },
  render: function() {
    this.collection.each(function(kamon) {
      var kamonSelectView = new KamonSelectView({model:kamon});
      this.$el.append(kamonSelectView.render().el);
      kamonSelectView.draw(this.kamonSize);
    },this);
    return this;
  }
});

var KamonPreviewView = Backbone.View.extend({
  el: '#btn-preview',
  events :{
    'click' : 'setBackgroundImage'
  },
  setBackgroundImage:function() {
    var blob = canvasToBlob(document.getElementById('wallpaper-sample'));
    var url = (window.URL || window.webkitURL);
    var data = url.createObjectURL(blob);

    $('body').css('background-image','url('+data+')');
  }
});

var KamonPublishView = Backbone.View.extend({
  el: '#btn-publish',
  initialize:function() {
    this.setInitalSize();
    this.publishCanvasView = new PublishCanvasView();
    this.publishCanvasView.on('loadFinished',this.save);
  },
  events :{
    'click' : 'publish'
  },
  setInitalSize: function() {
    $('#text-wallpaper-width').val('800');
    $('#text-wallpaper-height').val('600');
  },
  getWallPaperSize:function() {
    var size = {};
    size.w = $('#text-wallpaper-width').val();
    size.h = $('#text-wallpaper-height').val();
    return size;
  },
  publish:function() {
    this.publishCanvasView.drawCanvas(this.getWallPaperSize());
  },
  save:function() {
    var blob = canvasToBlob(document.getElementById('publish-canvas'));
    saveBlob(blob,'kamon-wallpaper.png');
  }
});

var PublishCanvasView = CanvasView.extend({
  el: '#publish-canvas',
  drawCanvas: function(canvasSize) {
    //get wallpaper sample
    var kamonCtx = this.getCanvasContext('#wallpaper-sample');
    var sample = {
      w:$('#wallpaper-sample').attr('width'),
      h:$('#wallpaper-sample').attr('height'),
      image:kamonCtx.getImageData(0,0,$('#wallpaper-sample').attr('width'),$('#wallpaper-sample').attr('height'))
    };

    //get output area
    var outputCtx = this.getCanvasContext('#publish-canvas');
    $('#publish-canvas').attr({
      'width':canvasSize.w,
      'height':canvasSize.h
    });

    // calulate drawing times.
    var times_v = Math.ceil(canvasSize.w / sample.w);
    var times_h = Math.ceil(canvasSize.h / sample.h);

    // put images.
    var posX = 0;
    var posY = 0;
    for (i = 0; i < times_v; i++) {
      for (var j = 0; j < times_h; j++) {
        this.putImage(outputCtx,sample.image,posX,posY);
        posX += sample.w;
      }
      posX = 0;
      posY += sample.h;
    }
    this.trigger('loadFinished');
  }
});

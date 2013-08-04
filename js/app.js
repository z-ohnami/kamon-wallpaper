/*
  MainView root for all
*/
var MainView = Backbone.View.extend({
  initialize:function(){
    this.kamonImageCollection = new KamonImageCollection([
      {id:1,fileName:'img/kamon/kikyo.png'},
      {id:2,fileName:'img/kamon/ageha-mon.png'},
      {id:3,fileName:'img/kamon/futa-ba-rindo.png'},
      {id:4,fileName:'img/kamon/mutu-nen-sen-mon.png'}
    ]);

    this.modalSelectView = new ModalSelectView({collection:this.kamonImageCollection});
    this.modalSelectView.on('modalSelectKamonType',this.modalSelectKamonType,this);

    this.sampleView = new SampleView();
    this.sampleView.on('finishedDrawSample',this.setBackgroundPreview,this);

    this.kamonCollection = new KamonCollection([
      {id:1,fileName:'img/kamon/kikyo.png',colorText:'#0F0F0F'},
      {id:2,fileName:'img/kamon/ageha-mon.png',colorText:'#0F0F0F'},
      {id:3,fileName:'img/kamon/futa-ba-rindo.png',colorText:'#000000'},
      {id:4,fileName:'img/kamon/mutu-nen-sen-mon.png',colorText:'#0F0F0F'}
    ]);

    this.kamonSizeSelectView = new KamonSizeSelectView({model:new KamonSizeSelect()});

    this.kamonCollectionView = new KamonCollectionView({collection:this.kamonCollection});
    var size = this.kamonSizeSelectView.getSize();
    this.kamonCollectionView.setKamonSize(size);

    this.kamonCollectionView.on('collectionDrawn',this.drawKamonSample,this);
    this.kamonCollectionView.on('showModal',this.showModal,this);
    this.kamonCollectionView.on('removeKamonType',this.kamonAddTypeViewDisplay,this);

    this.bgColorPickerView = new ColorPickerView();
    this.bgColorPickerView.setColorPickerElement('#background-color-picker');
    this.bgColorPickerView.setChangeColorHandler();
//    this.bgColorPickerView.on('changeColor',this.refleshColor,this);
    this.bgColorPickerView.setColorValue('#98fb98');

    this.kamonAddTypeView = new KamonAddTypeView({collection:this.kamonCollection});
    this.kamonAddTypeView.on('addKamonType',this.showModal,this);

    this.kamonPreviewView = new KamonPreviewView();
    this.kamonPreviewView.on('previewWallpaper',this.refleshSize,this);

    this.kamonPublishView = new KamonPublishView();

  },
  render:function() {
    this.kamonCollectionView.render();
    return this;
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
      this.kamonCollection.at(i).set({'canvasDrawn':false});
      this.kamonCollection.at(i).trigger('refleshSizeKamonSelect',{w:size.w,h:size.h});
    }
  },
  drawKamonSample:function() {
    var size = this.kamonSizeSelectView.getSize();
    var collection = this.kamonCollection;
    this.sampleView.trigger('draw',{kamonSize:size,kamonCollection:collection});
  },
  showModal:function(params) {
    // zero is new type
    var id = (params !== undefined) ? params.id : 0;
    this.modalSelectView.show(id);
  },
  modalSelectKamonType:function(params) {
    if(params.id === 0) {
      // add new
      var kamonSelect = new KamonSelect({fileName:params.fileName});
      this.kamonCollection.add(kamonSelect);
      this.kamonAddTypeView.display();
    } else {
      var size = this.kamonSizeSelectView.getSize();
      var kamon = this.kamonCollection.get(params.id);
      kamon.set({'fileName':params.fileName});
      kamon.trigger('refleshKamonImage',{w:size.w,h:size.h});
    }
  },
  kamonAddTypeViewDisplay:function() {
    this.kamonAddTypeView.display();
  },
  setBackgroundPreview:function() {
    this.kamonPreviewView.setBackgroundPreview();
  }
});

$(function(){
  // initialize application
  var appView = new MainView();
  appView.render();
});


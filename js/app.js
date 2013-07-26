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

$(function(){
  // initialize application
  var appView = new MainView();
  appView.render();
});


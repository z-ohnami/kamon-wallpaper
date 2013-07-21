//(function() {
  // var currentBGColor = {};
  $('.kamon-pick').on('click',function(){
      $('#myModal').modal('show');
      $('#myModal').attr('called-id',$(this).attr('id'));
  });

  $('.kamon-type').on('click',function(){
      $('#myModal').modal('hide');
      $('#'+$('#myModal').attr('called-id')).attr('src',$(this).attr('src'));
      drawKamonSample();
  });

  $('.kamon-edit').on('change',function(e){
      drawKamonSample();
  });

  $('#btn-publish').on('click',function(){
      screenshot();
  });

  $('#btn-preview').on('click',function(){
      setBackgroundImage();
  });

  $('.color-pick').colorpicker({
      format:'hex'
  });

  $('.color-pick').colorpicker().on('changeColor',function(ev){
      var color = ev.color.toHex();
      $(this).val(color).css('background-color',color);
      var newColor = parseColorParams($(this).val());
      if($(this).attr('id') == 'background-color') {
          currentBGColor.change(newColor);
//            changeColor(currentBGColor,newColor);
      } else {
          currentKamonColor.change(newColor);
//            changeColor(currentKamonColor,newColor);
      }
  });

  $(function(){
    // initialize application
    var appView = new MainView();
    appView.render();
//    init();
  });

  function init() {
//        initColor();
    // var kamonCollection = new KamonCollection([
    //   {id:1,fileName:'kikyo.png',colorText:'#0F0F0F'},
    //   {id:2,fileName:'ageha-mon.png',colorText:'#0F0F0F'},
    //   {id:3,fileName:'futa-ba-rindo.png',colorText:'#0F0F0F'},
    //   {id:4,fileName:'mutu-nen-sen-mon.png',colorText:'#0F0F0F'}
    // ]);

    // var kamonCollectionView = new KamonCollectionView({collection:kamonCollection});
    // kamonCollectionView.render();

    var currentKamonColor = new Color();
    var currentBGColor = new Color({currentRed:255,currentGreen:255,currentBlue:255});

    // setTimeout(function(){
    //   drawKamonSample(kamonCollectionView.collection);
    // },5000);
    
  }

    // function initColor() {
    //     currentKamonColor.red   = 15;
    //     currentKamonColor.green = 15;
    //     currentKamonColor.blue  = 15;

    //     currentBGColor.red   = 255;
    //     currentBGColor.green = 255;
    //     currentBGColor.blue  = 255;        
    // }

  // function getCanvasContext() {
  //     var canvas = document.getElementById('wallpaper-sample');
  //     return canvas.getContext('2d');
  // }

  // function drawKamonSample(kamonCollection) {
  //   var ctx = getCanvasContext();
  //   if(ctx) {
  //     // size define.
  //     var size = getKamonSize();
  //     var canvas_w = $('#wallpaper-sample').attr('width');
  //     var canvas_h = $('#wallpaper-sample').attr('height');

  //     // fill with kamon.
  //     fillKamon(
  //       ctx,
  //       // $('#kamon-type1').attr('src'),
  //       kamonCollection,
  //       canvas_w,
  //       canvas_h,
  //       size);
  //   }
  // }

  function changeColor(currentColor,newColor) {
    var ctx = getCanvasContext();
    if(ctx) {
      // size define.
      var size = getKamonSize();
      var canvas_w = $('#wallpaper-sample').attr('width');
      var canvas_h = $('#wallpaper-sample').attr('height');

      // change color settings.
      var repl = replaceColor(
        ctx.getImageData(0,0,canvas_w,canvas_h),
        canvas_w,
        canvas_h,
        currentColor,
        newColor);
      ctx.putImageData(repl,0,0);
      setCurrentColor(currentColor,newColor);
    }
  }

  // function getKamonSize() {
  //   var size = {};
  //   var selected = parseInt($('#kamon-select-size').val());
  //   switch(selected) {
  //     case 1:
  //       size.w = 40;
  //       size.h = 40;
  //       break;
  //     case 2:
  //       size.w = 80;
  //       size.h = 80;
  //       break;
  //     case 3:
  //       size.w = 160;
  //       size.h = 160;
  //       break;
  //   }
  //   return size;
  // }

  // function fillKamon(ctx,kamonCollection,canvas_w,canvas_h,size) {
  //   // calulate drawing times.
  //   var times_v = Math.ceil(canvas_w / size.w);
  //   var times_h = Math.ceil(canvas_h / size.h);

  //   // put images.
  //   var posX = 0;
  //   var posY = 0;
  //   var kamonTotal = kamonCollection.length;
  //   var kamonImageArray = [];
  //   for (var i = 0; i < kamonTotal; i++) {
  //     var id = kamonCollection.models[i].id;
  //     var kamonCanvas = document.getElementById('kamon-canvas'+id);
  //     var kamonCtx = kamonCanvas.getContext('2d');
  //     kamonImageArray.push(kamonCtx);
  //   }

  //   var kamonCnt = 0;
  //   for (i = 0; i < times_v; i++) {
  //     for (var j = 0; j < times_h; j++) {
  //       var image = kamonImageArray[(kamonCnt % kamonTotal)].getImageData(0,0,size.w,size.h);
  //       putImage(ctx,image,posX,posY,size);
  //       posX += size.w;
  //       kamonCnt++;
  //       if(kamonCnt >= kamonTotal )
  //         kamonCnt = 0;
  //     }
  //     posX = 0;
  //     posY += size.h;
  //   }
  // }

  function putImage(ctx,image,x,y,size) {
    ctx.putImageData(image,x,y);
    //ctx.drawImage(image,x,y,size.w,size.h);
    // var image = new Image();
    // image.onload = function() {
    //   ctx.drawImage(image,x,y,size.w,size.h);
    // };
    // image.src = src;
  }

    function replaceColor(imageData,canvas_w,canvas_h,currentColor,newColor) {
        var data = imageData.data;
        for(var x = 0;x < canvas_w;++x) {
            for(var y = 0;y < canvas_h;++y) {
                var index = (x + (y * canvas_h)) * 4;
                var rgb = putColor(data,index,currentColor,newColor);
                data[index+0] = rgb[0];
                data[index+1] = rgb[1];
                data[index+2] = rgb[2];
                data[index+3] = rgb[3];
            }
        }

        imageData.data = data;
        return imageData;
    }

    function putColor(data,index,currentColor,newColor) {
        var rgb = new Array(4);
        if(data[index+0] == currentColor.red
            && data[index+1] == currentColor.green
            && data[index+2] == currentColor.blue
            && data[index+3] == 255
            ) {
            rgb[0] = newColor.red;
            rgb[1] = newColor.green;
            rgb[2] = newColor.blue;
            rgb[3] = 255;
        } else {
            rgb[0] = data[index+0];
            rgb[1] = data[index+1];
            rgb[2] = data[index+2];
            rgb[3] = data[index+3];
        }

        return rgb;
    }

    function parseColorParams(color) {
        var rgb = {};
        rgb.red   = parseInt(color.substr(1,2),16);
        rgb.green = parseInt(color.substr(3,2),16);
        rgb.blue  = parseInt(color.substr(5,2),16);

        return rgb;
    }

    function setCurrentColor(currentColor,newColor) {
        if(currentColor.red == currentKamonColor.red &&
          currentColor.green == currentKamonColor.green &&
          currentColor.blue == currentKamonColor.blue
            ) {
            currentKamonColor.red   = newColor.red;
            currentKamonColor.green = newColor.green;
            currentKamonColor.blue  = newColor.blue;
        } else {
            currentBGColor.red   = newColor.red;
            currentBGColor.green = newColor.green;
            currentBGColor.blue  = newColor.blue;
        }
    }

    function screenshot()
    {
        var blob = canvasToBlob(document.getElementById('wallpaper-sample'));
        saveBlob(blob,'kamon-wallpaper.png');
    }

    function setBackgroundImage() {
        var blob = canvasToBlob(document.getElementById('wallpaper-sample'));
        var url = (window.URL || window.webkitURL);
        var data = url.createObjectURL(blob);

        $('body').css('background-image','url('+data+')');
    }


//})();
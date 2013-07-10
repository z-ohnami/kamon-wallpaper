//(function() {

  function canvasToBlob(targetCanvas) {
      var base64 = targetCanvas.toDataURL();
      // firfoxならtoblobで直接blobにして保存できます。
      return base64toBlob(base64);        
  }

  /**
  saveBlob
  param0:blob blobオブジェクト
  param1:string デフォルトのダウンロードファイル名

  @support (たぶん)
      Chrome 8+
      Firefox(Gecko) 4+
      Internet Explorer 10+
      Opera 12+
      Safari(WebKit) Nightly build
  **/
  function saveBlob(_blob,_file)
  {
      if( /*@cc_on ! @*/ false )
      {   // IEの場合
          window.navigator.msSaveBlob(_blob, _file);
      }
      else    
      {
          var url = (window.URL || window.webkitURL);
          var data = url.createObjectURL(_blob);
          var e = document.createEvent("MouseEvents");
          e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
          var a = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
          a.href = data;
          a.download = _file;   
          a.dispatchEvent(e);
      }
  }
  /*
  base64toBlob
  return:blob blobオブジェクト
  param0:string base64エンコーディングされた文字列

  support(たぶん)
      Chrome 7+
      Firefox(Gecko)4(2)+
      Internet Explorer 10+
      Opera 11.6+
      Safari 5.1+
  */
  function base64toBlob(_base64)
  {
      var i;
      var tmp = _base64.split(',');
      var data = atob(tmp[1]);
      var mime = tmp[0].split(':')[1].split(';')[0];
      var buff = new ArrayBuffer(data.length);
      var arr = new Uint8Array(buff);
      for (i = 0; i < data.length; i++) {arr[i] = data.charCodeAt(i);}
      var blob = new Blob([arr], { type: mime });
      return blob;
  }


//})();
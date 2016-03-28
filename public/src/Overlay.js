  var Overlay = function (canvas) {
    this.canvas_ = canvas;
    this.ctx_ = canvas.getContext('2d');
  };

  Overlay.prototype.refresh = function () {
    var canvas = this.canvas_,
        parent = canvas.parentNode;

    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  };

  Overlay.prototype.converterToGray_ = function () {
    var ctx = this.ctx_,
        canvas = this.canvas_,
        imgData,
        data,
        dataSize;

    if (canvas.width !== 0 && canvas.height !== 0) {
      imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      data = imgData.data;
      dataSize = data.length;

      for (var i = 0; i < dataSize; i += 4) {
        var r = data[i];
        var g = data[i + 1];
        var b = data[i + 2];
        var brightness = 0.34 * r + 0.5 * g + 0.16 * b;
        data[i] = brightness;
        data[i + 1] = brightness;
        data[i + 2] = brightness;
      }

      ctx.putImageData(imgData, 0, 0);
    }
  };

  Overlay.prototype.drawImageBlock = function (canvas, ctx, img, startLeft, startTop, imageWidth, imageHeight, blockWidth, blockHeight) {
    var rateW = blockWidth / canvas.width,
        rateH = blockHeight / canvas.height,
        imgLeft = startLeft / (canvas.width) * imageWidth,
        imgTop = startTop / ( canvas.height ) * imageHeight,
        endImgWidth = imageWidth * rateW,
        endImgHeight = imageHeight * rateH;

    ctx.drawImage(img, imgLeft, imgTop, endImgWidth, endImgHeight, startLeft, startTop, blockWidth, blockHeight);
  };

  Overlay.prototype.render = function (img, selected, imageSize) {
    if (imageSize) {
      var ctx = this.ctx_,
          canvas = this.canvas_,
          width = canvas.width,
          height = canvas.height;

      ctx.drawImage(img, 0, 0, width, height);
      this.converterToGray_();
      this.drawImageBlock(canvas, ctx, img, selected.left, selected.top, imageSize.width, imageSize.height, selected.width, selected.height);
    }
  };

  Overlay.prototype.refreshAndRender = function(img, selected, imageSize) {
    this.refresh();
    this.render(img, selected, imageSize);
  };

  Overlay.prototype.toDataURL = function (type, selected) {
    var canvas = this.canvas_,
        copyCanvas = document.createElement('canvas'),
        ctx = copyCanvas.getContext('2d');

    copyCanvas.width = selected.width;
    copyCanvas.height = selected.height;
    ctx.drawImage(canvas, selected.left, selected.top, selected.width, selected.height, 0, 0, selected.width, selected.height);

    return copyCanvas.toDataURL(type);
  };

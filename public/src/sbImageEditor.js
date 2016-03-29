  app.directive('sbImageEditor', sbImageEditor);

  sbImageEditor.$inject = ['$q', '$document'];
  function sbImageEditor($q, $document) {
    return {
      scope: {
        imgSrc: "=",
        sbImageEditor: "=",
        onImgChange: "&",
        enabledResizeSelector: "=",
        selected: "=",
        aspectRatio: "@"
      },
      template: '<div ng-mouseup="cancel( $event )" unselectable="on">' +
                  '<img unselectable="on" style="opacity:0;user-drag: none;width:100%;height:100%;" crossorigin="Anonymous" ng-src="{{imgSrc}}" ng-mousedown="$event.preventDefault()" />' +
                  '<canvas width="100%" height="100%" style="position:absolute;top:0px;left:0px;"></canvas>' +
                  '<div sb-image-selected></div>' +
                '</div>',
      controller: sbImageEditorCtrl
    };


    sbImageEditorCtrl.$inject = ['$scope', '$element'];
    function sbImageEditorCtrl($scope, $element) {
      var canvas, $canvas, overlay, img, imgSize, $body, watcher;

      $element.css({
        'position': 'relative',
        'user-drag':'none'
      }).attr('unselectable','on');

      $canvas = $element.find('canvas');
      canvas = $canvas[0];
      overlay = new Overlay(canvas);
      img = $element.find('img')[0];
      $body = angular.element(document.body);

      $scope.move = move;
      $scope.onResizeSelected = onResizeSelected;
      $scope.resizeSelected = resizeSelected;
      $scope.cancel = cancel;
      $scope.sbImageEditor = {
        toDataURL: _toDataURL,
        refresh: _refresh
      };

      $scope.$watch('imgSrc', function (src) {
        _getImageSize(src).then(function (size) {
          imgSize = size;
          overlay.refreshAndRender(img, $scope.selected, imgSize);
          $scope.onImgChange()(imgSize);
        });
      });

      $scope.$watch('aspectRatio', function () {
        var selected = $scope.selected;
        $scope.resizeSelected(selected.top, selected.left, selected.width, selected.height);
      });

      $scope.$watchCollection('selected', function (selected) {
        if ($scope.dragEvent == null && imgSize) {
          if (selected.rawInput) {
            _adjustPixelProportions();
          }
          overlay.refreshAndRender(img, selected, imgSize);

          function _adjustPixelProportions() {
            var canvasWidth = overlay.canvas_.width,
                canvasHeight = overlay.canvas_.height,
                pixelWidth = selected.width,
                pixelHeight = selected.height,
                imgWidth = imgSize.width,
                imgHeight = imgSize.height;

            selected.width = (pixelWidth / imgWidth) * canvasWidth;
            selected.height = (pixelHeight / imgHeight) * canvasHeight;
            selected.rawInput = false;
          }
        }
      });

      $document.on('mousemove', function(event) {
        $scope.move(event);
        $scope.$apply();
      });

      $document.on('mouseup', function () {
        $scope.cancel();
      });

      function move(event) {
        var dragEvent = $scope.dragEvent,
            resizeStartEvent = $scope.resizeStartEvent,
            selected = $scope.selected,
            maxY = $element[0].clientHeight - selected.height,
            maxX = $element[0].clientWidth - selected.width,
            top, left;

        if (dragEvent) {
          top = selected.top - (dragEvent.clientY -  event.clientY);
          left = selected.left - (dragEvent.clientX - event.clientX);

          if (top < 0) {
            selected.top = 0;
          } else {
            if (top > maxY) {
              selected.top = maxY;
            } else {
              selected.top = top;
            }
          }

          if (left < 0) {
            selected.left = 0;
          } else {
            if (left > maxX) {
              selected.left = maxX;
            } else {
              selected.left = left;
            }
          }

          overlay.refreshAndRender(img, $scope.selected, imgSize);
          $scope.dragEvent = event;
        } else if (resizeStartEvent) {
          this.onResizeSelected(event);
        }
      }

      function onResizeSelected(event) {
        var resizeStartEvent = $scope.resizeStartEvent,
            y = resizeStartEvent.clientY - event.clientY,
            x = resizeStartEvent.clientX - event.clientX,
            selected = $scope.selected,
            lastTop, lastLeft, lastHeight, lastWidth;

        switch ($scope.resizeDirection) {
          case 'nw':
            _fixAspect();
            lastTop = selected.top - y;
            lastLeft = selected.left - x;
            lastWidth = selected.width + x;
            lastHeight = selected.height + y;
            break;
          case 'ne':
            _fixAspect();
            lastTop = selected.top - y;
            lastLeft = selected.left;
            lastWidth = selected.width - x;
            lastHeight = selected.height + y;
            break;
          case 'sw':
            _fixAspect();
            lastTop = selected.top;
            lastLeft = selected.left - x;
            lastHeight = selected.height - y;
            lastWidth = selected.width + x;
            break;
          case 'se':
            _fixAspect();
            lastTop = selected.top;
            lastLeft = selected.left;
            lastWidth = selected.width - x;
            lastHeight = selected.height - y;
            break;
          case 'tr':
            lastTop = selected.top - y;
            lastHeight = selected.height + y;
            lastLeft = selected.left;
            lastWidth = selected.width;
            break;
          case 'br':
            lastTop = selected.top;
            lastHeight = selected.height - y;
            lastLeft = selected.left;
            lastWidth = selected.width;
            break;
          case 'lc':
            lastTop = selected.top;
            lastHeight = selected.height;
            lastLeft = selected.left - x;
            lastWidth = selected.width + x;
            break;
          case 'rc':
            lastTop = selected.top;
            lastHeight = selected.height;
            lastLeft = selected.left;
            lastWidth = selected.width - x;
            break;
        }

        lastHeight = (lastTop < 0) ? (lastHeight + lastTop) : lastHeight;
        lastWidth = (lastLeft < 0) ? (lastWidth + lastLeft) : lastWidth;

        this.resizeSelected(lastTop, lastLeft, lastWidth, lastHeight);
        $scope.resizeStartEvent = event;

        function _fixAspect() {
          if (angular.isDefined($scope.aspectRatio) && $scope.aspectRatio !== '') {
            var changeInX = x < 0 ? x * -1 : x;
            var changeInY = y < 0 ? y * -1 : y;

            if (changeInX > changeInY) {
              if((x < 0 && y > -1) || (x > -1 && y < 0)) {
                x = y * -1;
              } else {
                x = y;
              }
            } else {
              if ((x < 0 && y > -1) || (x > -1 && y < 0)) {
                y = x * -1;
              } else {
                y = x;
              }
            }
          }
        }
      }

      function resizeSelected(top, left, width, height) {
        var selected = $scope.selected,
            maxY = $element[0].clientHeight - selected.top,
            maxX = $element[0].clientWidth - selected.left,
            newWidth = (width <= maxX) ? (width < 0 ? 0 : width) : maxX,
            newHeight = (height <= maxY) ? (height < 0 ? 0 : height) : maxY;

        if (angular.isDefined($scope.aspectRatio) && $scope.aspectRatio !== '') {
          var aspectRatio = parseInt($scope.aspectRatio.split(':')[0]) /
                            parseInt($scope.aspectRatio.split(':')[1]);

          if (isNaN(aspectRatio)) {
            throw 'Invalid aspect-ratio';
          }

          if (selected.width == newWidth) {
            takeHeight();
          } else if (selected.height == newHeight) {
            takeWidth();
          } else if (height - newHeight > width - newWidth) {
            takeHeight();
          } else {
            takeWidth();
          }
        } else {
          selected.top = top > 0 ? (top < selected.top + selected.height ? top : selected.top) : 0;
          selected.left = left > 0 ? (left < selected.left + selected.width ? left : selected.left) : 0;
          selected.width = width <= maxX ? (width < 0 ? 0 : width) : maxX;
          selected.height = height <= maxY ? (height < 0 ? 0 : height) : maxY;
        }

        function takeWidth() {
          var aspectHeight = newWidth / aspectRatio;
          if (aspectHeight > maxY) {
            selected.height = maxY;
            selected.width = maxY * aspectRatio;
          } else {
            selected.height = aspectHeight;
            selected.width = newWidth;
          }

          selected.left = left > 0 ? (left < selected.left + selected.width ? left : selected.left) : 0;
        }

        function takeHeight() {
          var aspectWidth = newHeight * aspectRatio;
          if (aspectWidth > maxX) {
            selected.width = maxX;
            selected.height = maxX / aspectRatio;
          } else {
            selected.height = newHeight;
            selected.width = newHeight * aspectRatio;
          }

          selected.left = left > 0 ? (left < selected.left + selected.width ? left : selected.left) : 0;
        }
      }

      function cancel() {
        $scope.dragEvent = null;
        $scope.resizeStartEvent = null;
      }

      function _getImageSize(currentImg) {
        var img = new Image(),
            div = document.createElement('div'),
            deferred = $q.defer(),
            $body = angular.element(document.body);

        img.crossOrigin = 'Anonymous';
        div.style.cssText = "width:0px;height:0px;overflow:hidden;";

        img.onload = function () {
          var width = img.width,
              height = img.height;

          div.parentNode.removeChild(div);
          deferred.resolve({
            width: width,
            height: height
          });
        };

        div.appendChild(img);
        img.src = angular.isString(currentImg) ? currentImg : currentImg.src;
        $body.append( div );

        return deferred.promise;
      }

      function _toDataURL(type){
        var imageType = type ? type : 'image/png';
        return overlay.toDataURL(imageType, $scope.selected);
      }

      function _refresh(){
        overlay.refreshAndRender(img, $scope.selected, imgSize);
      }
    }
  }

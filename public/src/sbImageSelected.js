  app.directive('sbImageSelected', sbImageSelected);

  sbImageSelected.$inject = [];
  function sbImageSelected() {
    return {
      require: '^sbImageEditor',
      selected: '=',
      template: '<div style="box-sizing:border-box;background:rgba(255, 255, 255, 0.1);border:2px dashed #eaeaea;cursor:all-scroll;position:absolute;" ng-style="{width:selected.width + \'px\' , height:selected.height + \'px\',left:selected.left + \'px\',top:selected.top + \'px\'}" ng-mousedown="dragEvent=$event;$event.preventDefault()">' +
                  '<div ng-style="{display:enabledResizeSelector?\'block\':\'none\'}" ng-mousedown="onResizeBlock( $event, \'nw\' )" style="width: 8px;height: 8px;background: rgba(151, 151, 151, 0.7);top: -4px;left: -4px;position: absolute; cursor: nw-resize;"></div>' +
                  '<div ng-style="{display:enabledResizeSelector?\'block\':\'none\'}" ng-mousedown="onResizeBlock( $event, \'ne\' )" style="width: 8px;height: 8px;background: rgba(151, 151, 151, 0.7);top: -4px;right: -4px;position: absolute; cursor: ne-resize;"></div>' +
                  '<div ng-style="{display:enabledResizeSelector?\'block\':\'none\'}" ng-mousedown="onResizeBlock( $event, \'sw\' )" style="width: 8px;height: 8px;background: rgba(151, 151, 151, 0.7);bottom: -4px;left: -4px;position: absolute; cursor: sw-resize;"></div>' +
                  '<div ng-style="{display:enabledResizeSelector?\'block\':\'none\'}" ng-mousedown="onResizeBlock( $event, \'se\' )" style="width: 8px;height: 8px;background: rgba(151, 151, 151, 0.7);bottom: -4px;right: -4px;position: absolute; cursor: se-resize; "></div>' +
                  '<div ng-style="{display:enabledResizeSelector?\'block\':\'none\'}" ng-mousedown="onResizeBlock( $event, \'tr\' )" style="width: 8px;height: 8px;background: rgba(151, 151, 151, 0.7);top: -4px;right: 49%;position: absolute; cursor: row-resize; "></div>' +
                  '<div ng-style="{display:enabledResizeSelector?\'block\':\'none\'}" ng-mousedown="onResizeBlock( $event, \'br\' )" style="width: 8px;height: 8px;background: rgba(151, 151, 151, 0.7);bottom: -4px;right: 49%;position: absolute; cursor: row-resize; "></div>' +
                  '<div ng-style="{display:enabledResizeSelector?\'block\':\'none\'}" ng-mousedown="onResizeBlock( $event, \'lc\' )" style="width: 8px;height: 8px;background: rgba(151, 151, 151, 0.7);bottom: 49%;left: -4px;position: absolute; cursor: col-resize;; "></div>' +
                  '<div ng-style="{display:enabledResizeSelector?\'block\':\'none\'}" ng-mousedown="onResizeBlock( $event, \'rc\' )" style="width: 8px;height: 8px;background: rgba(151, 151, 151, 0.7);bottom: 49%;right: -4px;position: absolute; cursor: col-resize;; "></div>' +
                '</div>',
      replace: true,
      link: linkFn
    };

    linkFn.$inject = ['scope'];
    function linkFn(scope) {
      scope.onResizeBlock = onResizeBlock;

      function onResizeBlock(event, direction) {
        event.preventDefault();
        event.stopPropagation();

        this.resizeStartEvent = event;
        this.resizeDirection = direction;
      }
    }
  }

'use strict';

(function($) {
    var events = {
        drag: 'mousemove touchmove',
        dragstart: 'mousedown touchstart',
        dragend: 'mouseup touchend',
        selectstart: 'selectstart'
    },
    $body = $(document.body);

    function Sortable(element, options) {
        this.options = $.extend({
            items: '.sortable-element',
            dragX: true,
            dragY: true,
            onChange: null,
            onDragstart: null,
            onDrag: null,
            onDragend: null
        }, options);

        this.state = null;
        this.$element = $(element);
        this.$activeElement = null;

        this.refresh();
    }

    Sortable.prototype.refresh = function() {
        var self = this,
                $elements = $(this.options.items, this.$element);

        $body.off(events.dragend)
                .off(events.drag);

        $elements
                .off(events.dragstart);

        if (!this.$activeElement) {
            $elements.on(events.dragstart, function(e) {
                self.dragstart(e);
            });
        }
    };

    Sortable.prototype.drag = function(event) {
        console.log('drag');
        this.options.onDrag(event);
        if (event.isPropagationStopped())
            return;

        var self = this,
                $items = $(this.options.items, this.$element),
                selfIdx = Array.prototype.indexOf.call($items, this.$activeElement[0]),
                dragElement = this.$dragElement[0];

        var found = false;
        var otherIdx;

        this.$dragElement.css('top', '+=' + (event.clientY - this.state.clientY));
        this.$dragElement.css('left', '+=' + (event.clientX - this.state.clientX));

        var item;

        for (var i = 0; i < $items.length - 1 && !found; i++) {
            item = $items[i];
            if (item === this.$activeElement[0]) {
                continue;
            }

            var offsetY = event.offsetY + dragElement.offsetTop;
            var offsetX = event.offsetX + dragElement.offsetLeft;

            if (offsetY > item.offsetTop
                    && offsetY < item.offsetTop + item.offsetHeight
                    && offsetX > item.offsetLeft
                    && offsetX < item.offsetLeft + item.offsetWidth) {

                otherIdx = Array.prototype.indexOf.call($items, item);
                self.options.onChange(selfIdx, otherIdx);
                found = true;
            }
        }

        this.state = event;
    };
    Sortable.prototype.dragstart = function(event) {
        if (event.which !== 1) {
            // Make sure it is a left mouse click
            return;
        }
        var self = this,
                position;

        this.options.onDragstart(event);
        if (event.isPropagationStopped())
            return;

        $body.attr('unselectable', 'on');

        this.$activeElement = $(event.target);
        position = this.$activeElement.position();

        // Insert placeholder after element
        this.$dragElement = $('<' + event.target.tagName + '/>').html(event.target.innerHTML)
                .css({
                    width: this.$activeElement[0].offsetWidth,
                    height: this.$activeElement[0].offsetHeight,
                    top: position.top,
                    left: position.left
                })
                .addClass('sortable-element sortable-element-dragitem')
                .appendTo(event.target.parentNode);

        this.$activeElement
                .addClass('sortable-element-active');

        this.$element.addClass('sortable-active');

        $(this.options.items, this.$element).off(events.dragstart);

        $body
                .on(events.drag, function(e) {
                    self.drag(e);
                })
                .on(events.dragend, function(e) {
                    self.dragend(e);
                })
                .on(events.selectstart, function(e) {
                    e.preventDefault();
                    return false;
                });

        this.state = event;
    };

    Sortable.prototype.dragend = function(event) {
        var self = this;

        this.options.onDragend(event);
        if (event.isPropagationStopped())
            return;

        $body.attr('unselectable', 'off')
                .off(events.drag)
                .off(events.dragend)
                .off(events.selectstart);

        $(this.options.items, this.$element)
                .on(events.dragstart, function(e) {
                    return self.dragstart(e);
                });

        this.$activeElement.removeClass('sortable-element-active');

        this.$element.removeClass('sortable-active');

        this.$dragElement.remove();

        this.$activeElement = null;
    };

    var safeApply = function($scope, fn) {
        var phase = $scope.$root.$$phase;
        if (phase === '$apply' || phase === '$digest') {
            if (fn && (typeof (fn) === 'function')) {
                fn();
            }
        } else {
            $scope.$root.$apply(fn);
        }
    };

    angular.module('angularSortable', [])
            .directive('sortable',
                    function() {
                        return {
                            restrict: 'A',
                            scope: {
                                sortable: '=',
                                sortableOnChange: '=',
                                sortableOnDrag: '=',
                                sortableOnDragStart: '=',
                                sortableOnDragEnd: '='
                            },
                            controller: function($scope, $element, $attrs) {
                                function onChange(fromIdx, toIdx) {
                                    if (fromIdx === toIdx)
                                        return;

                                    console.log('change( ' + fromIdx + ', ' + toIdx + ')');
                                    safeApply($scope, function() {
                                        var temp = $scope.sortable[fromIdx];
                                        $scope.sortable[fromIdx] = $scope.sortable[toIdx];
                                        $scope.sortable[toIdx] = temp;
                                    });
                                }

                                var options = {
                                    onChange: onChange,
                                    onDrag: $scope.sortableOnDrag || $.noop,
                                    onDragstart: $scope.sortableOnDragStart || $.noop,
                                    onDragend: $scope.sortableOnDragEnd || $.noop
                                };

                                if($scope.sortableOnChange) {
                                    options.onChange = function(fromIdx, toIdx) {
                                        onChange(fromIdx, toIdx);
                                        $scope.sortableOnChange(fromIdx, toIdx);
                                    };
                                }

                                var sortable = new Sortable($element, options);

                                $scope.$watch('sortable.length', function(newValue, oldValue) {
                                    sortable.refresh();
                                });
                            }
                        };
                    });
}(jQuery));
'use strict';

(function ($) {
    var events = {
        drag: 'mousemove touchmove',
        dragstart: 'mousedown touchstart',
        dragend: 'mouseup touchend',
        selectstart: 'selectstart'
    };
    var classes = {
        sorting: 'sortable-sorting',
        item: 'sortable-item',
        handle: 'sortable-handle',
        clone: 'sortable-clone',
        active: 'sortable-activeitem',
    }
    var $body = $(document.body);
    var debounceMs = 2;

    function debounce(fn, wait, immediate) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) {
                    fn.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                fn.apply(context, args);
            }
        };
    };

    function Sortable(element, options) {
        this.options = $.extend({
            items: '.sortable',
            handles: null,
            zindex: '9000',
            dragX: true,
            dragY: true,
            onChange: null,
            onDragstart: null,
            onDrag: null,
            onDragend: null
        }, options);

        this.enabled = null;
        this.state = null;
        this.$element = $(element);
        this.$activeItem = null;

        this.refresh();
    }

    Sortable.prototype.enable = function (enabled) {
        var self = this;
        this.enabled = enabled;
    };

    Sortable.prototype.refresh = function () {
        var self = this;
        var $items = $(this.options.items, this.$element);

        // fixed class used to mark the elements, makes sure the event target is not set to a child node
        // not using `this.options.items` because that one is a selector (can have any form) controlled by client code
        $items.addClass(classes.item);
        // adding unselectable to draggable items
        $items.attr('unselectable', 'on');

        $body.off(events.dragend).off(events.drag);
        $items.off(events.dragstart);

        if (this.enabled) {
            if (!this.$activeItem) {
                $items.on(events.dragstart, function (e) {
                    self.dragstart(e);
                });
            }
        }
    };

    var detect = debounce(function (context, event) {

        var $items = $('.' + classes.item, context.$element);
        var dragElement = context.$dragElement[0];

        // caching before loop
        var ix;
        var item;
        var length = $items.length;
        var offsetX = event.offsetX + dragElement.offsetLeft;
        var offsetY = event.offsetY + dragElement.offsetTop;

        for (ix = 0; ix < length; ix++) {
            item = $items[ix];
            if (ix === context.draggingIdx) {
                continue;
            }

            if (offsetY > item.offsetTop
                    && (offsetY < item.offsetTop + item.offsetHeight)
                    && offsetX > item.offsetLeft
                    && offsetX < item.offsetLeft + item.offsetWidth
                ) {

                context.$activeItem.removeClass(classes.active);
                context.$activeItem = $($items[ix]);
                context.$activeItem.addClass(classes.active);
                context.options.onChange(context.draggingIdx, ix);
                context.draggingIdx = ix;
                break;
            }
        }

    }, debounceMs);

    Sortable.prototype.drag = function (event) {
        this.options.onDrag(event);
        if (event.isPropagationStopped()) {
            return;
        }

        this.$dragElement.css('top', '+=' + (event.clientY - this.state.clientY));
        this.$dragElement.css('left', '+=' + (event.clientX - this.state.clientX));

        detect(this, event);

        this.state = event;
    }

    Sortable.prototype.dragstart = function (event) {
        if (event.which !== 1) {
            // Make sure it is a left mouse click
            return;
        }
        var self = this;
        var $items = $('.' + classes.item, self.$element);
        var $target = $(event.target);
        // make sure event.target is a handle
        if (this.options.handles) {
            // marking all handles with a css class in order to be able to detect them on drag start using `$.closest()`
            // regardless of what selector the client used
            // doing it here and not on refresh because when referesh runs, the child nodes of the ng-repeat are not fully rendered
            if (this.options.handles) {
                $items.find(this.options.handles).addClass(classes.handle);
            }
            if (!$target.closest('.' + classes.handle).length) {
                return;
            }
        }

        this.options.onDragstart(event);
        if (event.isPropagationStopped()) {
            return;
        }

        // makes sure event target is the sortable element, not some child
        event.target = (function () {
            if ($target.hasClass(classes.item)) {
                return event.target;
            }
            else {
                return $target.closest('.' + classes.item)[0];
            }
        })();

        self.bodyUnselectable = $body.attr('unselectable');
        $body.attr('unselectable', 'on');

        // clones the css classes before cloning the element
        var className = $(event.target).attr('class');

        this.$activeItem = $(event.target).addClass(classes.active);
        var position = this.$activeItem.position();

        self.draggingIdx = Array.prototype.indexOf.call($items, self.$activeItem[0]);

        // Todo: The following will eventually cause problems related to styling,
        // this should be a clone of the activeElement without all the angular bindings...
        this.$dragElement = $('<' + event.target.tagName + '/>').html(event.target.innerHTML)
            .css({
                'z-index': this.options.zindex,
                width: this.$activeItem[0].offsetWidth,
                height: this.$activeItem[0].offsetHeight,
                top: position.top,
                left: position.left
            })
            .addClass(className + ' ' + classes.clone)
            .removeClass(classes.item)
            .appendTo(event.target.parentNode);

        this.$element.addClass(classes.sorting);

        $(this.options.items, this.$element).off(events.dragstart);

        $body.on(events.drag, function (e) {
                self.drag(e);
            })
            .on(events.dragend, function (e) {
                self.dragend(e);
            })
            .on(events.selectstart, function (e) {
                e.preventDefault();
                return false;
            });

        this.state = event;
    };

    Sortable.prototype.dragend = function (event) {
        var self = this;

        self.draggingIdx = null;

        this.options.onDragend(event);
        if (event.isPropagationStopped()) {
            return;
        }

        $body.attr('unselectable', self.bodyUnselectable)
            .off(events.drag)
            .off(events.dragend)
            .off(events.selectstart);

        $(this.options.items, this.$element)
            .on(events.dragstart, function (e) {
                return self.dragstart(e);
            });

        this.$activeItem.removeClass(classes.active);
        this.$activeItem = null;

        this.$element.removeClass(classes.sorting);

        this.$dragElement.remove();
    };

    var safeApply = function ($scope, fn) {
        var phase = $scope.$root.$$phase;
        if (phase === '$apply' || phase === '$digest') {
            if (fn && (typeof (fn) === 'function')) {
                fn();
            }
        } else {
            $scope.$root.$apply(fn);
        }
    };

    angular.module('sortable', []).directive('ngSortable', function () {
        return {
            restrict: 'A',
            scope: {
                ngSortable: '=',
                ngSortableItems: '@',
                ngSortableHandles: '@',
                ngSortableZindex: '@',
                ngSortableDisable: '=',
                ngSortableOnChange: '=',
                ngSortableOnDrag: '=',
                ngSortableOnDragstart: '=',
                ngSortableOnDragend: '='
            },
            link: function ($scope, $element, $attrs) {
                var items = $scope.ngSortable;

                if (!items) {
                    items = [];
                }

                function onChange(fromIdx, toIdx) {
                    safeApply($scope, function () {
                        var temp = items.splice(fromIdx, 1);
                        items.splice(toIdx, 0, temp[0]);
                    });
                }

                var options = {
                    items: $scope.ngSortableItems,
                    handles: $scope.ngSortableHandles,
                    zindex: $scope.ngSortableZindex,
                    onChange: onChange,
                    onDrag: $scope.ngSortableOnDrag || $.noop,
                    onDragstart: $scope.ngSortableOnDragstart || $.noop,
                    onDragend: $scope.ngSortableOnDragend || $.noop
                };

                if ($scope.ngSortableOnChange) {
                    options.onChange = function (fromIdx, toIdx) {
                        onChange(fromIdx, toIdx);
                        $scope.ngSortableOnChange(fromIdx, toIdx);
                    };
                }

                var sortable = new Sortable($element, options);

                $scope.$watch('ngSortableDisable', function () {
                    sortable.enable(!$scope.ngSortableDisable);
                });

                $scope.$watch('ngSortable.length', function () {
                    sortable.refresh();
                });
            }
        };
    });

}(jQuery));
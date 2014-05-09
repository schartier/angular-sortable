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
            onChange: $.noop,
            onDragstart: $.noop,
            onDrag: $.noop,
            onDragend: $.noop
        }, options);

        this.state = null;
        this.$element = $(element);
        this.$activeElement = null;
        this.dragging = false;

        this.refresh();
    }

    Sortable.prototype.refresh = function() {
        var self = this;

        $body.off(events.dragend)
                .off(events.drag);

        $(this.options.items, this.$element)
                .off(events.dragstart);

        if (!this.dragging) {
            $(this.options.items, this.$element).on(events.dragstart, function(e) {
                self.dragstart(e);
            });
        }
    };

    function getState(event) {
        return $.extend({}, event);
    }

    Sortable.prototype.drag = function(event) {
        var newState = getState(event),
                horizontalCallback,
                verticalCallback,
                self = this,
                selfIdx = Array.prototype.indexOf.call($(this.options.items, this.$element), this.$activeElement[0]),
                dragItem = this.$dragItem[0];

        this.options.onDrag(event);
        if(event.isPropagationStopped())
            return;

        var found = false;
        if (this.options.dragY) {
            var otherIdx;

            event.deltaY = newState.clientY - this.state.clientY;

            if (event.deltaY
                    && dragItem.offsetTop + event.deltaY >= 0
                    && dragItem.offsetTop + event.deltaY + dragItem.offsetHeight <= this.$element[0].offsetHeight) {
                // Make sure we still inside the container

                this.$dragItem.css('top', '+=' + event.deltaY);
                if (event.deltaY > 0) {
                    console.log('down');
                    // Going down
                    verticalCallback = function(other) {
                        var delta = dragItem.offsetTop + dragItem.offsetHeight - other.offsetTop;

                        if (delta < other.offsetHeight
                                && delta > other.offsetHeight / 2) {

                            otherIdx = Array.prototype.indexOf.call($(self.options.items, self.$element), other);
//                            if(otherIdx > selfIdx) {
                                self.options.onChange(selfIdx, otherIdx);
                                found = true;
//                            }
                        }
                    };
                } else {
                    console.log('up');
                    // Going up
                    verticalCallback = function(other) {
                        var delta = dragItem.offsetTop - other.offsetTop;
                        if (delta > 0
                                && delta < other.offsetHeight / 2) {

                            otherIdx = Array.prototype.indexOf.call($(self.options.items, self.$element), other);
//                            if(otherIdx < selfIdx) {
                                self.options.onChange(selfIdx, otherIdx);
                                found = true;
//                            }
                        }
                    };
                }
            }
        }

//        if (this.options.dragX) {
//            event.deltaX = newState.clientX - this.state.clientX;
//
//            if (event.deltaX
//                    && dragItem.offsetLeft + event.deltaX > 0
//                    && dragItem.offsetLeft + event.deltaX + dragItem.offsetWidth < this.$element[0].offsetWidth) {
//
//                this.$activeElement.css('left', '+=' + event.deltaX);
//                if (event.deltaX > 0) {
//                    // Going right
//                    horizontalCallback = function(other) {
//                        var delta = dragItem.offsetLeft + dragItem.offsetWidth - other.offsetLeft;
//                        if (delta < other.offsetWidth
//                                && delta > other.offsetWidth / 2) {
//
//                            otherIdx = Array.prototype.indexOf.call($(self.options.items, self.$element), other);
//                            self.options.onChange(selfIdx, otherIdx);
//                            found = true;
//                        }
//                    };
//                } else {
//                    // Going left
//                    horizontalCallback = function(other) {
//                        var delta = dragItem.offsetLeft - other.offsetLeft;
//                        if (delta > 0
//                                && delta < other.offsetWidth / 2) {
//
//                            otherIdx = Array.prototype.indexOf.call($(self.options.items, self.$element), other);
//                            self.options.onChange(selfIdx, otherIdx);
//                            found = true;
//                        }
//                    };
//                }
//            }
//        }

        if (verticalCallback || horizontalCallback) {
            var i, element;

            for (i = 0; i < $(this.options.items, this.$element).length; i++) {
                element = $(this.options.items, this.$element)[i];
                if (element === self.$activeElement[0]) {
                    continue;
                }

                if (verticalCallback) {
                    verticalCallback(element);
                }
                if (horizontalCallback) {
                    horizontalCallback(element);
                }

                if (found) {
//                    self.options.onChange({}, this);
                    break;
                }
            }

            this.state = newState;
        }
    };
//    Sortable.prototype.switch = function(fromIdx, toIdx) {
//
//    };
    Sortable.prototype.dragstart = function(event) {
        if (event.which !== 1) {
            // Make sure it is a left mouse click
            return;
        }
        var self = this,
                position;

        this.options.onDragstart(event);
        if(event.isPropagationStopped())
            return;

        $body.attr('unselectable', 'on');

        this.$activeElement = $(event.target);
        position = this.$activeElement.position();

        // Insert placeholder after element
        this.$dragItem = $('<' + event.target.tagName + '/>').html(event.target.innerHTML)
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

        this.state = getState(event);
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

        this.dragging = true;
    };

    Sortable.prototype.dragend = function(event) {
        var self = this;

        this.options.onDragend(event);
        if(event.isPropagationStopped())
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

        this.$dragItem.remove();

        this.dragging = false;
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

    angular.module('app')
            .directive('sortable', ['$q',
                function($q) {
                    return {
                        restrict: 'A',
                        scope: {
                            sortable: '='
                        },
                        link: function($scope, $element, $attrs) {
                            var options = angular.extend({
                                items: '.sortable-element',
                                handle: '.sortable-handle',
                                onChange: function(fromIdx, toIdx) {
                                    console.log('change( ' + fromIdx + ', ' + toIdx + ')');
                                    safeApply($scope, function(){
                                        var temp = $scope.sortable[fromIdx];
                                        $scope.sortable[fromIdx] = $scope.sortable[toIdx];
                                        $scope.sortable[toIdx] = temp;
                                    });
                                },
                                onDragstart: function() {
                                    
                                },
                                onDragend: function() {

                                }
                            });

                            var sortable = new Sortable($element, options);

                            $scope.$watch('sortable.length', function(newValue, oldValue) {
                                sortable.refresh();
                            });
                        }
                    };
                }]);
}(jQuery));
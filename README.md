angular-sortable
================

Very simple jquery-ui like sortable that does not require jquery-ui... Look further to see the features that are not implemented yet :)

Demo: http://sebastien.chartier.pro/angular-sortable

Plunker: http://plnkr.co/edit/L33H0T?p=preview

I am trying to make the best sortable directive for Angular.js, your contribution is very welcome :)

I figured out that when we detect that the order should be updated, instead of proceeding to complex DOM manipulations, updating the referenced array would produce the same result, the "Angular" way (this is my personal opinion)...



Installation
------------

```
bower install angular-sortable --save
```

Usage
-----

```
<ul ng-sortable="items">
        <li ng-repeat="item in items" class="sortable-element" ng-style="{backgroundColor: item.color}">
            {{item.name}}, {{item.profession}}
        </li>
    </ul>
```

Other options
-------------

Options are defined as tag attributes:

- ng-sortable-on-change (optional)
- ng-sortable-on-dragstart (optional)
- ng-sortable-on-dragend (optional)
- ng-sortable-on-drag (optional)
        
Example
-------

```
<ul ng-sortable="items"
    ng-sortable-on-change="onItemsChange"
    ng-sortable-on-dragstart="onItemsDragstart"
    ng-sortable-on-dragend="onItemsDragend"
    ng-sortable-on-drag="onItemsDrag">
    
    <li ng-repeat="item in items" class="sortable-element" ng-style="{backgroundColor: item.color}">
      {{item.name}}, {{item.profession}}
    </li>
</ul>
```

Important features missing from jQuery.ui Sortable
--------------------------------------------------

- Connect list: Sort items from one list into another and vice versa (http://jqueryui.com/sortable/#connect-lists).
- Delay start: Prevent accidental sorting either by delay (time) or distance (http://jqueryui.com/sortable/#delay-start).
- Handle empty lists: Prevent all items in a list from being dropped into a separate, empty list using the dropOnEmpty option set to false (http://jqueryui.com/sortable/#empty-lists).
- Include exclude items: Specify which items are eligible to sort by passing a jQuery selector into the items option (http://jqueryui.com/sortable/#items).

Not sure about features
-----------------------
- Should we integrate with Bootstrap or keep styling to a minimum?

Your ideas are welcome, don't hesitate to contact me at sebastien.chartier@gmail.com :)


















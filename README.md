angular-sortable
================

Angular directive that mimics the sortable jquery-ui component.

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

- ng-sortable-on-change
- ng-sortable-on-dragstart
- ng-sortable-on-dragend
- ng-sortable-on-drag
        
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

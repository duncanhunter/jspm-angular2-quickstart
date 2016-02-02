import {bootstrap}  from 'angular2/platform/browser';
import {AppComponent} from './app.component';
bootstrap(AppComponent);


import {Component} from 'angular2/core';
@Component({
    selector: 'my-app',
    template: '<h1>My First Angular 2 App</h1>'
})
export class AppComponent { }


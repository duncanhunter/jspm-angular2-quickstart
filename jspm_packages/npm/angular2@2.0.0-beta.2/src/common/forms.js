'use strict';/**
 * @module
 * @description
 * This module is used for handling user input, by defining and building a {@link ControlGroup} that
 * consists of
 * {@link Control} objects, and mapping them onto the DOM. {@link Control} objects can then be used
 * to read information
 * from the form DOM elements.
 *
 * This module is not included in the `angular2` module; you must import the forms module
 * explicitly.
 *
 */
var model_1 = require('./forms/model');
exports.AbstractControl = model_1.AbstractControl;
exports.Control = model_1.Control;
exports.ControlGroup = model_1.ControlGroup;
exports.ControlArray = model_1.ControlArray;
var abstract_control_directive_1 = require('./forms/directives/abstract_control_directive');
exports.AbstractControlDirective = abstract_control_directive_1.AbstractControlDirective;
var control_container_1 = require('./forms/directives/control_container');
exports.ControlContainer = control_container_1.ControlContainer;
var ng_control_name_1 = require('./forms/directives/ng_control_name');
exports.NgControlName = ng_control_name_1.NgControlName;
var ng_form_control_1 = require('./forms/directives/ng_form_control');
exports.NgFormControl = ng_form_control_1.NgFormControl;
var ng_model_1 = require('./forms/directives/ng_model');
exports.NgModel = ng_model_1.NgModel;
var ng_control_1 = require('./forms/directives/ng_control');
exports.NgControl = ng_control_1.NgControl;
var ng_control_group_1 = require('./forms/directives/ng_control_group');
exports.NgControlGroup = ng_control_group_1.NgControlGroup;
var ng_form_model_1 = require('./forms/directives/ng_form_model');
exports.NgFormModel = ng_form_model_1.NgFormModel;
var ng_form_1 = require('./forms/directives/ng_form');
exports.NgForm = ng_form_1.NgForm;
var control_value_accessor_1 = require('./forms/directives/control_value_accessor');
exports.NG_VALUE_ACCESSOR = control_value_accessor_1.NG_VALUE_ACCESSOR;
var default_value_accessor_1 = require('./forms/directives/default_value_accessor');
exports.DefaultValueAccessor = default_value_accessor_1.DefaultValueAccessor;
var ng_control_status_1 = require('./forms/directives/ng_control_status');
exports.NgControlStatus = ng_control_status_1.NgControlStatus;
var checkbox_value_accessor_1 = require('./forms/directives/checkbox_value_accessor');
exports.CheckboxControlValueAccessor = checkbox_value_accessor_1.CheckboxControlValueAccessor;
var select_control_value_accessor_1 = require('./forms/directives/select_control_value_accessor');
exports.NgSelectOption = select_control_value_accessor_1.NgSelectOption;
exports.SelectControlValueAccessor = select_control_value_accessor_1.SelectControlValueAccessor;
var directives_1 = require('./forms/directives');
exports.FORM_DIRECTIVES = directives_1.FORM_DIRECTIVES;
var validators_1 = require('./forms/validators');
exports.NG_VALIDATORS = validators_1.NG_VALIDATORS;
exports.NG_ASYNC_VALIDATORS = validators_1.NG_ASYNC_VALIDATORS;
exports.Validators = validators_1.Validators;
var validators_2 = require('./forms/directives/validators');
exports.RequiredValidator = validators_2.RequiredValidator;
exports.MinLengthValidator = validators_2.MinLengthValidator;
exports.MaxLengthValidator = validators_2.MaxLengthValidator;
var form_builder_1 = require('./forms/form_builder');
exports.FormBuilder = form_builder_1.FormBuilder;
exports.FORM_PROVIDERS = form_builder_1.FORM_PROVIDERS;
exports.FORM_BINDINGS = form_builder_1.FORM_BINDINGS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7R0FZRztBQUNILHNCQUFtRSxlQUFlLENBQUM7QUFBM0Usa0RBQWU7QUFBRSxrQ0FBTztBQUFFLDRDQUFZO0FBQUUsNENBQW1DO0FBRW5GLDJDQUF1QywrQ0FBK0MsQ0FBQztBQUEvRSx5RkFBK0U7QUFFdkYsa0NBQStCLHNDQUFzQyxDQUFDO0FBQTlELGdFQUE4RDtBQUN0RSxnQ0FBNEIsb0NBQW9DLENBQUM7QUFBekQsd0RBQXlEO0FBQ2pFLGdDQUE0QixvQ0FBb0MsQ0FBQztBQUF6RCx3REFBeUQ7QUFDakUseUJBQXNCLDZCQUE2QixDQUFDO0FBQTVDLHFDQUE0QztBQUNwRCwyQkFBd0IsK0JBQStCLENBQUM7QUFBaEQsMkNBQWdEO0FBQ3hELGlDQUE2QixxQ0FBcUMsQ0FBQztBQUEzRCwyREFBMkQ7QUFDbkUsOEJBQTBCLGtDQUFrQyxDQUFDO0FBQXJELGtEQUFxRDtBQUM3RCx3QkFBcUIsNEJBQTRCLENBQUM7QUFBMUMsa0NBQTBDO0FBQ2xELHVDQUFzRCwyQ0FBMkMsQ0FBQztBQUFwRSx1RUFBb0U7QUFDbEcsdUNBQW1DLDJDQUEyQyxDQUFDO0FBQXZFLDZFQUF1RTtBQUMvRSxrQ0FBOEIsc0NBQXNDLENBQUM7QUFBN0QsOERBQTZEO0FBQ3JFLHdDQUEyQyw0Q0FBNEMsQ0FBQztBQUFoRiw4RkFBZ0Y7QUFDeEYsOENBR08sa0RBQWtELENBQUM7QUFGeEQsd0VBQWM7QUFDZCxnR0FDd0Q7QUFDMUQsMkJBQThCLG9CQUFvQixDQUFDO0FBQTNDLHVEQUEyQztBQUNuRCwyQkFBNkQsb0JBQW9CLENBQUM7QUFBMUUsbURBQWE7QUFBRSwrREFBbUI7QUFBRSw2Q0FBc0M7QUFDbEYsMkJBS08sK0JBQStCLENBQUM7QUFKckMsMkRBQWlCO0FBQ2pCLDZEQUFrQjtBQUNsQiw2REFFcUM7QUFDdkMsNkJBQXlELHNCQUFzQixDQUFDO0FBQXhFLGlEQUFXO0FBQUUsdURBQWM7QUFBRSxxREFBMkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBtb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICogVGhpcyBtb2R1bGUgaXMgdXNlZCBmb3IgaGFuZGxpbmcgdXNlciBpbnB1dCwgYnkgZGVmaW5pbmcgYW5kIGJ1aWxkaW5nIGEge0BsaW5rIENvbnRyb2xHcm91cH0gdGhhdFxuICogY29uc2lzdHMgb2ZcbiAqIHtAbGluayBDb250cm9sfSBvYmplY3RzLCBhbmQgbWFwcGluZyB0aGVtIG9udG8gdGhlIERPTS4ge0BsaW5rIENvbnRyb2x9IG9iamVjdHMgY2FuIHRoZW4gYmUgdXNlZFxuICogdG8gcmVhZCBpbmZvcm1hdGlvblxuICogZnJvbSB0aGUgZm9ybSBET00gZWxlbWVudHMuXG4gKlxuICogVGhpcyBtb2R1bGUgaXMgbm90IGluY2x1ZGVkIGluIHRoZSBgYW5ndWxhcjJgIG1vZHVsZTsgeW91IG11c3QgaW1wb3J0IHRoZSBmb3JtcyBtb2R1bGVcbiAqIGV4cGxpY2l0bHkuXG4gKlxuICovXG5leHBvcnQge0Fic3RyYWN0Q29udHJvbCwgQ29udHJvbCwgQ29udHJvbEdyb3VwLCBDb250cm9sQXJyYXl9IGZyb20gJy4vZm9ybXMvbW9kZWwnO1xuXG5leHBvcnQge0Fic3RyYWN0Q29udHJvbERpcmVjdGl2ZX0gZnJvbSAnLi9mb3Jtcy9kaXJlY3RpdmVzL2Fic3RyYWN0X2NvbnRyb2xfZGlyZWN0aXZlJztcbmV4cG9ydCB7Rm9ybX0gZnJvbSAnLi9mb3Jtcy9kaXJlY3RpdmVzL2Zvcm1faW50ZXJmYWNlJztcbmV4cG9ydCB7Q29udHJvbENvbnRhaW5lcn0gZnJvbSAnLi9mb3Jtcy9kaXJlY3RpdmVzL2NvbnRyb2xfY29udGFpbmVyJztcbmV4cG9ydCB7TmdDb250cm9sTmFtZX0gZnJvbSAnLi9mb3Jtcy9kaXJlY3RpdmVzL25nX2NvbnRyb2xfbmFtZSc7XG5leHBvcnQge05nRm9ybUNvbnRyb2x9IGZyb20gJy4vZm9ybXMvZGlyZWN0aXZlcy9uZ19mb3JtX2NvbnRyb2wnO1xuZXhwb3J0IHtOZ01vZGVsfSBmcm9tICcuL2Zvcm1zL2RpcmVjdGl2ZXMvbmdfbW9kZWwnO1xuZXhwb3J0IHtOZ0NvbnRyb2x9IGZyb20gJy4vZm9ybXMvZGlyZWN0aXZlcy9uZ19jb250cm9sJztcbmV4cG9ydCB7TmdDb250cm9sR3JvdXB9IGZyb20gJy4vZm9ybXMvZGlyZWN0aXZlcy9uZ19jb250cm9sX2dyb3VwJztcbmV4cG9ydCB7TmdGb3JtTW9kZWx9IGZyb20gJy4vZm9ybXMvZGlyZWN0aXZlcy9uZ19mb3JtX21vZGVsJztcbmV4cG9ydCB7TmdGb3JtfSBmcm9tICcuL2Zvcm1zL2RpcmVjdGl2ZXMvbmdfZm9ybSc7XG5leHBvcnQge0NvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUn0gZnJvbSAnLi9mb3Jtcy9kaXJlY3RpdmVzL2NvbnRyb2xfdmFsdWVfYWNjZXNzb3InO1xuZXhwb3J0IHtEZWZhdWx0VmFsdWVBY2Nlc3Nvcn0gZnJvbSAnLi9mb3Jtcy9kaXJlY3RpdmVzL2RlZmF1bHRfdmFsdWVfYWNjZXNzb3InO1xuZXhwb3J0IHtOZ0NvbnRyb2xTdGF0dXN9IGZyb20gJy4vZm9ybXMvZGlyZWN0aXZlcy9uZ19jb250cm9sX3N0YXR1cyc7XG5leHBvcnQge0NoZWNrYm94Q29udHJvbFZhbHVlQWNjZXNzb3J9IGZyb20gJy4vZm9ybXMvZGlyZWN0aXZlcy9jaGVja2JveF92YWx1ZV9hY2Nlc3Nvcic7XG5leHBvcnQge1xuICBOZ1NlbGVjdE9wdGlvbixcbiAgU2VsZWN0Q29udHJvbFZhbHVlQWNjZXNzb3Jcbn0gZnJvbSAnLi9mb3Jtcy9kaXJlY3RpdmVzL3NlbGVjdF9jb250cm9sX3ZhbHVlX2FjY2Vzc29yJztcbmV4cG9ydCB7Rk9STV9ESVJFQ1RJVkVTfSBmcm9tICcuL2Zvcm1zL2RpcmVjdGl2ZXMnO1xuZXhwb3J0IHtOR19WQUxJREFUT1JTLCBOR19BU1lOQ19WQUxJREFUT1JTLCBWYWxpZGF0b3JzfSBmcm9tICcuL2Zvcm1zL3ZhbGlkYXRvcnMnO1xuZXhwb3J0IHtcbiAgUmVxdWlyZWRWYWxpZGF0b3IsXG4gIE1pbkxlbmd0aFZhbGlkYXRvcixcbiAgTWF4TGVuZ3RoVmFsaWRhdG9yLFxuICBWYWxpZGF0b3Jcbn0gZnJvbSAnLi9mb3Jtcy9kaXJlY3RpdmVzL3ZhbGlkYXRvcnMnO1xuZXhwb3J0IHtGb3JtQnVpbGRlciwgRk9STV9QUk9WSURFUlMsIEZPUk1fQklORElOR1N9IGZyb20gJy4vZm9ybXMvZm9ybV9idWlsZGVyJzsiXX0=
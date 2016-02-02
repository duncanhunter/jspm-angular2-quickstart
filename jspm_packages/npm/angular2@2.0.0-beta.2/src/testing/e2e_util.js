'use strict';var webdriver = require('selenium-webdriver');
exports.browser = global['browser'];
exports.$ = global['$'];
function clickAll(buttonSelectors) {
    buttonSelectors.forEach(function (selector) { exports.$(selector).click(); });
}
exports.clickAll = clickAll;
function verifyNoBrowserErrors() {
    // TODO(tbosch): Bug in ChromeDriver: Need to execute at least one command
    // so that the browser logs can be read out!
    exports.browser.executeScript('1+1');
    exports.browser.manage().logs().get('browser').then(function (browserLog) {
        var filteredLog = browserLog.filter(function (logEntry) {
            if (logEntry.level.value >= webdriver.logging.Level.INFO.value) {
                console.log('>> ' + logEntry.message);
            }
            return logEntry.level.value > webdriver.logging.Level.WARNING.value;
        });
        expect(filteredLog.length).toEqual(0);
    });
}
exports.verifyNoBrowserErrors = verifyNoBrowserErrors;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZTJlX3V0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvdGVzdGluZy9lMmVfdXRpbC50cyJdLCJuYW1lcyI6WyJjbGlja0FsbCIsInZlcmlmeU5vQnJvd3NlckVycm9ycyJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBWSxTQUFTLFdBQU0sb0JBQW9CLENBQUMsQ0FBQTtBQUVyQyxlQUFPLEdBQXdCLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqRCxTQUFDLEdBQXNCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUU5QyxrQkFBeUIsZUFBZTtJQUN0Q0EsZUFBZUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBU0EsUUFBUUEsSUFBSSxTQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUNBLENBQUNBO0FBQ3ZFQSxDQUFDQTtBQUZlLGdCQUFRLFdBRXZCLENBQUE7QUFFRDtJQUNFQywwRUFBMEVBO0lBQzFFQSw0Q0FBNENBO0lBQzVDQSxlQUFPQSxDQUFDQSxhQUFhQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUM3QkEsZUFBT0EsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBU0EsVUFBVUE7UUFDN0QsSUFBSSxXQUFXLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFTLFFBQVE7WUFDbkQsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQy9ELE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4QyxDQUFDO1lBQ0QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDdEUsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4QyxDQUFDLENBQUNBLENBQUNBO0FBQ0xBLENBQUNBO0FBYmUsNkJBQXFCLHdCQWFwQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgd2ViZHJpdmVyIGZyb20gJ3NlbGVuaXVtLXdlYmRyaXZlcic7XG5cbmV4cG9ydCB2YXIgYnJvd3NlcjogcHJvdHJhY3Rvci5JQnJvd3NlciA9IGdsb2JhbFsnYnJvd3NlciddO1xuZXhwb3J0IHZhciAkOiBjc3NTZWxlY3RvckhlbHBlciA9IGdsb2JhbFsnJCddO1xuXG5leHBvcnQgZnVuY3Rpb24gY2xpY2tBbGwoYnV0dG9uU2VsZWN0b3JzKSB7XG4gIGJ1dHRvblNlbGVjdG9ycy5mb3JFYWNoKGZ1bmN0aW9uKHNlbGVjdG9yKSB7ICQoc2VsZWN0b3IpLmNsaWNrKCk7IH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5Tm9Ccm93c2VyRXJyb3JzKCkge1xuICAvLyBUT0RPKHRib3NjaCk6IEJ1ZyBpbiBDaHJvbWVEcml2ZXI6IE5lZWQgdG8gZXhlY3V0ZSBhdCBsZWFzdCBvbmUgY29tbWFuZFxuICAvLyBzbyB0aGF0IHRoZSBicm93c2VyIGxvZ3MgY2FuIGJlIHJlYWQgb3V0IVxuICBicm93c2VyLmV4ZWN1dGVTY3JpcHQoJzErMScpO1xuICBicm93c2VyLm1hbmFnZSgpLmxvZ3MoKS5nZXQoJ2Jyb3dzZXInKS50aGVuKGZ1bmN0aW9uKGJyb3dzZXJMb2cpIHtcbiAgICB2YXIgZmlsdGVyZWRMb2cgPSBicm93c2VyTG9nLmZpbHRlcihmdW5jdGlvbihsb2dFbnRyeSkge1xuICAgICAgaWYgKGxvZ0VudHJ5LmxldmVsLnZhbHVlID49IHdlYmRyaXZlci5sb2dnaW5nLkxldmVsLklORk8udmFsdWUpIHtcbiAgICAgICAgY29uc29sZS5sb2coJz4+ICcgKyBsb2dFbnRyeS5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsb2dFbnRyeS5sZXZlbC52YWx1ZSA+IHdlYmRyaXZlci5sb2dnaW5nLkxldmVsLldBUk5JTkcudmFsdWU7XG4gICAgfSk7XG4gICAgZXhwZWN0KGZpbHRlcmVkTG9nLmxlbmd0aCkudG9FcXVhbCgwKTtcbiAgfSk7XG59XG4iXX0=
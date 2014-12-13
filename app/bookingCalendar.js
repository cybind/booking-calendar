define('bookingCalendar', ['jquery', 'moment'], function($, moment) {
    
    var BookingCalendar = function (options) {

        var _this = {
            
            /**
             * Default settings for the calendar
             * @type {Object}
             */
            defaults: {

                /**
                 * Element ID of the container to insert calendar
                 * @type {String}
                 */
                containerId: 'calendar',

                /**
                 * Flag to display or hide built-in navigation
                 * @type {Boolean}
                 */
                showNavigation: true,

                /**
                 * Array with reserved date ranges. Example: [ { from: new Date("2015-03-05T00:00:00.000Z"), to: new Date("2015-03-12T00:00:00.000Z") } ]
                 * @type {Array}
                 */
                reserved: [],

                /**
                 * Array with selected date ranges. Example: [ { from: new Date("2015-03-05T00:00:00.000Z"), to: new Date("2015-03-12T00:00:00.000Z") } ]
                 * @type {Array}
                 */
                sel: []

            },

            settings: null,
            container: null,
            currentPageNumber: 0,
            numberOfMonths: 6,  // default number of months do generage
            navigation: {
                id: 'booking-calendar-navigation',
                previousButtonId: 'booking-calendar-navigation-previous',
                nextButtonId: 'booking-calendar-navigation-next'
            },
            monthsContainerId: 'booking-calendar-months',
            
            /**
             * Starting point for calendar generation
             */
            init: function(options) {
                _this.settings = $.extend({}, _this.defaults, options, true);
                _this.container = $('#' + _this.settings.containerId);
                _this.setupMainLayout();
            },

            /**
             * Generate main layout within navigation
             */
            setupMainLayout: function() {
                _this.container.addClass('col-sm-12 no-padding listingcal');

                var layout = '';

                if (_this.settings.showNavigation) {
                    layout +=   '<div class="row" id="' + _this.navigation.id + '">' +
                                    '<div class="col-sm-12">' +
                                        '<div class="btn-group pull-right" role="group" aria-label="">' + 
                                            '<button type="button" class="btn btn-default" id="' + _this.navigation.previousButtonId + '"><span class="glyphicon glyphicon-arrow-left" aria-hidden="true"></span></button>' +
                                            '<button type="button" class="btn btn-default" id="' + _this.navigation.nextButtonId + '"><span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span></button>' +
                                        '</div>' + 
                                    '</div>' + 
                                '</div>';
                }

                layout += 
                    '<div class="row">' +
                        '<div class="cal-months center-block" id="' + _this.monthsContainerId + '">' +
                        '</div>' +
                    '</div>' +
                    '<div class="row listingcal-bottom">' +
                        '<div class="col-sm-3">' +
                            '<span class="legend-key cal-date  calmonth-to-open calmonth-from-open">' +
                                '<a href="javascript:void(0)">23</a>' +
                            '</span> <span class="legend-key-name">Available</span>' +
                        '</div>' +
                        '<div class="col-sm-3">' +
                            '<span class="legend-key cal-date calmonth-to-res calmonth-from-res">' +
                                '<a href="javascript:void(0)">21</a>' +
                            '</span> <span class="legend-key-name">Unavailable</span>' +
                        '</div>' +
                        '<div class="col-sm-3">' +
                            '<span class="legend-key cal-date calmonth-today"><a href="javascript:void(0)">22</a></span> <span class="legend-key-name">Today</span>' +
                        '</div>' +
                        '<div class="col-sm-3"><span class="legend-key cal-date calmonth-to-sel calmonth-from-sel"><a href="javascript:void(0)">23</a></span> <span class="legend-key-name">Selected dates</span></div>' +
                    '</div>';

                _this.container.append(layout);

                _this.buildCalendar(_this.currentPageNumber);
                _this.fixLayout();
                
                // attach event handlers
                if (_this.settings.showNavigation) {
                    _this.container.find('#' + _this.navigation.previousButtonId).click(function() {
                        _this.previous();
                    });
                    _this.container.find('#' + _this.navigation.nextButtonId).click(function() {
                        _this.next();
                    });
                }

                // setup resize handler to re-build calendar with appropriate number of months
                $(window).on("resize", function() { _this.fixLayout(); });

            },

            /**
             * Re-generate calenad months count based on containter width
             */
            fixLayout: function() {
                var monthsContainer     = _this.container.find('#' + _this.monthsContainerId),
                    containerWidth      = _this.container.width(),
                    monthOuterWidth     = $(monthsContainer.find('.calmonth')[0]).outerWidth(true);

                if (containerWidth > monthOuterWidth * 3) {
                    if (_this.numberOfMonths !== 6) {
                        _this.numberOfMonths = 6;
                        _this.buildCalendar(_this.currentPageNumber);
                        monthsContainer.width(monthOuterWidth * 3);
                    }
                }
                if (containerWidth > monthOuterWidth * 2 && containerWidth < monthOuterWidth * 3) {
                    if (_this.numberOfMonths !== 4) {
                        _this.numberOfMonths = 4;
                        _this.buildCalendar(_this.currentPageNumber);
                        monthsContainer.width(monthOuterWidth * 2);
                    }
                }
                if (containerWidth > monthOuterWidth * 1 && containerWidth < monthOuterWidth * 2) {
                    if (_this.numberOfMonths !== 2) {
                        _this.numberOfMonths = 2;
                        _this.buildCalendar(_this.currentPageNumber);
                        monthsContainer.width(monthOuterWidth);
                    }
                }
            },

            /**
             * Append calendar container with months
             * @param  {Number} pageNumber calendar page number to generate; starts from 0
             */
            buildCalendar: function(pageNumber) {

                var monthsContainer     = _this.container.find('#' + _this.monthsContainerId),
                    firstMonthNumber    = pageNumber * _this.numberOfMonths;

                monthsContainer.html('');

                for (var i = 0; i < _this.numberOfMonths; i++) {
                    monthsContainer.append(_this.buildMonth(firstMonthNumber + i));
                }

            },

            /**
             * Build month based on it's number
             * @param  {Number} monthNumber month number yo build; 0 is current month number
             */
            buildMonth: function(monthNumber) {
                var currentMonthNumber  = moment().month(),
                    currentMonth        = moment().month(currentMonthNumber + monthNumber).format('MM'),
                    currentYear         = moment().month(currentMonthNumber + monthNumber).format('YYYY'),
                    monthFirstDate      = moment(currentYear + '-' + currentMonth + '-01'),
                    daysInMonth         = monthFirstDate.daysInMonth(),
                    monthFirstDay       = monthFirstDate.day(),
                    monthHead           = monthFirstDate.format('MMMM YYYY'),
                    cellNumber          = -monthFirstDay;

                monthFirstDate.add(-monthFirstDay, 'days');

                var layout = '<div class="calmonth">' +
                                '<h3>' + monthHead + '</h3>' +
                                '<table>' +
                                    '<tbody>' +
                                        '<tr>' +
                                            '<th class="first">SU</th>' +
                                            '<th>MO</th>' +
                                            '<th>TU</th>' +
                                            '<th>WE</th>' +
                                            '<th>TH</th>' +
                                            '<th>FR</th>' +
                                            '<th>SA</th>' +
                                        '</tr>';

                for (var i = 0; i < 6; i++) {
                    
                    layout += '<tr>';

                    for (var j = 0; j < 7; j++) {
                        
                        if (cellNumber >=  0 && cellNumber < daysInMonth) {
                            var classes = 'cal-date ';

                            var dt = monthFirstDate.toDate();

                            if (_this.beforeToday(dt)) {
                                classes += 'calmonth-from-res calmonth-to-res ';
                            } else if (_this.settings.reserved) {

                                var resPos = _this.positionInRangeArray(dt, _this.settings.reserved);
                                if (resPos === 'first') {
                                    classes += 'calmonth-from-res ';
                                } else if (resPos === 'last') {
                                    classes += 'calmonth-to-res ';
                                } else if (resPos === 'middle') {
                                    classes += 'calmonth-from-res calmonth-to-res ';
                                }

                            }

                            if (_this.settings.sel) {

                                var selPos = _this.positionInRangeArray(dt, _this.settings.sel);
                                if (selPos === 'first') {
                                    classes += 'calmonth-from-sel ';
                                } else if (selPos === 'last') {
                                    classes += 'calmonth-to-sel ';
                                } else if (selPos === 'middle') {
                                    classes += 'calmonth-from-sel calmonth-to-sel ';
                                }
                            }

                            if (_this.isToday(dt)) { classes += 'calmonth-today '; }

                            layout += '<td class="' + classes + '"><a href="javascript:void(0)">' + monthFirstDate.date() + '</a></td>';
                        } else {
                            layout += '<td class="cal-date"><a href="javascript:void(0)"></a></td>';
                        }

                        cellNumber++;
                        monthFirstDate.add(1, 'days');
                    }

                    layout += '</tr>';

                }

                layout +=           '</tbody>' +
                                '</table>' +
                            '</div>';

                return layout;
            },

            /**
             * Get position of the date in the array of the date ranges
             * @param  {Date} dt    date object to check in date ranges array
             * @param  {Array} arr  date range array; example: [ { from: new Date("2015-03-05T00:00:00.000Z"), to: new Date("2015-03-12T00:00:00.000Z") } ]
             * @return {String}     first|middle|last possible position of the date in the range
             */
            positionInRangeArray: function(dt, arr) {
                
                if (dt && arr && arr.length > 0) {
                    for (var i = 0; i < arr.length; i++) {

                        var from    = moment(moment(arr[i].from).format('YYYY-MM-DD')).toDate(),
                            to      = moment(moment(arr[i].to).format('YYYY-MM-DD')).toDate();

                        if (dt.getTime() === from.getTime())  { return 'first'; }
                        if (dt > from && dt < to) { return 'middle'; }
                        if (dt.getTime() === to.getTime()) { return 'last'; }
                    
                    }
                }

            },

            /**
             * Check if the date is earlier then today
             * @param  {Date} dt  date to check
             * @return {Boolean}    true if date is before today, else false
             */
            beforeToday: function(dt) {
                var dtTime      = moment(moment(dt).format('YYYY-MM-DD')).toDate().getTime(),
                    todayTime   = moment(moment().format('YYYY-MM-DD')).toDate().getTime();

                return dtTime < todayTime;
            },

            /**
             * Check if date is today
             * @param  {Date}  dt   date to check
             * @return {Boolean}    true if the date is today, elase false
             */
            isToday: function(dt) {
                return moment(dt).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD');
            },

            /**
             * Highlight date range on the calendar
             * @param {Array} arr array of the date ranges to highlight
             */
            setSelected: function(arr) {
                _this.settings.sel = arr;
                _this.buildCalendar(_this.currentPageNumber);
            },

            /**
             * Navigate to previous calendar page
             */
            previous: function() {
                _this.currentPageNumber--;
                _this.buildCalendar(_this.currentPageNumber);
            },

            /**
             * Navigate to next calendar page
             */
            next: function() {
                _this.currentPageNumber++;
                _this.buildCalendar(_this.currentPageNumber);
            }

        };
        
        _this.init(options);    // trigger calendar rendering

        return {
            previous: _this.previous,
            next: _this.next,
            setSelected: _this.setSelected,
            fixLayout: _this.fixLayout
        };
    };

    return BookingCalendar;
});
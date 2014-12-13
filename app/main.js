define(["bookingCalendar"], function (BookingCalendar) {

	new BookingCalendar({
		containerId: 'booking-calendar',
		reserved: [
			{
				from: new Date("2014-12-25T00:00:00.000Z"),
				to: new Date("2014-12-31T00:00:00.000Z")
			},
			{
				from: new Date("2015-01-04T00:00:00.000Z"),
				to: new Date("2015-01-08T00:00:00.000Z")
			},
			{
				from: new Date("2015-01-09T00:00:00.000Z"),
				to: new Date("2015-01-12T00:00:00.000Z")
			},
			{
				from: new Date("2015-01-23T00:00:00.000Z"),
				to: new Date("2015-01-26T00:00:00.000Z")
			},
			{
				from: new Date("2015-02-20T00:00:00.000Z"),
				to: new Date("2015-02-23T00:00:00.000Z")
			}
		],
		sel: [
			{
				from: new Date("2015-01-12T00:00:00.000Z"),
				to: new Date("2015-01-21T00:00:00.000Z")
			},
			{
				from: new Date("2015-03-05T00:00:00.000Z"),
				to: new Date("2015-03-12T00:00:00.000Z")
			}
		]
	});

});

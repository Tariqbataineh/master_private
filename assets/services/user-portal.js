
"use strict";

// User portal additions share the existing authorization and booking boundary.
// English display fields are optional projections; original records are unchanged.

window.WusoolServiceModules.push(function registerUserPortal(ctx) {
  const user = () => ctx.requireAccount(["User"]);

  // --------------------------------------------------
  // Booking Availability
  // --------------------------------------------------

  ctx.api.getBookingAvailability = async function (
    branchId,
    date,
    serviceId,
    options = {},
  ) {
    if (ctx.cfg.mode === "api") {
      return ctx.request(
        "/branches/" +
          encodeURIComponent(branchId) +
          "/availability?date=" +
          encodeURIComponent(date) +
          "&serviceId=" +
          encodeURIComponent(serviceId || "") +
          "&requiresAssistant=" +
          Boolean(options.requiresAssistant) +
          "&excludeBookingId=" +
          encodeURIComponent(options.excludeBookingId || ""),
      );
    }

    const account = user();
    const data = ctx.db();
    const excludeBookingId = options.excludeBookingId || null;

    if (
      excludeBookingId &&
      !data.bookings.some(
        (booking) =>
          booking.id === excludeBookingId &&
          booking.userId === account.id &&
          !booking.isDeleted &&
          booking.branchId === branchId,
      )
    ) {
      ctx.fail(
        "FORBIDDEN",
        "This booking is unavailable for your account.",
      );
    }

    const branch = data.branches.find(
      (item) =>
        item.id === branchId &&
        ctx.visibleBranch(data, item),
    );

    if (!branch) {
      ctx.fail(
        "INVALID_BRANCH",
        "Select a published branch.",
      );
    }

    // External booking branch.
    if (branch.bookingEnabled === false) {
      return {
        slots: [],
        date,
        branchId,
        externalBooking: true,
        officialUrl:
          branch.officialUrl || branch.sourceUrl,
      };
    }

    const selectedService = ctx.ticketServiceSelection(
      data,
      branch,
      { serviceId },
    );

    // Validate the selected date.
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date || "") ||
      !Number.isFinite(
        Date.parse(date + "T00:00:00Z"),
      ) ||
      new Date(date + "T00:00:00Z")
        .toISOString()
        .slice(0, 10) !== date
    ) {
      ctx.fail(
        "INVALID_DATE",
        "Choose a valid date.",
      );
    }

    // Verify configured branch working hours.
    if (!ctx.hours.effective(data, branch)) {
      return {
        branchId,
        date,
        slots: [],
        known: false,
        reason: "HOURS_UNAVAILABLE",
        timeZone: "Asia/Amman",
      };
    }

    // Preserve the existing service lookup and
    // booking-slot validation flow.
    const selection =
      await ctx.getTicketServices(branchId);

    const durationMinutes =
      selectedService.serviceSnapshot.durationMinutes;

    const slots = [];
    const excluded = {};

    // Check every 15-minute interval.
    for (
      let minute = 0;
      minute < 1440;
      minute += 15
    ) {
      const time =
        String(
          Math.floor(minute / 60),
        ).padStart(2, "0") +
        ":" +
        String(
          minute % 60,
        ).padStart(2, "0");

      try {
        ctx.checkBookingSlot(
          data,
          branch,
          {
            userId: account.id,
            date,
            time,
            serviceId,
            durationMinutes,
            requiresAssistant:
              Boolean(options.requiresAssistant),
          },
          excludeBookingId,
        );

        slots.push(time);
      } catch (error) {
        if (
          ![
            "INVALID_DATE",
            "OUTSIDE_HOURS",
            "HOLIDAY_CLOSED",
            "BOOKING_OVERLAP",
            "ASSISTANCE_CAPACITY",
            "SERVICE_CAPACITY",
            "BRANCH_CLOSED",
          ].includes(error.code)
        ) {
          throw error;
        }

        excluded[time] = error.code;
      }
    }

    return {
      branchId,
      date,
      durationMinutes,
      timeZone: "Asia/Amman",
      slots,
      excluded,
    };
  };

  // --------------------------------------------------
  // Visit Tracking
  // --------------------------------------------------

  ctx.api.getVisitTracking = async function (bookingId) {
    if (ctx.cfg.mode === "api") {
      return ctx.request(
        "/bookings/" +
          encodeURIComponent(bookingId) +
          "/tracking",
      );
    }

    const account = user();
    const data = ctx.db();

    const booking = data.bookings.find(
      (item) =>
        item.id === bookingId &&
        !item.isDeleted,
    );

    // A user can only track their own bookings.
    if (
      !booking ||
      booking.userId !== account.id
    ) {
      ctx.fail(
        "FORBIDDEN",
        "This booking is unavailable for your account.",
      );
    }

    const branch = data.branches.find(
      (item) => item.id === booking.branchId,
    );

    const organization = data.organizations.find(
      (item) =>
        item.id === booking.organizationId,
    );

    const timing =
      ctx.api.journey.timing(booking);

    return {
      booking: ctx.bookingDto(
        booking,
        data,
        "org",
      ),

      branch: branch
        ? {
            // Original data used by the tracking system.
            id: branch.id,
            name: branch.name,
            latitude: branch.latitude,
            longitude: branch.longitude,
            address: branch.address,
            city: branch.city,

            photos: ctx.safe(
              branch.photos || [],
            ),

            organizationName:
              organization?.name ||
              booking.placeName ||
              "",

            // Optional English display fields.
            // These are read-only projections.
            nameEn:
              branch.nameEn ||
              branch.branchNameEn ||
              branch.translations?.en?.name ||
              branch.translations?.en?.branchName ||
              "",

            branchNameEn:
              branch.branchNameEn ||
              branch.nameEn ||
              branch.translations?.en?.branchName ||
              branch.translations?.en?.name ||
              "",

            addressEn:
              branch.addressEn ||
              branch.translations?.en?.address ||
              "",

            cityEn:
              branch.cityEn ||
              branch.translations?.en?.city ||
              "",

            organizationNameEn:
              organization?.nameEn ||
              organization?.translations?.en?.name ||
              "",
          }
        : {
            ...booking.locationSnapshot,
            id: booking.branchId,
            name: booking.branchName,
          },

      // Queue information remains unchanged.
      queue: ctx.api.visits.queue(bookingId),

      timing,

      // Departure permission follows the original timing rules.
      canDepart:
        timing.canDepart &&
        !booking.scheduleBlocked,

      // Arrival permission follows the original state rules.
      canArrive:
        booking.status === "confirmed" &&
        booking.journeyState === "on-the-way" &&
        timing.sameDay &&
        Date.now() <= timing.slot + 1800000 &&
        !booking.scheduleBlocked,

      // English tracking notifications.
      notice: booking.scheduleBlocked
        ? "The branch's working hours have changed. Please contact the organization to reschedule your appointment."
        : booking.appointmentProposal
          ? "A new appointment time has been proposed and is awaiting your response."
          : "",
    };
  };
});

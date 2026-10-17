
import { esc, icon, href } from "./components.js";
import { errorText } from "./store.js";

const bounds = [
  [29.18, 34.95],
  [33.38, 39.31],
];

export function point(record) {
  const latitude = record?.latitude;
  const longitude = record?.longitude;

  if (
    latitude == null ||
    longitude == null ||
    String(latitude).trim() === "" ||
    String(longitude).trim() === ""
  ) {
    return null;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  return Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
    ? [lat, lng]
    : null;
}

export function mapMarkup(id = "live-map") {
  return `
    <div class="live-map-wrap">
      <div
        class="live-map"
        id="${id}"
        aria-label="Interactive branch map"
        role="region"
      ></div>

      <p
        class="map-feedback"
        role="status"
        data-map-feedback
      ></p>

      <p
        class="map-feedback"
        role="status"
        data-map-network
        hidden
      ></p>
    </div>
  `;
}

export function mountMap(
  root,
  {
    records = [],
    destination = null,
    tracking = false,
    onPosition,
  } = {},
) {
  const node = root.querySelector(".live-map");
  const feedback = root.querySelector("[data-map-feedback]");

  if (!window.L || !node) {
    if (feedback) {
      feedback.textContent = "Unable to load the map component.";
    }

    return {
      destroy() {},
      locate() {},
    };
  }

  let destroyed = false;
  let watch = null;
  let origin = null;
  let route = null;
  let locationMarker = null;
  let lastRouted = 0;
  let lastOrigin = null;
  let routeVersion = 0;
  let routeAbort = null;
  let accuracyLayer = null;

  const L = window.L;

  const map = L.map(node, {
    scrollWheelZoom: false,
    maxBounds: bounds,
    maxBoundsViscosity: 0.5,
    minZoom: 6,
  }).setView([31.95, 35.91], 8);

  const tiles = L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
    },
  ).addTo(map);

  let tileErrors = 0;

  tiles.on("tileerror", () => {
    if (++tileErrors === 3 && !destroyed) {
      const notice = root.querySelector("[data-map-network]");

      if (notice) {
        notice.hidden = false;
        notice.textContent =
          "Some map tiles could not be loaded. Check your internet connection; saved branch locations remain available.";
      }
    }
  });

  const points = [];

  const markerIcon = (label, color) =>
    L.divIcon({
      className: "wusool-map-marker",
      html: `<span style="background:${color}">${esc(label)}</span>`,
      iconSize: [34, 42],
      iconAnchor: [17, 42],
    });

  // Display published branch markers.
  for (const record of records) {
    const coordinates = point(record);

    if (!coordinates) continue;

    points.push(coordinates);

    L.marker(coordinates, {
      icon: markerIcon("•", "#007e64"),
    })
      .addTo(map)
      .bindPopup(
        `
          <strong>
            ${esc(record.organizationName || record.name)}
          </strong>

          <p>
            ${esc(record.branchName || "")}
          </p>

          <p>
            ${esc(record.address || "")}
          </p>

          <a href="${href("organization-services", {
            id: record.organizationId,
            branch: record.id,
          })}">
            Explore Services
          </a>
        `,
      );
  }

  // Display destination marker.
  const target = point(destination);

  if (target) {
    L.marker(target, {
      icon: markerIcon("A", "#ff6d34"),
    })
      .addTo(map)
      .bindPopup(
        esc(
          destination.branchName ||
            destination.name ||
            "Destination",
        ),
      );

    points.push(target);
  }

  if (points.length) {
    map.fitBounds(L.latLngBounds(points), {
      padding: [28, 28],
      maxZoom: 15,
    });
  } else {
    feedback.textContent =
      "No branches have valid coordinates to display. You can open the branch address in Google Maps.";
  }

  // Calculate the straight-line distance between coordinates.
  function distance(a, b) {
    const rad = Math.PI / 180;

    return (
      6371000 *
      2 *
      Math.asin(
        Math.min(
          1,
          Math.sqrt(
            Math.sin(((b[0] - a[0]) * rad) / 2) ** 2 +
              Math.cos(a[0] * rad) *
                Math.cos(b[0] * rad) *
                Math.sin(((b[1] - a[1]) * rad) / 2) ** 2,
          ),
        ),
      )
    );
  }

  // Calculate driving route using the existing OSRM service.
  async function loadRoute(force = false) {
    if (!origin || !target || destroyed) return;

    const now = Date.now();

    if (!force && now - lastRouted < 30000) {
      return;
    }

    if (
      !force &&
      lastOrigin &&
      distance(origin, lastOrigin) < 30 &&
      now - lastRouted < 90000
    ) {
      return;
    }

    lastRouted = now;
    lastOrigin = [...origin];

    const revision = ++routeVersion;

    routeAbort?.abort();
    routeAbort = new AbortController();

    const timer = setTimeout(
      () => routeAbort?.abort(),
      12000,
    );

    feedback.textContent = "Calculating your driving route...";

    try {
      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${origin[1]},${origin[0]};` +
        `${target[1]},${target[0]}` +
        `?overview=full&geometries=geojson&steps=false`;

      const response = await fetch(url, {
        signal: routeAbort.signal,
        credentials: "omit",
        referrerPolicy: "no-referrer",
      });

      if (!response.ok) {
        throw new Error("route");
      }

      const data = await response.json();
      const result = data.routes?.[0];

      if (
        !result ||
        data.code !== "Ok" ||
        !Number.isFinite(result.distance) ||
        !Number.isFinite(result.duration) ||
        !Array.isArray(result.geometry?.coordinates)
      ) {
        throw new Error("route");
      }

      if (destroyed || revision !== routeVersion) {
        return;
      }

      route?.remove();

      route = L.geoJSON(result.geometry, {
        style: {
          color: "#238dd4",
          weight: 5,
          opacity: 0.9,
        },
      }).addTo(map);

      const minutes = Math.ceil(result.duration / 60);

      feedback.textContent =
        `${(result.distance / 1000).toFixed(1)} km by road` +
        ` • Approximately ${minutes} minutes by car` +
        ` — traffic not included`;

      if (force) {
        map.fitBounds(route.getBounds(), {
          padding: [30, 30],
        });
      }

      onPosition?.({
        latitude: origin[0],
        longitude: origin[1],
        roadDistance: result.distance,
        estimatedSeconds: result.duration,
      });
    } catch {
      if (!destroyed && revision === routeVersion) {
        route?.remove();
        route = null;

        feedback.textContent =
          `Unable to calculate a driving route. ` +
          `Straight-line distance: ` +
          `${(distance(origin, target) / 1000).toFixed(1)} km. ` +
          `A reliable arrival time is unavailable.`;

        onPosition?.({
          latitude: origin[0],
          longitude: origin[1],
          roadDistance: null,
          estimatedSeconds: null,
        });
      }
    } finally {
      clearTimeout(timer);
    }
  }

  // Locate the user's device and update the map.
  function locate() {
    if (destroyed) return;

    if (!navigator.geolocation) {
      feedback.textContent =
        "Your browser does not support location services.";
      return;
    }

    if (watch !== null) {
      map.panTo(origin || [31.95, 35.91]);
      loadRoute(true);
      return;
    }

    feedback.textContent =
      "Waiting for permission to access your location...";

    watch = navigator.geolocation.watchPosition(
      (position) => {
        if (destroyed) return;

        const next = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        const supported =
          next[0] >= bounds[0][0] &&
          next[0] <= bounds[1][0] &&
          next[1] >= bounds[0][1] &&
          next[1] <= bounds[1][1];

        if (!supported) {
          feedback.textContent =
            "Your device is outside the supported Jordan map area.";

          onPosition?.({
            outsideBounds: true,
          });

          return;
        }

        origin = next;

        accuracyLayer?.remove();

        accuracyLayer = L.circle(origin, {
          radius: position.coords.accuracy,
          color: "#3195dc",
          weight: 1,
          fillOpacity: 0.07,
        }).addTo(map);

        if (!locationMarker) {
          locationMarker = L.marker(origin, {
            icon: markerIcon("You", "#168a73"),
          }).addTo(map);
        } else {
          locationMarker.setLatLng(origin);
        }

        if (target && tracking) {
          loadRoute(lastRouted === 0);
        } else {
          map.setView(origin, 14);

          feedback.textContent =
            `Device location updated` +
            ` • Approximate accuracy: ` +
            `${Math.round(position.coords.accuracy)} meters`;

          onPosition?.({
            latitude: origin[0],
            longitude: origin[1],
            accuracy: position.coords.accuracy,
          });
        }
      },
      (error) => {
        if (destroyed) return;

        feedback.textContent =
          error.code === 1
            ? "Location access was denied. You can enable it in your browser settings."
            : "Unable to determine your location. Check your GPS and internet connection.";

        if (watch !== null) {
          navigator.geolocation.clearWatch(watch);
          watch = null;
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 15000,
        timeout: 12000,
      },
    );
  }

  // Resize the map when its container changes size.
  const resize = new ResizeObserver(() => {
    if (!destroyed) {
      map.invalidateSize();
    }
  });

  resize.observe(node);

  requestAnimationFrame(() => map.invalidateSize());

  // Public map controls.
  return {
    map,
    locate,

    destroy() {
      if (destroyed) return;

      destroyed = true;
      routeVersion++;

      routeAbort?.abort();

      if (watch !== null) {
        navigator.geolocation.clearWatch(watch);
      }

      resize.disconnect();
      map.remove();
    },
  };
}

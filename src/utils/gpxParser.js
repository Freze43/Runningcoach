// GPX & TCX Parser and Mock Track Generator

// Haversine formula to calculate distance in km between two lat/lon coordinates
export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Convert pace in min/km from speed in km/h
export function speedToPace(speedKmh) {
  if (!speedKmh || speedKmh <= 0) return "--:--";
  const paceDec = 60 / speedKmh;
  const mins = Math.floor(paceDec);
  const secs = Math.floor((paceDec - mins) * 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function parseGPX(gpxText) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxText, "text/xml");
    const trkpts = xmlDoc.getElementsByTagName("trkpt");
    
    if (trkpts.length === 0) {
      throw new Error("No trackpoints found in GPX");
    }

    let name = "Custom GPX Run";
    const trkName = xmlDoc.getElementsByTagName("name")[0];
    if (trkName) name = trkName.textContent;

    const points = [];
    let cumulativeDistance = 0;
    
    for (let i = 0; i < trkpts.length; i++) {
      const pt = trkpts[i];
      const lat = parseFloat(pt.getAttribute("lat"));
      const lon = parseFloat(pt.getAttribute("lon"));
      
      const eleEl = pt.getElementsByTagName("ele")[0];
      const ele = eleEl ? parseFloat(eleEl.textContent) : 0;
      
      const timeEl = pt.getElementsByTagName("time")[0];
      const time = timeEl ? timeEl.textContent : null;
      
      // Heart rate parsing (supports standard extensions)
      let hr = null;
      const hrEl = pt.getElementsByTagName("hr")[0] || pt.getElementsByTagName("gpxtpx:hr")[0];
      if (hrEl) hr = parseInt(hrEl.textContent, 10);

      let stepDist = 0;
      if (i > 0) {
        const prevPt = points[i - 1];
        stepDist = getDistance(prevPt.lat, prevPt.lon, lat, lon);
        cumulativeDistance += stepDist;
      }

      points.push({
        lat,
        lon,
        ele,
        time: time ? new Date(time) : null,
        hr,
        dist: cumulativeDistance,
        stepDist
      });
    }

    return compileStats(name, points, cumulativeDistance);
  } catch (err) {
    console.error("GPX parsing error:", err);
    return null;
  }
}

export function parseTCX(tcxText) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(tcxText, "text/xml");
    const trackpoints = xmlDoc.getElementsByTagName("Trackpoint");

    if (trackpoints.length === 0) {
      throw new Error("No trackpoints found in TCX");
    }

    let name = "Custom TCX Run";
    const points = [];
    let cumulativeDistance = 0;

    for (let i = 0; i < trackpoints.length; i++) {
      const pt = trackpoints[i];
      
      const latEl = pt.getElementsByTagName("LatitudeDegrees")[0];
      const lonEl = pt.getElementsByTagName("LongitudeDegrees")[0];
      if (!latEl || !lonEl) continue; // Skip if no position
      
      const lat = parseFloat(latEl.textContent);
      const lon = parseFloat(lonEl.textContent);

      const eleEl = pt.getElementsByTagName("AltitudeMeters")[0];
      const ele = eleEl ? parseFloat(eleEl.textContent) : 0;

      const timeEl = pt.getElementsByTagName("Time")[0];
      const time = timeEl ? timeEl.textContent : null;

      const hrEl = pt.getElementsByTagName("HeartRateBpm")[0]?.getElementsByTagName("Value")[0];
      const hr = hrEl ? parseInt(hrEl.textContent, 10) : null;

      let stepDist = 0;
      if (i > 0 && points.length > 0) {
        const prevPt = points[points.length - 1];
        stepDist = getDistance(prevPt.lat, prevPt.lon, lat, lon);
        cumulativeDistance += stepDist;
      }

      points.push({
        lat,
        lon,
        ele,
        time: time ? new Date(time) : null,
        hr,
        dist: cumulativeDistance,
        stepDist
      });
    }

    return compileStats(name, points, cumulativeDistance);
  } catch (err) {
    console.error("TCX parsing error:", err);
    return null;
  }
}

// Compile stats from points array
function compileStats(name, points, totalDistance) {
  if (points.length < 2) return null;

  const firstPt = points[0];
  const lastPt = points[points.length - 1];
  
  let durationMs = 0;
  if (firstPt.time && lastPt.time) {
    durationMs = lastPt.time - firstPt.time;
  } else {
    // If no timestamps, assume 5 mins per km
    durationMs = totalDistance * 5 * 60 * 1000;
  }
  
  const durationMin = durationMs / (60 * 1000);
  const totalSpeedKmh = totalDistance / (durationMin / 60);

  // Fill speeds and paces
  let heartRateSum = 0;
  let heartRateCount = 0;
  let maxHr = 0;
  let totalElevationGain = 0;

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    if (pt.hr) {
      heartRateSum += pt.hr;
      heartRateCount++;
      if (pt.hr > maxHr) maxHr = pt.hr;
    }
    if (i > 0) {
      const prevPt = points[i - 1];
      const timeDiffH = pt.time && prevPt.time ? (pt.time - prevPt.time) / (1000 * 3600) : (pt.stepDist / totalSpeedKmh);
      pt.speed = timeDiffH > 0 ? pt.stepDist / timeDiffH : totalSpeedKmh;
      pt.pace = speedToPace(pt.speed);
      
      const eleDiff = pt.ele - prevPt.ele;
      if (eleDiff > 0) {
        totalElevationGain += eleDiff;
      }
    } else {
      pt.speed = totalSpeedKmh;
      pt.pace = speedToPace(totalSpeedKmh);
    }
  }

  const avgHr = heartRateCount > 0 ? Math.round(heartRateSum / heartRateCount) : 152;
  if (maxHr === 0) maxHr = avgHr + 25;

  // Calorie estimation: Weight (70kg) * METS (9.8 for 10kmh run) * hours
  const hours = durationMin / 60;
  const METS = totalSpeedKmh > 12 ? 11.5 : (totalSpeedKmh > 9 ? 9.8 : 8);
  const calories = Math.round(70 * METS * hours);

  // VO2Max estimation based on running index (speed vs HR relationship)
  // Higher speed at lower heart rate = higher VO2Max.
  // Formula: VO2Max = 15 * (HRmax / HRavg) * (Speed_kmh / 10) or similar
  const maxHrEstimate = 220 - 28; // Standard 28 years old estimate
  const hrRatio = avgHr > 0 ? (maxHrEstimate / avgHr) : 1.3;
  let calculatedVo2Max = Math.round(14.5 * hrRatio * (totalSpeedKmh / 10) * 3);
  // Clamp VO2Max to realistic range based on performance
  if (calculatedVo2Max < 32) calculatedVo2Max = 32 + Math.floor(Math.random() * 4);
  if (calculatedVo2Max > 75) calculatedVo2Max = 71 + Math.floor(Math.random() * 4);

  return {
    id: 'activity_' + Date.now(),
    name,
    date: firstPt.time ? firstPt.time.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    distance: parseFloat(totalDistance.toFixed(2)),
    duration: Math.round(durationMin * 60), // In seconds
    avgPace: speedToPace(totalSpeedKmh),
    avgHr,
    maxHr,
    calories,
    elevationGain: Math.round(totalElevationGain),
    vo2Max: calculatedVo2Max,
    points
  };
}

// Generate beautiful preloaded tracks based on location and program
export function generateMockTrack(programName, level, distanceKm = 5) {
  // Let's create a beautiful coordinate trail
  // Kendal, Indonesia centers around latitude -6.9189, longitude 110.2031
  const centerLat = -6.9189 + (Math.random() - 0.5) * 0.01;
  const centerLon = 110.2031 + (Math.random() - 0.5) * 0.01;
  
  const points = [];
  const totalPoints = 120;
  const durationSecs = distanceKm * (level === 'pro' ? 240 : (level === 'intermediate' ? 300 : 380)); // Pro is 4min/km, Inter is 5min/km, Beg is 6.3min/km
  const startTime = new Date();
  
  let currentLat = centerLat;
  let currentLon = centerLon;
  let cumulativeDistance = 0;
  let currentElevation = 15; // meters above sea level

  for (let i = 0; i < totalPoints; i++) {
    const fraction = i / (totalPoints - 1);
    
    // Create a beautiful oval or figure-8 track loop
    const angle = fraction * Math.PI * 2;
    const offsetLat = Math.sin(angle) * 0.01 * (distanceKm / 5);
    // Add some noise to make it realistic
    const noiseLat = Math.sin(angle * 12) * 0.0003;
    const offsetLon = Math.sin(angle * 2) * 0.007 * (distanceKm / 5);
    const noiseLon = Math.cos(angle * 15) * 0.0002;

    const lat = centerLat + offsetLat + noiseLat;
    const lon = centerLon + offsetLon + noiseLon;

    const pointTime = new Date(startTime.getTime() + (fraction * durationSecs * 1000));
    
    // Elevation goes up and down
    const ele = currentElevation + Math.sin(fraction * Math.PI * 3) * 8 + Math.sin(fraction * Math.PI * 15) * 1.5;
    
    // Heart rate ramps up, then fluctuates
    let hr = 80;
    if (fraction > 0.05) {
      const targetHr = level === 'pro' ? 158 : (level === 'intermediate' ? 150 : 142);
      hr = targetHr + Math.sin(fraction * Math.PI * 20) * 6 + (Math.random() - 0.5) * 3;
    } else {
      hr = 90 + (fraction / 0.05) * 50; // warm up HR
    }

    let stepDist = 0;
    if (i > 0) {
      const prev = points[points.length - 1];
      stepDist = getDistance(prev.lat, prev.lon, lat, lon);
      cumulativeDistance += stepDist;
    }

    points.push({
      lat,
      lon,
      ele: Math.round(ele * 10) / 10,
      time: pointTime,
      hr: Math.round(hr),
      dist: cumulativeDistance,
      stepDist
    });
  }

  // Adjust coordinates slightly so cumulativeDistance exactly matches target
  const scaling = distanceKm / cumulativeDistance;
  let reCumulative = 0;
  for (let i = 1; i < points.length; i++) {
    points[i].stepDist *= scaling;
    reCumulative += points[i].stepDist;
    points[i].dist = reCumulative;
  }

  // Recompile stats
  const trackName = `${programName || 'Training Run'} (${level.toUpperCase()})`;
  return compileStats(trackName, points, reCumulative);
}

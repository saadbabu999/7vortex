import { useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { UAParser } from "ua-parser-js";

export default function VisitorTracker() {
  useEffect(() => {
    const trackVisitor = async () => {
      // Prevent double tracking in dev
      const lastTracked = sessionStorage.getItem("vortex_tracked");
      if (lastTracked) return;

      try {
        let geoData: any = {};
        
        // Try ipapi.co first
        try {
          const geoResponse = await fetch("https://ipapi.co/json/");
          if (geoResponse.ok) {
            geoData = await geoResponse.json();
          }
        } catch (e) {
          console.warn("ipapi.co failed, trying fallback...");
          // Fallback to ipify for at least the IP
          try {
            const ipResponse = await fetch("https://api.ipify.org?format=json");
            if (ipResponse.ok) {
              const ipData = await ipResponse.json();
              geoData.ip = ipData.ip;
            }
          } catch (e2) {
            console.error("All IP fetchers failed");
          }
        }

        // Parse User Agent
        const parser = new UAParser();
        const result = parser.getResult();

        // Ensure all fields are plain objects and remove undefined/functions for Firestore
        const sanitize = (obj: any) => {
          if (!obj || typeof obj !== 'object') return obj;
          const sanitized: any = {};
          for (const key in obj) {
            const val = obj[key];
            // Firestore doesn't support undefined or functions
            if (val !== undefined && typeof val !== 'function') {
              sanitized[key] = val === null ? null : val;
            }
          }
          return sanitized;
        };

        const visitorData = {
          ip: geoData.ip || "Unknown",
          location: {
            city: geoData.city || "Unknown",
            region: geoData.region || "Unknown",
            country: geoData.country_name || "Unknown",
            postal: geoData.postal || "Unknown",
            latitude: geoData.latitude || null,
            longitude: geoData.longitude || null,
            org: geoData.org || "Unknown"
          },
          deviceInfo: {
            browser: sanitize(result.browser),
            os: sanitize(result.os),
            device: sanitize(result.device),
            engine: sanitize(result.engine),
            cpu: sanitize(result.cpu)
          },
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timestamp: serverTimestamp()
        };

        await addDoc(collection(db, "visitors"), visitorData);
        sessionStorage.setItem("vortex_tracked", "true");
      } catch (error) {
        console.error("Visitor tracking failed:", error);
      }
    };

    trackVisitor();
  }, []);

  return null;
}

## Circadian Rhythm Clock (CRS Clock) for Bangle.js 2

### **Overview**

**Circadian Rhythm Clock** is an advanced wellness clock for Bangle.js 2 that estimates and visualizes your body’s internal circadian time and alignment. It calculates a personalized **Circadian Rhythm Score (CRS)** using your recent sleep timing, physical activity patterns, and (optionally) heart rate data. The app helps users monitor their biological rhythms, optimize their sleep, and maintain healthy light/activity habits—even on a device with limited sensors.

### **Core Features**

#### **1. Real-Time CRS Calculation**

* **CRS** is computed as a composite index using:

  * **Sleep Timing** (from sleep/wake detection or manual window)
  * **Activity Stability** (based on step data over the last 24 hours)
  * **Heart Rate Stability** (if HR sensor is enabled)
  * **Light Exposure Proxy** (counts “light hours” based on daytime activity if no light sensor is present)
* **CRS** is shown directly on the main clock face, updated every minute.

#### **2. Biological Time Display**

* Shows the current **estimated biological time (“BioTime”)** in large, clear digits.
* BioTime is adjusted using the user’s sleep phase offset and a configurable reference point (e.g., DLMO or CBTmin).

#### **3. Health and Circadian Stats**

* The main screen presents:

  * **CRS:** Current circadian rhythm score (0–100)
  * **Steps:** Total steps in the last 24 hours
  * **Mood:** Detected from heart rate variability (HRV proxy)
  * **Light:** Estimated hours of daytime activity (“light exposure”)
* All stats update automatically.

#### **4. Trend Visualization**

* **CRS Trend Chart:** Shows CRS for each hour over the past 8–12 hours in a bar graph (visually displays circadian stability).
* Helps users see the rhythm and recent disruptions.

#### **5. Automatic Sleep & Wake Detection**

* Uses step activity and (optionally) movement detection to infer sleep start/end times.
* Triggers friendly alerts when sleep or wake is detected.

#### **6. Hydration and Wellness Reminders**

* Optional periodic reminders to hydrate, based on a user-configurable interval.

#### **7. Simple Settings Menu**

* Configure:

  * Sleep window (manual entry)
  * Hydration reminder interval
  * Theme/color scheme
  * Circadian reference (DLMO/CBTmin)
  * Heart rate and sleep detection settings

#### **8. Data Export & Reset**

* Exports historical step, heart rate, and light proxy data as JSON for external analysis.
* Full app data reset available from the menu.

#### **9. Efficient and Stable Operation**

* Aggressively trims stored history to a set maximum (e.g., 200 entries) to ensure stability and prevent memory overflows.
* All heavy computations (like trend chart) are run only on-demand.

### **Sensor/Hardware Adaptation**

* If the **heart rate sensor** is unavailable or disabled, the app uses step/activity stability only.
* If **no light sensor** is present (default for Bangle.js 2), the app estimates “light exposure” as the number of hours the user is active during daytime, outside their sleep window.
* The app is robust to missing or partial data.

### **User Experience**

* **Always-on Clock:** Appears as the default watch face, with tap, button, or swipe to access stats and menu.
* **Vivid, readable interface** with color themes and a clean, minimal design.
* **Alerts** for hydration and sleep transitions are gentle and non-intrusive.


### **Intended Users**

* Anyone interested in **improving sleep, productivity, or circadian health**.
* Shift workers, travelers, or students seeking to track and align their biological clocks.
* Users who want more than a step counter—actionable, science-based feedback on internal time.

### **How It Works**

1. **Collects step and (optionally) heart rate data** in real-time.
2. **Calculates CRS** using the variability and timing of steps, sleep, and HR (if available).
3. **Estimates light exposure** hours using step data during daytime.
4. **Presents key circadian health metrics** on the main watch face.
5. **Offers friendly reminders** and data export for deeper analysis.

### **Technical Details**

* **Code:** JavaScript (Espruino), optimized for Bangle.js 2
* **Persistent storage:** Steps, heart rate, and light/“light hour” proxies saved locally, aggressively pruned for memory safety.
* **User interface:** Button/touch/swipe navigation, E.showMenu/E.showAlert for dialogs, custom clock face rendering.
* **No dependencies:** Runs entirely on the watch—no phone, no cloud required.

## Author

Jakub Tencl, Ph.D.  
[https://ihypnosis.org.uk](https://ihypnosis.org.uk)

## Patent and Licensing

This app is based on methods described in UK Patent Application GB2509149.7:  
**"Wearable Circadian Rhythm Score (CRS) System for Estimating Biological Time"**

Unless otherwise stated, this project is released under the MIT license.  
Use of the patented method may be subject to licensing or permission.  
For inquiries, contact the author.

Note: The patented method does not require licensing for non-commercial, research, educational, or personal use within the open-source community. Commercial or broad distribution beyond these uses may require permission or licensing. For such use cases, please contact the author.

### **Summary**

The Circadian Rhythm Clock transforms the Bangle.js 2 into a **bio-aware, personalized circadian dashboard**, guiding users toward better alignment with their biological clock and modern life.
It is ideal for anyone who wants to visualize and optimize their internal rhythms using open, transparent algorithms—right on their wrist.

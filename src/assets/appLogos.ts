import qaidiAppLogo from './images/qaidi_app_logo_1793979994151.jpg';
import calculatorDisguiseLogo from './images/calculator_disguise_logo_1793980010128.jpg';
import notepadDisguiseLogo from './images/notepad_disguise_logo_1793980023045.jpg';
import batteryDisguiseLogo from './images/battery_disguise_logo_1793980036551.jpg';

export const APP_LOGOS = {
  mainApp: qaidiAppLogo,
  disguises: {
    CALCULATOR: calculatorDisguiseLogo,
    NOTEPAD: notepadDisguiseLogo,
    BATTERY_HEALTH: batteryDisguiseLogo,
    WEATHER_CLEAN: notepadDisguiseLogo // fallback to clean notes/utility
  }
};

export function getDisguiseLogo(mode: 'CALCULATOR' | 'NOTEPAD' | 'BATTERY_HEALTH' | 'WEATHER_CLEAN'): string {
  return APP_LOGOS.disguises[mode] || calculatorDisguiseLogo;
}

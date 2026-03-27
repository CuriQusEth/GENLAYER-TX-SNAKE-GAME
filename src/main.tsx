import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign wallet extension/iframe proxy errors
if (typeof window !== 'undefined') {
  const suppressProps = ['isZerion', 'isRabby', 'ethereum'];

  // Wrap Object.defineProperty to catch redefinition errors
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function(obj, prop, descriptor) {
    try {
      // If it's one of our problematic properties and we're defining it on window
      if (obj === window && suppressProps.includes(prop as string)) {
        // Force it to be configurable if possible
        if (descriptor) {
          descriptor.configurable = true;
        }
      }
      return originalDefineProperty.call(Object, obj, prop, descriptor);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const isBenign = suppressProps.some(p => 
        prop === p || msg.includes(p)
      ) || msg.includes('Invalid property descriptor') || msg.includes('Cannot redefine property');

      if (isBenign) {
        // console.warn('Suppressed benign redefinition error for:', prop);
        return obj;
      }
      throw e;
    }
  };

  const originalDefineProperties = Object.defineProperties;
  Object.defineProperties = function(obj, props) {
    try {
      return originalDefineProperties.call(Object, obj, props);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const isBenign = suppressProps.some(p => 
        msg.includes(p)
      ) || msg.includes('Cannot redefine property');

      if (isBenign) {
        return obj;
      }
      throw e;
    }
  };

  if (typeof Reflect !== 'undefined' && Reflect.defineProperty) {
    const originalReflectDefineProperty = Reflect.defineProperty;
    Reflect.defineProperty = function(target, propertyKey, attributes) {
      try {
        return originalReflectDefineProperty.call(Reflect, target, propertyKey, attributes);
      } catch (e) {
        return false;
      }
    };
  }

  const originalError = console.error;
  console.error = (...args) => {
    const msg = args[0]?.toString() || '';
    const isBenign = suppressProps.some(p => msg.includes(p)) || 
      msg.includes('Invalid property descriptor') || 
      msg.includes('Cannot redefine property');
      
    if (isBenign) return;
    originalError.apply(console, args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

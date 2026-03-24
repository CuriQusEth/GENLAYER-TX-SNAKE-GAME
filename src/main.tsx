import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign wallet extension/iframe proxy errors
if (typeof window !== 'undefined') {
  // Wrap Object.defineProperty to catch redefinition errors
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function(obj, prop, descriptor) {
    if (prop === 'isZerion' || prop === 'ethereum' || prop === 'isRabby') {
      try {
        return originalDefineProperty.call(Object, obj, prop, descriptor);
      } catch (e) {
        return obj;
      }
    }
    try {
      return originalDefineProperty.call(Object, obj, prop, descriptor);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (
        msg.includes('isZerion') ||
        msg.includes('ethereum') ||
        msg.includes('Invalid property descriptor') ||
        msg.includes('Cannot redefine property')
      ) {
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
      if (
        msg.includes('isZerion') || 
        msg.includes('isRabby') || 
        msg.includes('ethereum') || 
        msg.includes('Cannot redefine property')
      ) {
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
    if (
      msg.includes('isZerion') ||
      msg.includes('isRabby') ||
      msg.includes('ethereum') ||
      msg.includes('Invalid property descriptor') ||
      msg.includes('Cannot redefine property')
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg.includes('isZerion') ||
      msg.includes('isRabby') ||
      msg.includes('ethereum') ||
      msg.includes('Invalid property descriptor') ||
      msg.includes('Cannot redefine property')
    ) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason?.message || '';
    if (
      msg.includes('isZerion') ||
      msg.includes('isRabby') ||
      msg.includes('ethereum') ||
      msg.includes('Invalid property descriptor') ||
      msg.includes('Cannot redefine property')
    ) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

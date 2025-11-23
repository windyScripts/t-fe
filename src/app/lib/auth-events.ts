type Handler = () => void;

const unauthorizedHandlers = new Set<Handler>();

export function registerUnauthorizedHandler(handler: Handler) {
  unauthorizedHandlers.add(handler);
  return () => {
    unauthorizedHandlers.delete(handler);
  };
}

export function clearUnauthorizedHandler(handler?: Handler) {
  if (handler) {
    unauthorizedHandlers.delete(handler);
  } else {
    unauthorizedHandlers.clear();
  }
}

export function notifyUnauthorized() {
  unauthorizedHandlers.forEach((handler) => {
    handler();
  });
}

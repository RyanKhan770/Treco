// Lightweight event bus for session expiry.
// Avoids a circular dep between api.jsx → store → authSlice → api.jsx.

let _onExpired = null;

export const onSessionExpired = (handler) => {
  _onExpired = handler;
};

export const emitSessionExpired = () => {
  _onExpired?.();
};

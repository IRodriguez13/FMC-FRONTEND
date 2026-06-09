export default function Logo({ size = 48, className = '', positionStyles }) {
  const estilosSeguros = positionStyles || {};


  return (
    <img
      src="/public/img/logo.png" 
      alt="Find My Coffee"
      className={className}
      style={{ 
        width: `${size}px`, 
        height: 'auto', 
        objectFit: 'contain',
        position: estilosSeguros.position || 'static',
        left: estilosSeguros.left,
        top: estilosSeguros.top,
        transform: estilosSeguros.transform,
        opacity: estilosSeguros.opacity
      }}
    />
  );
}
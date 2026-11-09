import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

export default function Barcode({
  value,
  width = 1.6,
  height = 36,
  displayValue = false,
  className = ''
}) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;

    // Sanitize value for Code 128 (e.g. replace live-preview bullets with zeros)
    const sanitized = String(value).replace(/•/g, '0').trim();
    if (!sanitized) return;

    try {
      JsBarcode(svgRef.current, sanitized, {
        format: 'CODE128',
        lineColor: '#0f172a',
        width: width,
        height: height,
        displayValue: displayValue,
        margin: 0,
        background: 'transparent'
      });
    } catch (err) {
      console.error('Barcode render error:', err);
    }
  }, [value, width, height, displayValue]);

  if (!value) return null;

  return (
    <svg ref={svgRef} className={`block max-w-full overflow-hidden ${className}`} />
  );
}

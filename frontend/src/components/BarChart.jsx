/**
 * BarChart – Responsive SVG bar chart that always fills its container.
 * Uses a fixed logical canvas width so bars scale with the container.
 */
const CANVAS_W = 600;  // logical SVG width – bars are placed within this space

const BarChart = ({
  series = [],
  labels = [],
  height = 200,
  yPrefix = '฿',
  yDivide = 1000,
  yUnit = 'k',
}) => {
  if (!labels.length || !series.length) {
    return <p className="text-gray-400 text-center py-10">ไม่มีข้อมูล</p>;
  }

  // ── layout constants (logical px units inside the viewBox)
  const Y_AXIS_W   = 48;
  const PAD_TOP    = 22;
  const PAD_RIGHT  = 10;
  const X_AXIS_H   = 28;
  const GRID_LINES = 5;

  const chartLeft   = Y_AXIS_W;
  const chartRight  = CANVAS_W - PAD_RIGHT;
  const chartTop    = PAD_TOP;
  const chartBottom = PAD_TOP + height;
  const chartW      = chartRight - chartLeft;
  const chartH      = height;
  const svgH        = PAD_TOP + height + X_AXIS_H;

  const groupCount  = labels.length;
  const seriesCount = series.length;

  // distribute groups evenly across chart width
  const GROUP_W  = chartW / groupCount;
  const BAR_AREA = GROUP_W * 0.7;           // 70% of group for bars
  const BAR_W    = Math.min(24, BAR_AREA / seriesCount);  // cap at 24px logical
  const GROUP_MARGIN = (GROUP_W - BAR_W * seriesCount) / 2;

  // ── Y-axis scale
  const allValues = series.flatMap(s => s.data);
  const maxVal    = Math.max(...allValues, 1);
  const rawStep   = maxVal / GRID_LINES;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const niceStep  = Math.ceil(rawStep / magnitude) * magnitude;
  const yMax      = niceStep * GRID_LINES;
  const toY       = (val) => chartBottom - (val / yMax) * chartH;

  return (
    <div style={{ width: '100%' }}>
      <svg
        width="100%"
        viewBox={`0 0 ${CANVAS_W} ${svgH}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block' }}
      >
        {/* ── Grid lines + Y-axis labels */}
        {Array.from({ length: GRID_LINES + 1 }).map((_, i) => {
          const val = (yMax / GRID_LINES) * (GRID_LINES - i);
          const y   = toY(val);
          return (
            <g key={i}>
              <line
                x1={chartLeft} y1={y} x2={chartRight} y2={y}
                stroke={i === GRID_LINES ? '#9ca3af' : '#e5e7eb'}
                strokeWidth={i === GRID_LINES ? 1 : 0.75}
              />
              <text
                x={chartLeft - 5} y={y + 4}
                textAnchor="end" fontSize="10" fill="#9ca3af"
              >
                {yPrefix}{(val / yDivide).toLocaleString()}{yUnit}
              </text>
            </g>
          );
        })}

        {/* ── Left axis */}
        <line x1={chartLeft} y1={chartTop} x2={chartLeft} y2={chartBottom}
          stroke="#d1d5db" strokeWidth="1" />

        {/* ── Groups of bars + X labels */}
        {labels.map((label, gi) => {
          const groupX = chartLeft + gi * GROUP_W + GROUP_MARGIN;
          const labelX = chartLeft + gi * GROUP_W + GROUP_W / 2;
          return (
            <g key={gi}>
              {/* X-axis label */}
              <text
                x={labelX} y={chartBottom + 18}
                textAnchor="middle" fontSize="11" fill="#6b7280"
              >
                {label}
              </text>

              {/* Bars */}
              {series.map((s, si) => {
                const val  = s.data[gi] ?? 0;
                const barH = Math.max((val / yMax) * chartH, val > 0 ? 1.5 : 0);
                const barX = groupX + si * BAR_W;
                const barY = chartBottom - barH;
                return (
                  <g key={si}>
                    <rect
                      x={barX} y={barY}
                      width={BAR_W - 1} height={barH}
                      fill={s.color} rx="2" opacity="0.88"
                    >
                      <title>{s.label}: {yPrefix}{val.toLocaleString()}</title>
                    </rect>
                    {barH > 16 && (
                      <text
                        x={barX + (BAR_W - 1) / 2} y={barY - 3}
                        textAnchor="middle" fontSize="9" fill="#374151"
                      >
                        {(val / yDivide).toFixed(0)}{yUnit}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* ── Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1">
        {series.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: s.color }} />
            <span className="text-xs text-gray-500">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;

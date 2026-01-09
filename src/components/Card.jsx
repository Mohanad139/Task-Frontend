export default function Card({ title, subtitle, right, children }) {
  return (
    <div className="card">
      {(title || right) && (
        <div className="card-header">
          <div>
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {subtitle && <p className="subtitle">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
}

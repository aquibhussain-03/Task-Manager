export default function Spinner({ page = false, size = 'md' }) {
  const cls = `spinner ${size === 'lg' ? 'spinner-lg' : ''}`;
  if (page) return <div className="spinner-page"><div className={cls} /></div>;
  return <div className={cls} />;
}

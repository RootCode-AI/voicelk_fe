export default function StudioPageHeader({ eyebrow, title, description }) {
  return (
    <header className="studio-page-header">
      <p className="studio-page-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="studio-page-description">{description}</p>
    </header>
  );
}

const colors = ['#1a7f7f', '#b5651d', '#5b4bb7', '#c2410c'];

export default function Avatar({ person, size = 30 }) {
  if (!person) return <span className="avatar unassigned" style={{ width: size, height: size }}>?</span>;
  const initials = person.name.split(' ').map((w) => w[0]).join('');
  return (
    <span className="avatar" title={person.name} style={{ width: size, height: size, background: colors[person.id % 4], fontSize: size * 0.4 }}>
      {initials}
    </span>
  );
}

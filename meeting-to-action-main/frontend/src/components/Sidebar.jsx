import { NavLink } from 'react-router-dom';

const links = [
  ['/home', 'Home', '⌂'], ['/new', 'New Meeting', '+'], ['/meetings', 'Meetings', '▤'],
  ['/tasks', 'Task Board', '☑'], ['/people', 'People', '☺'], ['/settings', 'Settings', '⚙'],
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand"><b>Meeting to Action</b><small>Turn conversations into action</small></div>
      <nav>
        {links.map(([to, label, icon]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => 'nav' + (isActive ? ' active' : '')}>
            <span>{icon}</span><em>{label}</em>
          </NavLink>
        ))}
      </nav>
      <p className="tag">Better meetings.<br />More done.</p>
    </aside>
  );
}
